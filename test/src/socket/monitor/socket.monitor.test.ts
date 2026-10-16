import { describe, expect, it } from 'vitest';

import {
  PREVIEW_CHARS,
  SESSION_LABEL_CHARS,
  SocketMonitor,
  TRACE_LIMIT,
  WATCH_LEASE_MS,
} from '../../../../src/socket/monitor/socket.monitor';

const eventLoop = {
  mean: 2_000_000,
  percentile: (percentile: number) => (percentile === 99 ? 5_000_000 : 0),
  enable(): void {},
  disable(): void {},
};

function createMonitor(now: () => number = () => 1_000): SocketMonitor {
  return new SocketMonitor({ now, slowEventMs: 250, eventLoop });
}

describe('socket monitor', () => {
  it('keeps counters, session label, slow events and round trip time', () => {
    let now = 1_000;
    const monitor = createMonitor(() => now);
    monitor.attach({ socketId: 's1', address: '10.0.0.8', transport: 'polling', readBuffer: () => 2 });
    monitor.setTransport('s1', 'websocket');
    monitor.noteBytes('s1', 'in', 40);
    monitor.noteBytes('s1', 'out', 80);
    monitor.notePing('s1');
    now = 1_030;
    monitor.notePong('s1');
    monitor.noteInbound(
      's1',
      's1 separar.consulta',
      '{"Session":"operador-muito-longo-demais-para-grade"}',
      1_000,
      300,
      false,
    );

    const client = monitor.snapshot().clients[0];
    expect(client.transport).toBe('websocket');
    expect(client.bytesIn).toBe(40);
    expect(client.bytesOut).toBe(80);
    expect(client.rttMs).toBe(30);
    expect(client.inCount).toBe(1);
    expect(client.slowCount).toBe(1);
    expect(client.lastDurationMs).toBe(300);
    expect(client.maxDurationMs).toBe(300);
    expect(client.lastSession).toHaveLength(SESSION_LABEL_CHARS);
    expect(client.writeBufferDepth).toBe(2);
    expect(monitor.snapshot().eventLoopDelayMs).toEqual({ mean: 2, p99: 5 });
  });

  it('keeps a lightweight history and stores the body only while the client is watched', () => {
    let now = 5_000;
    const monitor = createMonitor(() => now);
    monitor.attach({ socketId: 'a', address: '127.0.0.1', transport: 'websocket' });
    monitor.attach({ socketId: 'b', address: '127.0.0.1', transport: 'websocket' });

    monitor.noteInbound('a', 'consulta', 'abc', now, 12, false);
    monitor.noteOutbound('a', 'resposta', '{"Senha":"segredo","Nome":"Ana"}');
    const beforeWatch = monitor.detail('a');
    expect(beforeWatch?.trace).toHaveLength(2);
    expect(beforeWatch?.trace[0]).toMatchObject({ event: 'consulta', durationMs: 12, bytes: 3, preview: '' });
    expect(beforeWatch?.trace[1].preview).toBe('');
    expect(beforeWatch?.trace[1].bytes).toBeGreaterThan(0);

    monitor.noteOutbound('a', 'resposta', '{"Senha":"segredo","Nome":"Ana"}');
    const watched = monitor.detail('a');
    expect(watched?.trace).toHaveLength(3);
    expect(watched?.trace[2].preview).toContain('"Senha":"***"');
    expect(watched?.trace[2].preview).not.toContain('segredo');
    expect(watched?.trace[2].preview).toContain('Ana');

    const huge = 'x'.repeat(PREVIEW_CHARS + 400);
    monitor.noteInbound('a', 'consulta', huge, now, 10, false);
    expect(monitor.detail('a')?.trace.at(-1)?.preview).toHaveLength(PREVIEW_CHARS);

    for (let index = 0; index < TRACE_LIMIT + 5; index += 1) {
      monitor.noteInbound('a', `evento-${index}`, `corpo-${index}`, now, 1, false);
    }
    const capped = monitor.detail('a');
    expect(capped?.trace).toHaveLength(TRACE_LIMIT);
    expect(capped?.trace.some((entry) => entry.event === 'evento-0')).toBe(false);
    expect(capped?.trace.at(-1)?.event).toBe(`evento-${TRACE_LIMIT + 4}`);

    monitor.noteBroadcast('separar.consulta.listen', '{"Data":["somente-a"]}');
    expect(monitor.detail('a')?.trace.some((entry) => entry.broadcast && entry.preview.includes('somente-a'))).toBe(true);
    const other = monitor.detail('b');
    expect(other?.trace.some((entry) => entry.broadcast && entry.preview === '')).toBe(true);
    expect(other?.trace.every((entry) => !entry.preview.includes('somente-a'))).toBe(true);
    expect(monitor.snapshot().clients.find((client) => client.socketId === 'b')?.outCount).toBe(1);

    const released = monitor.detail('a');
    expect(released?.trace.some((entry) => entry.broadcast && entry.preview.includes('somente-a'))).toBe(false);
    expect(released?.trace.some((entry) => entry.broadcast && entry.event === 'separar.consulta.listen')).toBe(true);
  });

  it('stops capturing the body when the lease expires', () => {
    let now = 10_000;
    const monitor = createMonitor(() => now);
    monitor.attach({ socketId: 'a', address: '127.0.0.1', transport: 'websocket' });
    monitor.detail('a');
    monitor.noteOutbound('a', 'durante', 'dentro');
    now += WATCH_LEASE_MS;
    monitor.noteOutbound('a', 'depois', 'fora-do-aluguel');

    const detail = monitor.detail('a');
    expect(detail?.trace.some((entry) => entry.preview === 'dentro')).toBe(true);
    expect(detail?.trace.some((entry) => entry.event === 'depois' && entry.preview === '')).toBe(true);
    expect(detail?.trace.some((entry) => entry.preview === 'fora-do-aluguel')).toBe(false);
  });

  it('counts an error response and drops the client on disconnect', () => {
    const monitor = createMonitor();
    monitor.attach({ socketId: 's1', address: '10.0.0.4', transport: 'websocket' });
    monitor.noteOutbound('s1', 'resposta', '{"Session":"s","ResponseIn":"r","Error":["falhou"]}');
    expect(monitor.snapshot().clients[0].errorCount).toBe(1);
    expect(monitor.detail('s1')?.trace[0]).toMatchObject({ error: true, preview: '' });

    monitor.disconnect('s1', 'ping timeout');
    const snapshot = monitor.snapshot();
    expect(snapshot.clients).toEqual([]);
    expect(snapshot.recentDisconnects[0]).toMatchObject({
      socketId: 's1',
      reason: 'ping timeout',
    });
    expect(monitor.detail('s1')).toBeNull();
  });
});
