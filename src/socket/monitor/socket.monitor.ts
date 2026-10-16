import { monitorEventLoopDelay } from 'perf_hooks';

import { getSlowEventThresholdMs } from '../protocol/socket.logger';

export const TRACE_LIMIT = 50;
export const PREVIEW_CHARS = 1024;
export const WATCH_LEASE_MS = 3000;
export const SESSION_LABEL_CHARS = 24;
export const DISCONNECT_LIMIT = 20;
export const ERROR_PREFIX_CHARS = 180;

const PREVIEW_SCAN = PREVIEW_CHARS + 512;
const SESSION_PATTERN = /"Session"\s*:\s*"([^"\\]*)"/;

export type SocketTraceDirection = 'in' | 'out';

export interface SocketTraceEntry {
  at: string;
  direction: SocketTraceDirection;
  event: string;
  durationMs: number | null;
  bytes: number;
  slow: boolean;
  error: boolean;
  broadcast: boolean;
  preview: string;
}

export interface SocketClientSummary {
  socketId: string;
  address: string;
  transport: string;
  connectedAt: string;
  lastEventAt: string | null;
  lastEvent: string;
  lastSession: string;
  inCount: number;
  outCount: number;
  errorCount: number;
  slowCount: number;
  lastDurationMs: number | null;
  maxDurationMs: number | null;
  rttMs: number | null;
  rttAt: string | null;
  bytesIn: number;
  bytesOut: number;
  writeBufferDepth: number;
}

export interface SocketDisconnectRecord {
  socketId: string;
  at: string;
  reason: string;
  connectedMs: number;
}

export interface SocketMonitorSnapshot {
  now: string;
  eventLoopDelayMs: { mean: number; p99: number };
  clients: SocketClientSummary[];
  recentDisconnects: SocketDisconnectRecord[];
}

export interface SocketClientDetail extends SocketClientSummary {
  trace: SocketTraceEntry[];
}

export interface SocketMonitorAttach {
  socketId: string;
  address: string;
  transport: string;
  readBuffer?: () => number;
}

interface EventLoopProbe {
  readonly mean: number;
  percentile(percentile: number): number;
  enable(): void;
  disable(): void;
}

export interface SocketMonitorOptions {
  now?: () => number;
  slowEventMs?: number;
  watchLeaseMs?: number;
  eventLoop?: EventLoopProbe;
}

interface LiveClient {
  socketId: string;
  address: string;
  transport: string;
  connectedAtMs: number;
  lastEventAtMs: number | null;
  lastEvent: string;
  lastSession: string;
  inCount: number;
  outCount: number;
  errorCount: number;
  slowCount: number;
  lastDurationMs: number | null;
  maxDurationMs: number | null;
  rttMs: number | null;
  rttAtMs: number | null;
  bytesIn: number;
  bytesOut: number;
  pingSentAtMs: number | null;
  cachedBufferDepth: number;
  readBuffer: () => number;
  trace: SocketTraceEntry[];
}

interface TraceDraft {
  direction: SocketTraceDirection;
  event: string;
  payload: unknown;
  atMs: number;
  durationMs: number | null;
  slow: boolean;
  error: boolean;
  broadcast: boolean;
}

let singleton: SocketMonitor | null = null;

export function getSocketMonitor(): SocketMonitor {
  if (!singleton) {
    singleton = new SocketMonitor();
  }
  return singleton;
}

export class SocketMonitor {
  private readonly clients = new Map<string, LiveClient>();
  private readonly disconnects: SocketDisconnectRecord[] = [];
  private readonly now: () => number;
  private readonly slowEventMs: number;
  private readonly watchLeaseMs: number;
  private readonly eventLoop: EventLoopProbe;
  private readonly ownsEventLoop: boolean;
  private watchedId: string | null = null;
  private watchUntilMs = 0;

  constructor(options: SocketMonitorOptions = {}) {
    this.now = options.now ?? Date.now;
    this.slowEventMs = options.slowEventMs ?? getSlowEventThresholdMs();
    this.watchLeaseMs = options.watchLeaseMs ?? WATCH_LEASE_MS;
    if (options.eventLoop) {
      this.eventLoop = options.eventLoop;
      this.ownsEventLoop = false;
    } else {
      const histogram = monitorEventLoopDelay({ resolution: 20 });
      histogram.enable();
      this.eventLoop = histogram;
      this.ownsEventLoop = true;
    }
  }

  public stop(): void {
    if (this.ownsEventLoop) {
      this.eventLoop.disable();
    }
  }

  public attach(input: SocketMonitorAttach): void {
    const existing = this.clients.get(input.socketId);
    if (existing) {
      existing.address = input.address;
      existing.transport = input.transport;
      if (input.readBuffer) {
        existing.readBuffer = input.readBuffer;
      }
      return;
    }

    const connectedAtMs = this.now();
    this.clients.set(input.socketId, {
      socketId: input.socketId,
      address: input.address,
      transport: input.transport,
      connectedAtMs,
      lastEventAtMs: null,
      lastEvent: '',
      lastSession: '',
      inCount: 0,
      outCount: 0,
      errorCount: 0,
      slowCount: 0,
      lastDurationMs: null,
      maxDurationMs: null,
      rttMs: null,
      rttAtMs: null,
      bytesIn: 0,
      bytesOut: 0,
      pingSentAtMs: null,
      cachedBufferDepth: 0,
      readBuffer: input.readBuffer ?? (() => 0),
      trace: [],
    });
  }

  public setTransport(socketId: string, transport: string): void {
    const client = this.clients.get(socketId);
    if (!client) {
      return;
    }
    client.transport = transport;
  }

  public rememberBufferDepth(socketId: string, depth: number): void {
    const client = this.clients.get(socketId);
    if (!client || !Number.isFinite(depth) || depth < 0) {
      return;
    }
    client.cachedBufferDepth = depth;
  }

  public noteBytes(socketId: string, direction: SocketTraceDirection, bytes: number): void {
    const client = this.clients.get(socketId);
    if (!client || !Number.isFinite(bytes) || bytes <= 0) {
      return;
    }
    if (direction === 'in') {
      client.bytesIn += bytes;
      return;
    }
    client.bytesOut += bytes;
  }

  public notePing(socketId: string): void {
    const client = this.clients.get(socketId);
    if (!client) {
      return;
    }
    client.pingSentAtMs = this.now();
  }

  public notePong(socketId: string): void {
    const client = this.clients.get(socketId);
    if (!client || client.pingSentAtMs == null) {
      return;
    }
    client.rttMs = Math.max(0, this.now() - client.pingSentAtMs);
    client.rttAtMs = this.now();
    client.pingSentAtMs = null;
  }

  public noteInbound(
    socketId: string,
    event: string,
    payload: unknown,
    startedAtMs: number,
    durationMs: number,
    failed: boolean,
  ): void {
    const client = this.clients.get(socketId);
    if (!client) {
      return;
    }

    const finishedAt = this.now();
    client.inCount += 1;
    client.lastEventAtMs = finishedAt;
    client.lastEvent = event;
    const session = readSession(payload);
    if (session) {
      client.lastSession = session;
    }
    client.lastDurationMs = durationMs;
    client.maxDurationMs = client.maxDurationMs == null ? durationMs : Math.max(client.maxDurationMs, durationMs);
    const slow = durationMs >= this.slowEventMs;
    if (slow) {
      client.slowCount += 1;
    }
    if (failed) {
      client.errorCount += 1;
    }
    this.pushTrace(client, {
      direction: 'in',
      event,
      payload,
      atMs: startedAtMs,
      durationMs,
      slow,
      error: failed,
      broadcast: false,
    });
  }

  public noteOutbound(socketId: string, event: string, payload: unknown): void {
    const client = this.clients.get(socketId);
    if (!client) {
      return;
    }
    client.outCount += 1;
    const error = looksLikeError(payload);
    if (error) {
      client.errorCount += 1;
    }
    this.pushTrace(client, {
      direction: 'out',
      event,
      payload,
      atMs: this.now(),
      durationMs: null,
      slow: false,
      error,
      broadcast: false,
    });
  }

  public noteBroadcast(event: string, payload: unknown): void {
    const error = looksLikeError(payload);
    const watchedId = this.activeWatchId();
    const captured = watchedId ? buildPreview(payload) : null;
    const bytes = captured?.bytes ?? measureBytes(payload);
    const at = new Date(this.now()).toISOString();
    for (const client of this.clients.values()) {
      client.outCount += 1;
      if (error) {
        client.errorCount += 1;
      }
      this.appendTrace(client, {
        at,
        direction: 'out',
        event,
        durationMs: null,
        bytes,
        slow: false,
        error,
        broadcast: true,
        preview: client.socketId === watchedId ? (captured?.preview ?? '') : '',
      });
    }
  }

  public disconnect(socketId: string, reason: string): void {
    const client = this.clients.get(socketId);
    if (!client) {
      return;
    }
    this.clients.delete(socketId);
    if (this.watchedId === socketId) {
      this.watchedId = null;
      this.watchUntilMs = 0;
    }
    this.disconnects.unshift({
      socketId,
      at: new Date(this.now()).toISOString(),
      reason,
      connectedMs: Math.max(0, this.now() - client.connectedAtMs),
    });
    if (this.disconnects.length > DISCONNECT_LIMIT) {
      this.disconnects.length = DISCONNECT_LIMIT;
    }
  }

  public detail(socketId: string): SocketClientDetail | null {
    const client = this.clients.get(socketId);
    if (!client) {
      return null;
    }
    this.armWatch(socketId);
    return this.toDetail(client);
  }

  public snapshot(): SocketMonitorSnapshot {
    return {
      now: new Date(this.now()).toISOString(),
      eventLoopDelayMs: this.eventLoopDelayMs(),
      clients: [...this.clients.values()].map((client) => this.toSummary(client)),
      recentDisconnects: this.disconnects.map((record) => ({ ...record })),
    };
  }

  private armWatch(socketId: string): void {
    if (this.watchedId && this.watchedId !== socketId) {
      this.releasePreviews(this.watchedId);
    }
    this.watchedId = socketId;
    this.watchUntilMs = this.now() + this.watchLeaseMs;
  }

  private activeWatchId(): string | null {
    if (!this.watchedId || this.now() >= this.watchUntilMs) {
      return null;
    }
    return this.watchedId;
  }

  private isWatched(socketId: string): boolean {
    return this.activeWatchId() === socketId;
  }

  private releasePreviews(socketId: string): void {
    const client = this.clients.get(socketId);
    if (!client) {
      return;
    }
    client.trace = client.trace.map((entry) => (entry.preview ? { ...entry, preview: '' } : entry));
  }

  private pushTrace(client: LiveClient, draft: TraceDraft): void {
    const captured = this.isWatched(client.socketId) ? buildPreview(draft.payload) : null;
    this.appendTrace(client, {
      at: new Date(draft.atMs).toISOString(),
      direction: draft.direction,
      event: draft.event,
      durationMs: draft.durationMs,
      bytes: captured?.bytes ?? measureBytes(draft.payload),
      slow: draft.slow,
      error: draft.error,
      broadcast: draft.broadcast,
      preview: captured?.preview ?? '',
    });
  }

  private appendTrace(client: LiveClient, entry: SocketTraceEntry): void {
    client.trace.push(entry);
    if (client.trace.length > TRACE_LIMIT) {
      client.trace.shift();
    }
  }

  private toSummary(client: LiveClient): SocketClientSummary {
    return {
      socketId: client.socketId,
      address: client.address,
      transport: client.transport,
      connectedAt: new Date(client.connectedAtMs).toISOString(),
      lastEventAt: client.lastEventAtMs == null ? null : new Date(client.lastEventAtMs).toISOString(),
      lastEvent: client.lastEvent,
      lastSession: client.lastSession,
      inCount: client.inCount,
      outCount: client.outCount,
      errorCount: client.errorCount,
      slowCount: client.slowCount,
      lastDurationMs: client.lastDurationMs,
      maxDurationMs: client.maxDurationMs,
      rttMs: client.rttMs,
      rttAt: client.rttAtMs == null ? null : new Date(client.rttAtMs).toISOString(),
      bytesIn: client.bytesIn,
      bytesOut: client.bytesOut,
      writeBufferDepth: this.bufferDepth(client),
    };
  }

  private toDetail(client: LiveClient): SocketClientDetail {
    return {
      ...this.toSummary(client),
      trace: client.trace.map((entry) => ({ ...entry })),
    };
  }

  private bufferDepth(client: LiveClient): number {
    try {
      const depth = client.readBuffer();
      if (Number.isFinite(depth) && depth >= 0) {
        return depth;
      }
    } catch {
      return client.cachedBufferDepth;
    }
    return client.cachedBufferDepth;
  }

  private eventLoopDelayMs(): { mean: number; p99: number } {
    return {
      mean: roundMs(this.eventLoop.mean / 1e6),
      p99: roundMs(this.eventLoop.percentile(99) / 1e6),
    };
  }
}

function roundMs(value: number): number {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }
  return Math.round(value * 10) / 10;
}

function readSession(payload: unknown): string {
  if (typeof payload === 'string') {
    const match = SESSION_PATTERN.exec(payload.slice(0, 240));
    return match?.[1]?.slice(0, SESSION_LABEL_CHARS) ?? '';
  }
  if (isRecord(payload)) {
    const session = payload.Session;
    if (typeof session === 'string') {
      return session.slice(0, SESSION_LABEL_CHARS);
    }
  }
  return '';
}

function looksLikeError(payload: unknown): boolean {
  if (typeof payload === 'string') {
    return payload.slice(0, ERROR_PREFIX_CHARS).includes('"Error"');
  }
  return isRecord(payload) && Object.prototype.hasOwnProperty.call(payload, 'Error');
}

function measureBytes(payload: unknown): number {
  return Buffer.byteLength(payloadToText(payload));
}

function buildPreview(payload: unknown): { preview: string; bytes: number } {
  const raw = payloadToText(payload);
  const bytes = Buffer.byteLength(raw);
  const secretPattern = /"(Senha|Password|Token|Authorization|Secret|ApiKey)"\s*:\s*"(?:\\.|[^"\\])*"/gi;
  const redacted = raw.slice(0, PREVIEW_SCAN).replace(secretPattern, (_match, key: string) => `"${key}":"***"`);
  return { preview: redacted.slice(0, PREVIEW_CHARS), bytes };
}

function payloadToText(payload: unknown): string {
  if (typeof payload === 'string') {
    return payload;
  }
  if (payload == null) {
    return '';
  }
  if (typeof payload === 'number' || typeof payload === 'boolean') {
    return String(payload);
  }
  try {
    return JSON.stringify(payload);
  } catch {
    return '';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
