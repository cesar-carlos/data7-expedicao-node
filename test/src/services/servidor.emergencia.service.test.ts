import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Server as SocketIOServer, Socket } from 'socket.io';

import ServidorEmergenciaService, {
  resetServidorEmergenciaForTests,
} from '../../../src/services/servidor.emergencia.service';
import {
  SERVIDOR_EMERGENCIA_LISTEN,
  buildServidorEmergenciaMensagem,
} from '../../../src/socket/protocol/servidor.emergencia';

afterEach(() => {
  vi.useRealTimers();
  resetServidorEmergenciaForTests();
});

describe('ServidorEmergenciaService', () => {
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
