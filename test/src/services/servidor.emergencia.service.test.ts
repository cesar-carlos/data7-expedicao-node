import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Server as SocketIOServer, Socket } from 'socket.io';

import ServidorEmergenciaService, {
  bindServidorEmergenciaIo,
  disposeServidorEmergencia,
  getServidorEmergenciaIo,
  resetServidorEmergenciaForTests,
} from '../../../src/services/servidor.emergencia.service';
import {
  SERVIDOR_EMERGENCIA_LISTEN,
  buildServidorEmergenciaMensagem,
} from '../../../src/socket/protocol/servidor.emergencia';

afterEach(() => {
  resetServidorEmergenciaForTests();
  vi.useRealTimers();
});

function emergencyFixture() {
  vi.useFakeTimers();
  const makeSocket = (id: string) => ({ id, connected: true, emit: vi.fn(), disconnect: vi.fn() });
  const target = makeSocket('a');
  const other = makeSocket('b');
  const sockets = new Map([[target.id, target], [other.id, other]]);
  const io = { emit: vi.fn(), sockets: { sockets } } as unknown as SocketIOServer;
  const service = new ServidorEmergenciaService(io);
  const disconnect = (prazoMs = 100) => buildServidorEmergenciaMensagem({
    Nivel: 'desconectar', Mensagem: 'Manutencao', PrazoMs: prazoMs,
  });
  const aviso = buildServidorEmergenciaMensagem({ Nivel: 'aviso', Mensagem: 'Continuar', Acao: 'nenhuma' });
  return { io, service, target, other, sockets, makeSocket, disconnect, aviso };
}

describe('ServidorEmergenciaService', () => {
  it.each(['individual', 'broadcast'] as const)('should replace the pending %s deadline', (mode) => {
    const f = emergencyFixture();
    const send = (ms: number) => mode === 'individual'
      ? f.service.emitToSocket('a', f.disconnect(ms)) : f.service.emitToAll(f.disconnect(ms));
    send(100);
    vi.advanceTimersByTime(40);
    send(200);
    expect(vi.getTimerCount()).toBe(1);
    vi.advanceTimersByTime(199);
    expect(f.target.disconnect).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(f.target.disconnect).toHaveBeenCalledExactlyOnceWith(true);
    expect(f.other.disconnect).toHaveBeenCalledTimes(mode === 'broadcast' ? 1 : 0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each(['individual', 'broadcast'] as const)('should cancel only the %s timer with Acao=nenhuma', (mode) => {
    const f = emergencyFixture();
    f.service.emitToSocket('a', f.disconnect(100));
    f.service.emitToAll(f.disconnect(200));
    const result = mode === 'individual'
      ? f.service.emitToSocket('a', f.aviso) : f.service.emitToAll(f.aviso);
    expect(result?.disconnectScheduled).toBe(false);
    expect(vi.getTimerCount()).toBe(1);
    vi.advanceTimersByTime(100);
    expect(f.target.disconnect).toHaveBeenCalledTimes(mode === 'broadcast' ? 1 : 0);
    expect(f.other.disconnect).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(f.target.disconnect).toHaveBeenCalledExactlyOnceWith(true);
    expect(f.other.disconnect).toHaveBeenCalledTimes(mode === 'individual' ? 1 : 0);
  });

  it('should retain broadcast recipients connected when the deadline expires', () => {
    const f = emergencyFixture();
    f.service.emitToAll(f.disconnect());
    const late = f.makeSocket('late');
    f.sockets.set(late.id, late);
    f.other.connected = false;
    vi.advanceTimersByTime(100);
    expect(f.target.disconnect).toHaveBeenCalledExactlyOnceWith(true);
    expect(late.disconnect).toHaveBeenCalledExactlyOnceWith(true);
    expect(f.other.disconnect).not.toHaveBeenCalled();
  });

  it('should dispose timers and release the server without executing pending actions', () => {
    const f = emergencyFixture();
    bindServidorEmergenciaIo(f.io);
    f.service.emitToSocket('a', f.disconnect());
    f.service.emitToAll(f.disconnect(200));
    disposeServidorEmergencia(f.io);
    disposeServidorEmergencia(f.io);
    expect(vi.getTimerCount()).toBe(0);
    expect(() => getServidorEmergenciaIo()).toThrow(/nao inicializado/);
    vi.advanceTimersByTime(1000);
    expect(f.target.disconnect).not.toHaveBeenCalled();
    expect(f.other.disconnect).not.toHaveBeenCalled();
  });

  it('should ignore disposal of a different server', () => {
    const f = emergencyFixture();
    bindServidorEmergenciaIo(f.io);
    f.service.emitToSocket('a', f.disconnect());
    disposeServidorEmergencia({} as SocketIOServer);
    expect(getServidorEmergenciaIo()).toBe(f.io);
    vi.advanceTimersByTime(100);
    expect(f.target.disconnect).toHaveBeenCalledExactlyOnceWith(true);
  });
  it('should broadcast Data on servidor.emergencia.listen', () => {
    const emit = vi.fn();
    const io = {
      emit,
      sockets: { sockets: new Map() },
    } as unknown as SocketIOServer;
    const service = new ServidorEmergenciaService(io);
    const mensagem = buildServidorEmergenciaMensagem({
      Nivel: 'aviso',
      Mensagem: 'Aviso geral.',
    });

    const result = service.emitToAll(mensagem);

    expect(result.alvo).toBe('todos');
    expect(result.disconnectScheduled).toBe(false);
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit.mock.calls[0]?.[0]).toBe(SERVIDOR_EMERGENCIA_LISTEN);
    const payload = JSON.parse(String(emit.mock.calls[0]?.[1])) as { Data: Array<{ Mensagem: string }> };
    expect(payload.Data[0]?.Mensagem).toBe('Aviso geral.');
  });

  it('should emit only to the target socket', () => {
    const targetEmit = vi.fn();
    const otherEmit = vi.fn();
    const target = {
      id: 'sock-a',
      connected: true,
      emit: targetEmit,
      disconnect: vi.fn(),
    };
    const other = {
      id: 'sock-b',
      connected: true,
      emit: otherEmit,
      disconnect: vi.fn(),
    };
    const sockets = new Map<string, typeof target>([
      ['sock-a', target],
      ['sock-b', other],
    ]);
    const io = {
      emit: vi.fn(),
      sockets: { sockets },
    } as unknown as SocketIOServer;
    const service = new ServidorEmergenciaService(io);

    const result = service.emitToSocket(
      'sock-a',
      buildServidorEmergenciaMensagem({ Nivel: 'aviso', Mensagem: 'So voce.' }),
    );

    expect(result?.delivered).toBe(1);
    expect(targetEmit).toHaveBeenCalledTimes(1);
    expect(otherEmit).not.toHaveBeenCalled();
    expect(io.emit).not.toHaveBeenCalled();
  });

  it('should disconnect the target after PrazoMs', () => {
    vi.useFakeTimers();
    const disconnect = vi.fn();
    const socket = {
      id: 'sock-a',
      connected: true,
      emit: vi.fn(),
      disconnect,
    } as unknown as Socket;
    const sockets = new Map<string, Socket>([['sock-a', socket]]);
    const io = {
      emit: vi.fn(),
      sockets: { sockets },
    } as unknown as SocketIOServer;
    const service = new ServidorEmergenciaService(io);

    const result = service.emitToSocket(
      'sock-a',
      buildServidorEmergenciaMensagem({
        Nivel: 'desconectar',
        Mensagem: 'Voce sera desconectado.',
        PrazoMs: 80,
      }),
    );

    expect(result?.disconnectScheduled).toBe(true);
    expect(disconnect).not.toHaveBeenCalled();
    vi.advanceTimersByTime(80);
    expect(disconnect).toHaveBeenCalledWith(true);
  });

  it('should return null when the socket is gone', () => {
    const io = {
      emit: vi.fn(),
      sockets: { sockets: new Map() },
    } as unknown as SocketIOServer;
    const service = new ServidorEmergenciaService(io);

    expect(
      service.emitToSocket(
        'missing',
        buildServidorEmergenciaMensagem({ Nivel: 'aviso', Mensagem: 'x' }),
      ),
    ).toBeNull();
  });
});
