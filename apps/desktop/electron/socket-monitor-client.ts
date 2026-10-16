import { z } from 'zod';

import type { SocketClientDetail, SocketMonitorDetailView, SocketMonitorSnapshot, SocketMonitorView } from '../shared/ipc-contract';

const STOPPED_MESSAGE = 'O serviço está parado.';
const UNREACHABLE_MESSAGE = 'Não foi possível consultar os clientes.';

const traceSchema = z.object({
  at: z.string(),
  direction: z.enum(['in', 'out']),
  event: z.string(),
  durationMs: z.number().nullable(),
  bytes: z.number(),
  slow: z.boolean(),
  error: z.boolean(),
  broadcast: z.boolean(),
  preview: z.string(),
});

const summarySchema = z.object({
  socketId: z.string(),
  address: z.string(),
  transport: z.string(),
  connectedAt: z.string(),
  lastEventAt: z.string().nullable(),
  lastEvent: z.string(),
  lastSession: z.string(),
  inCount: z.number(),
  outCount: z.number(),
  errorCount: z.number(),
  slowCount: z.number(),
  lastDurationMs: z.number().nullable(),
  maxDurationMs: z.number().nullable(),
  rttMs: z.number().nullable(),
  rttAt: z.string().nullable(),
  bytesIn: z.number(),
  bytesOut: z.number(),
  writeBufferDepth: z.number(),
});

const snapshotSchema = z.object({
  now: z.string(),
  eventLoopDelayMs: z.object({
    mean: z.number(),
    p99: z.number(),
  }),
  clients: z.array(summarySchema),
  recentDisconnects: z.array(
    z.object({
      socketId: z.string(),
      at: z.string(),
      reason: z.string(),
      connectedMs: z.number(),
    }),
  ),
});

const detailSchema = summarySchema.extend({
  trace: z.array(traceSchema),
});

export function monitorSnapshotUrl(port: number): string {
  return `http://127.0.0.1:${port}/internal/sockets`;
}

export function monitorDetailUrl(port: number, socketId: string): string {
  return `http://127.0.0.1:${port}/internal/sockets/${encodeURIComponent(socketId)}`;
}

export function stoppedSocketMonitorView(message = STOPPED_MESSAGE): SocketMonitorView {
  return { available: false, message, snapshot: null };
}

export function stoppedSocketDetailView(message = STOPPED_MESSAGE): SocketMonitorDetailView {
  return { available: false, message, client: null };
}

export async function readSocketSnapshot(port: number, fetcher: typeof fetch = fetch): Promise<SocketMonitorView> {
  if (!Number.isInteger(port) || port <= 0) {
    return stoppedSocketMonitorView();
  }
  try {
    const response = await fetcher(monitorSnapshotUrl(port), { signal: AbortSignal.timeout(800) });
    if (!response.ok) {
      return stoppedSocketMonitorView(UNREACHABLE_MESSAGE);
    }
    const snapshot = parseSnapshot(await readJson(response));
    if (!snapshot) {
      return stoppedSocketMonitorView('Resposta do monitor inválida.');
    }
    return { available: true, message: '', snapshot };
  } catch {
    return stoppedSocketMonitorView(UNREACHABLE_MESSAGE);
  }
}

export async function readSocketDetail(
  port: number,
  socketId: string,
  fetcher: typeof fetch = fetch,
): Promise<SocketMonitorDetailView> {
  if (!Number.isInteger(port) || port <= 0) {
    return stoppedSocketDetailView();
  }
  if (socketId.trim().length === 0) {
    return { available: true, message: '', client: null };
  }
  try {
    const response = await fetcher(monitorDetailUrl(port, socketId), { signal: AbortSignal.timeout(800) });
    if (response.status === 404) {
      return { available: true, message: 'Este cliente saiu.', client: null };
    }
    if (!response.ok) {
      return stoppedSocketDetailView(UNREACHABLE_MESSAGE);
    }
    const client = parseDetail(await readJson(response));
    if (!client) {
      return stoppedSocketDetailView('Resposta do monitor inválida.');
    }
    return { available: true, message: '', client };
  } catch {
    return stoppedSocketDetailView(UNREACHABLE_MESSAGE);
  }
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function parseSnapshot(payload: unknown): SocketMonitorSnapshot | null {
  const parsed = snapshotSchema.safeParse(payload);
  return parsed.success ? parsed.data : null;
}

function parseDetail(payload: unknown): SocketClientDetail | null {
  const parsed = detailSchema.safeParse(payload);
  return parsed.success ? parsed.data : null;
}
