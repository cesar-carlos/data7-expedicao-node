import { describe, it, expect, vi, afterEach } from 'vitest';
import type { Server as SocketIOServer } from 'socket.io';

import SepararPeriodicListenService from '../../../src/services/separar.periodic.listen.service';

function createMockIo(socketCount: number) {
  const sockets = new Map<string, unknown>();
  for (let i = 0; i < socketCount; i += 1) {
    sockets.set(`id-${i}`, {});
  }
  return {
    sockets: { sockets },
    emit: vi.fn(),
  } as unknown as SocketIOServer;
}

function row(empresa: number, separar: number) {
  return {
    toJson: () => ({
      CodEmpresa: empresa,
      CodSepararEstoque: separar,
    }),
  };
}

async function flushAsyncMicrotasks() {
  await Promise.resolve();
  await Promise.resolve();
}

describe('SepararPeriodicListenService', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should not consult repository when no sockets are connected', async () => {
    vi.useFakeTimers();
    const consulta = vi.fn();
    const io = createMockIo(0);
    const svc = new SepararPeriodicListenService(io, {
      intervalMs: 8000,
      limit: 20,
      debug: false,
      repository: { consulta } as never,
    });

    svc.start();
    await flushAsyncMicrotasks();

    expect(consulta).not.toHaveBeenCalled();
    svc.stop();
  });

  it('should emit separar.consulta.listen when payload changes on next tick', async () => {
    vi.useFakeTimers();
    let tick = 0;
    const consulta = vi.fn().mockImplementation(async () => {
      tick += 1;
      return tick === 1 ? [row(1, 100)] : [row(1, 101)];
    });
    const io = createMockIo(1);
    const emit = (io as unknown as { emit: ReturnType<typeof vi.fn> }).emit;

    const svc = new SepararPeriodicListenService(io, {
      intervalMs: 8000,
      limit: 20,
      debug: false,
      repository: { consulta } as never,
    });

    svc.start();
    await flushAsyncMicrotasks();
    expect(emit).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(8000);
    await flushAsyncMicrotasks();

    expect(emit).toHaveBeenCalledTimes(2);
    svc.stop();
  });

  it('should skip emit when fingerprint matches previous tick', async () => {
    vi.useFakeTimers();
    const sameRow = row(1, 100);
    const consulta = vi.fn().mockResolvedValue([sameRow]);
    const io = createMockIo(1);
    const emit = (io as unknown as { emit: ReturnType<typeof vi.fn> }).emit;

    const svc = new SepararPeriodicListenService(io, {
      intervalMs: 8000,
      limit: 20,
      debug: false,
      repository: { consulta } as never,
    });

    svc.start();
    await flushAsyncMicrotasks();
    expect(emit).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(8000);
    await flushAsyncMicrotasks();

    expect(consulta).toHaveBeenCalledTimes(2);
    expect(emit).toHaveBeenCalledTimes(1);
    svc.stop();
  });

  it('should pass limit to consulta via pagination', async () => {
    vi.useFakeTimers();
    const consulta = vi.fn().mockResolvedValue([]);
    const io = createMockIo(1);
    const svc = new SepararPeriodicListenService(io, {
      intervalMs: 8000,
      limit: 35,
      debug: false,
      repository: { consulta } as never,
    });

    svc.start();
    await flushAsyncMicrotasks();

    expect(consulta).toHaveBeenCalledTimes(1);
    const pagination = consulta.mock.calls[0][1];
    expect(pagination.getLimit()).toBe(35);
    svc.stop();
  });
});
