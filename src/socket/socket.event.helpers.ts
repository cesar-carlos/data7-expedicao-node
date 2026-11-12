import { Server as SocketIOServer, Socket } from 'socket.io';

import SocketErrorCode from './protocol/socket.error.code';
import { logSocketDuration, logSocketError } from './protocol/socket.logger';
import type { NormalizedSocketRequest } from './protocol/normalized.socket.request';
import SocketProtocolAdapter, { type LegacySocketRequestDefaults } from './protocol/socket.protocol.adapter';
import SocketResponseBuilder from './protocol/socket.response.builder';
import { classifyClientError, SocketClientError } from '../utils/repository.error';
import {
  enterSocketSqlScope,
  leaveSocketSqlScope,
  runWithSqlScope,
} from '../infra/sql.request.scope';

type ParsedSocketEventPayload = {
  raw: Record<string, unknown>;
  session: string;
  responseIn: string;
  where: unknown;
  mutation: unknown[];
  pagination: NormalizedSocketRequest['pagination'];
  orderBy: NormalizedSocketRequest['orderBy'];
};

type SocketHandlerOptions = LegacySocketRequestDefaults;

type SocketHandlerContext = {
  request: NormalizedSocketRequest;
  emitQuery: (data: unknown) => void;
  emitMutation: (mutation: unknown[]) => void;
  emitError: (error: unknown, errorCode?: SocketErrorCode) => void;
  emitListen: (io: SocketIOServer, channel: string, payload: unknown) => void;
  serialize: (payload: unknown) => string;
};

export type { ParsedSocketEventPayload, SocketHandlerContext };

export type ConvertSocketMutationOptions = {
  eventName: string;
  requiredKeys?: string[];
  /**
   * Quando true, `Mutation` omitida/ausente (`[]` após normalizeMutation) vira `[]` em vez de erro.
   * Útil para fluxos em lote (ex.: cancelamento) que disparam o mesmo evento mesmo sem linhas.
   */
  allowEmpty?: boolean;
};

export function parseSocketEventPayload(
  data: unknown,
  defaults: LegacySocketRequestDefaults,
): ParsedSocketEventPayload {
  const request = SocketProtocolAdapter.fromLegacy(data, defaults);

  return {
    raw: request.raw,
    session: request.session,
    responseIn: request.responseIn,
    where: request.where,
    mutation: request.mutation,
    pagination: request.pagination,
    orderBy: request.orderBy,
  };
}

export function getSocketPayloadOrEmitError(
  socket: Socket,
  data: unknown,
  defaults: LegacySocketRequestDefaults,
): ParsedSocketEventPayload | null {
  try {
    return parseSocketEventPayload(data, defaults);
  } catch (error) {
    const context = resolveSocketErrorContext(data, defaults.defaultResponseIn);
    emitSocketError(socket, context.responseIn, context.session, error, SocketErrorCode.INVALID_PAYLOAD);
    return null;
  }
}

export async function withSocketRequest(
  socket: Socket,
  data: unknown,
  defaults: SocketHandlerOptions,
  handler: (context: SocketHandlerContext) => Promise<void>,
): Promise<void> {
  const startedAt = Date.now();
  let request: NormalizedSocketRequest;

  try {
    request = SocketProtocolAdapter.fromLegacy(data, defaults);
  } catch (error) {
    const context = resolveSocketErrorContext(data, defaults.defaultResponseIn);
    emitSocketError(socket, context.responseIn, context.session, error, SocketErrorCode.INVALID_PAYLOAD);
    return;
  }

  let listenCount = 0;
  let rowCount = 0;
  let listenRows = 0;

  const context: SocketHandlerContext = {
    request,
    emitQuery(queryData) {
      rowCount = countRows(queryData);
      emitToSocket(
        socket,
        request.responseIn,
        SocketResponseBuilder.serialize(SocketResponseBuilder.query(request, queryData)),
      );
    },
    emitMutation(mutationData) {
      rowCount = countRows(mutationData);
      emitToSocket(
        socket,
        request.responseIn,
        SocketResponseBuilder.serialize(SocketResponseBuilder.mutation(request, mutationData)),
      );
    },
    emitError(error, errorCode = SocketErrorCode.INTERNAL_ERROR) {
      emitSocketError(socket, request.responseIn, request.session, error, errorCode, request.requestId, request.eventName);
    },
    emitListen(io, channel, payload) {
      listenCount++;
      listenRows += countListenRows(payload);
      // Os outros coletores escutam este canal. O corpo precisa ser só as linhas alteradas.
      io.emit(channel, SocketResponseBuilder.serialize(payload));
    },
    serialize(payload) {
      return SocketResponseBuilder.serialize(payload);
    },
  };

  const sqlScope = enterSocketSqlScope(socket);
  try {
    await runWithSqlScope(sqlScope, () => handler(context));
    logSocketDuration({
      event: request.eventName,
      socketId: socket.id,
      responseIn: request.responseIn,
      requestId: request.requestId,
      durationMs: Date.now() - startedAt,
      rows: rowCount,
      listenRows,
      status: 'ok',
      listenCount,
    });
  } catch (error) {
    emitSocketError(
      socket,
      request.responseIn,
      request.session,
      error,
      classifyClientError(error).code,
      request.requestId,
      request.eventName,
      Date.now() - startedAt,
      listenCount,
      rowCount,
      listenRows,
    );
  } finally {
    leaveSocketSqlScope(socket, sqlScope);
  }
}

export { normalizeExpedicaoItemSequenceKey } from '../utils/expedicao.item.sequence';

export function mutationBasicListenPayload(
  items: Array<{ toJson: () => unknown }>,
  request: { session: string; responseIn: string },
): Record<string, unknown> {
  return {
    Session: request.session,
    ResponseIn: request.responseIn,
    Mutation: items.map((item) => item.toJson()),
  };
}

export function convertSocketMutationPayload<T>(
  mutations: unknown[] | unknown,
  mapper: (mutation: any) => T,
  options: ConvertSocketMutationOptions,
): T[] {
  const normalizedMutations = Array.isArray(mutations) ? mutations : [mutations];

  if (normalizedMutations.length === 0) {
    if (options.allowEmpty === true) {
      return [];
    }
    throw new SocketClientError(
      `Invalid mutation payload for ${options.eventName}: expected at least one item`,
      SocketErrorCode.INVALID_PAYLOAD,
    );
  }

  return normalizedMutations.map((mutation, index) => {
    if (!isRecord(mutation)) {
      throw new SocketClientError(
        `Invalid mutation payload for ${options.eventName}: item ${index} must be an object`,
        SocketErrorCode.INVALID_PAYLOAD,
      );
    }

    for (const key of options.requiredKeys ?? []) {
      const value = mutation[key];
      if (value === undefined || value === null || (typeof value === 'string' && value.trim().length === 0)) {
        throw new SocketClientError(
          `Invalid mutation payload for ${options.eventName}: missing ${key} on item ${index}`,
          SocketErrorCode.INVALID_PAYLOAD,
        );
      }
    }

    try {
      return mapper(mutation);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new SocketClientError(
        `Invalid mutation payload for ${options.eventName}: ${message}`,
        SocketErrorCode.INVALID_PAYLOAD,
      );
    }
  });
}

export async function mapWithConcurrency<TInput, TOutput>(
  items: TInput[],
  mapper: (item: TInput, index: number) => Promise<TOutput>,
  concurrency = getSocketRefreshConcurrency(),
): Promise<TOutput[]> {
  if (items.length === 0) {
    return [];
  }

  const limit = Math.max(1, Math.floor(concurrency));
  const results: TOutput[] = new Array(items.length);
  let cursor = 0;

  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await mapper(items[index], index);
    }
  });

  await Promise.all(workers);
  return results;
}

export function requireSequenceValue(
  sequence: { Valor?: number } | null | undefined,
  label: string,
): number {
  const value = sequence?.Valor;
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    throw new SocketClientError(`Sequencia indisponivel (${label}).`, SocketErrorCode.INTERNAL_ERROR);
  }
  return value;
}

export function socketWhereHasKey(where: unknown, key: string): boolean {
  const sqlText = legacyWhereSqlText(where);
  if (sqlText !== undefined) {
    return sqlFragmentHasKey(sqlText, key);
  }
  if (!Array.isArray(where)) return false;
  return where.some((item) => {
    if (!isRecord(item) || item.key !== key) return false;
    const value = item.value;
    if (value === undefined || value === null) return false;
    if (typeof value === 'string' && value.trim().length === 0) return false;
    if (typeof value === 'number' && value === 0) return false;
    return true;
  });
}

function legacyWhereSqlText(where: unknown): string | undefined {
  if (typeof where === 'string') return where;
  if (Array.isArray(where) && where.length > 0 && typeof where[0] === 'string') {
    return where.join(' AND ');
  }
  return undefined;
}

function sqlFragmentHasKey(sql: string, key: string): boolean {
  const ident = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(
    `(?:^|[^\\w])(?:[\\w]+\\.)?(?:\\[${ident}\\]|${ident})\\s*=\\s*(?:N?'([^']*)'|([+-]?\\d+(?:\\.\\d+)?))`,
    'ig',
  );
  let match = pattern.exec(sql);
  while (match) {
    const value = match[1] ?? match[2];
    if (value !== undefined && value.trim() !== '' && Number(value) !== 0) {
      return true;
    }
    match = pattern.exec(sql);
  }
  return false;
}

export function assertSocketWhereHasKey(where: unknown, key: string, eventName: string): void {
  if (!socketWhereHasKey(where, key)) {
    throw new SocketClientError(`${eventName} exige ${key} no Where.`, SocketErrorCode.INVALID_PAYLOAD);
  }
}

export function sequenceNameFromWhere(where: unknown): string {
  if (typeof where === 'string' && where.trim().length > 0) {
    return where.trim();
  }
  if (Array.isArray(where) && where.length > 0) {
    const first = where[0];
    if (typeof first === 'string' && first.trim().length > 0) {
      return first.trim();
    }
    if (isRecord(first)) {
      const value = first.value ?? first.Nome ?? first.Name;
      if (typeof value === 'string' && value.trim().length > 0) {
        return value.trim();
      }
    }
  }
  if (isRecord(where)) {
    const value = where.value ?? where.Nome ?? where.Name;
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  throw new SocketClientError('Where da sequencia deve informar o nome.', SocketErrorCode.INVALID_PAYLOAD);
}

export function emitSocketQueryResponse(
  socket: Socket,
  request: Pick<NormalizedSocketRequest, 'session' | 'responseIn'>,
  data: unknown,
): void {
  emitToSocket(socket, request.responseIn, SocketResponseBuilder.serialize(SocketResponseBuilder.query(request, data)));
}

export function emitSocketMutationResponse(
  socket: Socket,
  request: Pick<NormalizedSocketRequest, 'session' | 'responseIn'>,
  mutation: unknown[],
): void {
  emitToSocket(
    socket,
    request.responseIn,
    SocketResponseBuilder.serialize(SocketResponseBuilder.mutation(request, mutation)),
  );
}

export function emitSocketError(
  socket: Socket,
  responseIn: string,
  session: string,
  error: unknown,
  errorCode: SocketErrorCode = SocketErrorCode.INTERNAL_ERROR,
  requestId?: string,
  event?: string,
  durationMs?: number,
  listenCount = 0,
  rows = 0,
  listenRows = 0,
): void {
  const classified = classifyClientError(error, errorCode);
  emitToSocket(
    socket,
    responseIn,
    SocketResponseBuilder.serialize(
      SocketResponseBuilder.error(
        { responseIn, session },
        [classified.clientMessage],
        {
          code: classified.code,
          requestId,
        },
      ),
    ),
  );

  logSocketError('Socket handler failed', {
    event,
    socketId: socket.id,
    responseIn,
    requestId,
    durationMs,
    rows,
    listenRows,
    status: 'error',
    listenCount,
    errorCode: classified.code,
    error: classified.diagnostic && classified.diagnostic !== classified.clientMessage
      ? `${classified.clientMessage} | ${classified.diagnostic}`
      : classified.clientMessage,
  });
}

export function resolveSocketErrorContext(
  data: unknown,
  defaultResponseIn: string,
): { responseIn: string; session: string } {
  return SocketProtocolAdapter.resolveLegacyErrorContext(data, defaultResponseIn);
}

function emitToSocket(socket: Socket, responseIn: string, payload: string): void {
  if (!socket.connected) {
    return;
  }
  socket.emit(responseIn, payload);
}

function countRows(value: unknown): number {
  return Array.isArray(value) ? value.length : 0;
}

function countListenRows(payload: unknown): number {
  if (!isRecord(payload)) return 0;
  const mutation = payload.Mutation;
  return Array.isArray(mutation) ? mutation.length : 0;
}

function getSocketRefreshConcurrency(): number {
  const raw = Number(process.env.SOCKET_REFRESH_CONCURRENCY);
  return Number.isFinite(raw) && raw > 0 ? raw : 4;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
