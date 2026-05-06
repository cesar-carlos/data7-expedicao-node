import { Server as SocketIOServer, Socket } from 'socket.io';

import SocketErrorCode from './protocol/socket.error.code';
import { logSocketDuration, logSocketError, logSocketLifecycle } from './protocol/socket.logger';
import type { NormalizedSocketRequest } from './protocol/normalized.socket.request';
import SocketProtocolAdapter, { type LegacySocketRequestDefaults } from './protocol/socket.protocol.adapter';
import SocketResponseBuilder from './protocol/socket.response.builder';

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

type ConvertSocketMutationOptions = {
  eventName: string;
  requiredKeys?: string[];
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

  const context: SocketHandlerContext = {
    request,
    emitQuery(queryData) {
      socket.emit(
        request.responseIn,
        SocketResponseBuilder.serialize(SocketResponseBuilder.query(request, queryData)),
      );
    },
    emitMutation(mutationData) {
      socket.emit(
        request.responseIn,
        SocketResponseBuilder.serialize(SocketResponseBuilder.mutation(request, mutationData)),
      );
    },
    emitError(error, errorCode = SocketErrorCode.INTERNAL_ERROR) {
      emitSocketError(socket, request.responseIn, request.session, error, errorCode, request.requestId, request.eventName);
    },
    emitListen(io, channel, payload) {
      listenCount++;
      io.emit(channel, SocketResponseBuilder.serialize(payload));
    },
    serialize(payload) {
      return SocketResponseBuilder.serialize(payload);
    },
  };

  try {
    await handler(context);
    logSocketDuration({
      event: request.eventName,
      socketId: socket.id,
      responseIn: request.responseIn,
      requestId: request.requestId,
      durationMs: Date.now() - startedAt,
      status: 'ok',
      listenCount,
    });
  } catch (error) {
    emitSocketError(
      socket,
      request.responseIn,
      request.session,
      error,
      SocketErrorCode.INTERNAL_ERROR,
      request.requestId,
      request.eventName,
      Date.now() - startedAt,
      listenCount,
    );
  }
}

export { normalizeExpedicaoItemSequenceKey } from '../utils/expedicao.item.sequence';

export function convertSocketMutationPayload<T>(
  mutations: unknown[] | unknown,
  mapper: (mutation: any) => T,
  options: ConvertSocketMutationOptions,
): T[] {
  const normalizedMutations = Array.isArray(mutations) ? mutations : [mutations];

  if (normalizedMutations.length === 0) {
    throw new Error(`Invalid mutation payload for ${options.eventName}: expected at least one item`);
  }

  return normalizedMutations.map((mutation, index) => {
    if (!isRecord(mutation)) {
      throw new Error(`Invalid mutation payload for ${options.eventName}: item ${index} must be an object`);
    }

    for (const key of options.requiredKeys ?? []) {
      const value = mutation[key];
      if (value === undefined || value === null || (typeof value === 'string' && value.trim().length === 0)) {
        throw new Error(`Invalid mutation payload for ${options.eventName}: missing ${key} on item ${index}`);
      }
    }

    try {
      return mapper(mutation);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Invalid mutation payload for ${options.eventName}: ${message}`);
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

export function emitSocketQueryResponse(
  socket: Socket,
  request: Pick<NormalizedSocketRequest, 'session' | 'responseIn'>,
  data: unknown,
): void {
  socket.emit(request.responseIn, SocketResponseBuilder.serialize(SocketResponseBuilder.query(request, data)));
}

export function emitSocketMutationResponse(
  socket: Socket,
  request: Pick<NormalizedSocketRequest, 'session' | 'responseIn'>,
  mutation: unknown[],
): void {
  socket.emit(request.responseIn, SocketResponseBuilder.serialize(SocketResponseBuilder.mutation(request, mutation)));
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
): void {
  const messages = normalizeSocketError(error);
  socket.emit(
    responseIn,
    SocketResponseBuilder.serialize(
      SocketResponseBuilder.error(
        { responseIn, session },
        messages,
        {
          code: errorCode,
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
    status: 'error',
    listenCount,
    errorCode,
    error: messages.join(' | '),
  });
}

export function resolveSocketErrorContext(
  data: unknown,
  defaultResponseIn: string,
): { responseIn: string; session: string } {
  return SocketProtocolAdapter.resolveLegacyErrorContext(data, defaultResponseIn);
}

export function logSocketAuthFailure(socket: Socket, reason: string): void {
  logSocketLifecycle('Socket authentication failed', {
    socketId: socket.id,
    status: 'unauthorized',
    reason,
  }, 'warn');
}

function normalizeSocketError(error: unknown): string[] {
  if (Array.isArray(error)) {
    const messages = error
      .map((item) => (typeof item === 'string' ? item : item instanceof Error ? item.message : String(item)))
      .filter((message) => message.length > 0);

    return messages.length > 0 ? messages : ['Unexpected socket error'];
  }

  if (error instanceof Error) {
    return [error.message];
  }

  if (typeof error === 'string') {
    return [error];
  }

  return ['Unexpected socket error'];
}

function getSocketRefreshConcurrency(): number {
  const raw = Number(process.env.SOCKET_REFRESH_CONCURRENCY);
  return Number.isFinite(raw) && raw > 0 ? raw : 4;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
