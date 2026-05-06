import { randomUUID } from 'crypto';
import { z } from 'zod';

import { OrderBy, Pagination } from '../../contracts/local.base.params';
import type { NormalizedSocketRequest, SocketPayloadRecord } from './normalized.socket.request';
import SocketEventKind from './socket.event.kind';

type LegacySocketRequestDefaults = {
  defaultResponseIn: string;
  defaultWhere?: unknown;
  defaultMutation?: unknown;
  eventName?: string;
  kind?: SocketEventKind;
};

const legacySocketEnvelopeSchema = z
  .object({
    Session: z.string().optional(),
    ResponseIn: z.string().optional(),
    Where: z.unknown().optional(),
    Mutation: z.unknown().optional(),
    Pagination: z.string().optional(),
    OrderBy: z.string().optional(),
  })
  .passthrough();

export default class SocketProtocolAdapter {
  static fromLegacy(data: unknown, defaults: LegacySocketRequestDefaults): NormalizedSocketRequest {
    const raw = this.normalizePayload(data);
    const parsed = legacySocketEnvelopeSchema.parse(raw);
    const pagination = Pagination.fromQueryString(parsed.Pagination);
    const orderBy = OrderBy.fromQueryString(parsed.OrderBy);
    const eventName = defaults.eventName ?? defaults.defaultResponseIn;

    return {
      requestId: randomUUID(),
      eventName,
      kind: defaults.kind ?? this.inferKind(eventName),
      raw,
      session: parsed.Session ?? '',
      responseIn:
        typeof parsed.ResponseIn === 'string' && parsed.ResponseIn.trim().length > 0
          ? parsed.ResponseIn
          : defaults.defaultResponseIn,
      where: parsed.Where ?? defaults.defaultWhere ?? '',
      mutation: this.normalizeMutation(parsed.Mutation ?? defaults.defaultMutation ?? []),
      pagination,
      orderBy,
    };
  }

  static resolveLegacyErrorContext(
    data: unknown,
    defaultResponseIn: string,
  ): Pick<NormalizedSocketRequest, 'responseIn' | 'session'> {
    try {
      const raw = this.normalizePayload(data);
      const parsed = legacySocketEnvelopeSchema.parse(raw);

      return {
        responseIn:
          typeof parsed.ResponseIn === 'string' && parsed.ResponseIn.trim().length > 0
            ? parsed.ResponseIn
            : defaultResponseIn,
        session: parsed.Session ?? '',
      };
    } catch {
      return {
        responseIn: defaultResponseIn,
        session: '',
      };
    }
  }

  private static normalizePayload(data: unknown): SocketPayloadRecord {
    if (typeof data === 'string') {
      const parsed = JSON.parse(data) as unknown;
      if (!this.isRecord(parsed)) {
        throw new Error('Invalid socket payload');
      }

      return parsed;
    }

    if (!this.isRecord(data)) {
      throw new Error('Invalid socket payload');
    }

    return data;
  }

  private static normalizeMutation(mutation: unknown): unknown[] {
    if (mutation === undefined || mutation === null) {
      return [];
    }

    return Array.isArray(mutation) ? mutation : [mutation];
  }

  private static inferKind(eventName: string): SocketEventKind {
    if (eventName.endsWith('.listen')) {
      return 'listen';
    }

    if (eventName.includes('.consulta') || eventName.endsWith('.select')) {
      return 'query';
    }

    return 'mutation';
  }

  private static isRecord(value: unknown): value is SocketPayloadRecord {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}

export type { LegacySocketRequestDefaults };
