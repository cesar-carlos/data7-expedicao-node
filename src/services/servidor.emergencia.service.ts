import type { Server as SocketIOServer, Socket } from 'socket.io';

import {
  SERVIDOR_EMERGENCIA_LISTEN,
  serializeServidorEmergenciaListen,
  type ServidorEmergenciaMensagem,
} from '../socket/protocol/servidor.emergencia';

const BROADCAST_TIMER_KEY = '*';

let boundIo: SocketIOServer | undefined;
const disconnectTimers = new Map<string, ReturnType<typeof setTimeout>>();

export function bindServidorEmergenciaIo(io: SocketIOServer): void {
  boundIo = io;
}

export function getServidorEmergenciaIo(): SocketIOServer {
  if (!boundIo) {
    throw new Error('Socket.IO nao inicializado para servidor.emergencia.listen.');
  }
  return boundIo;
}

export function clearServidorEmergenciaTimersForTests(): void {
  for (const timer of disconnectTimers.values()) {
    clearTimeout(timer);
  }
  disconnectTimers.clear();
}

export function resetServidorEmergenciaForTests(): void {
  clearServidorEmergenciaTimersForTests();
  boundIo = undefined;
}

export type ServidorEmergenciaEmitResult = {
  channel: typeof SERVIDOR_EMERGENCIA_LISTEN;
  alvo: 'todos' | string;
  delivered: number;
  disconnectScheduled: boolean;
  prazoMs: number;
};

export default class ServidorEmergenciaService {
  constructor(private readonly io: SocketIOServer) {}

  public emitToAll(mensagem: ServidorEmergenciaMensagem): ServidorEmergenciaEmitResult {
    const payload = serializeServidorEmergenciaListen(mensagem);
    this.io.emit(SERVIDOR_EMERGENCIA_LISTEN, payload);
    const delivered = this.io.sockets.sockets.size;
    const disconnectScheduled = this.scheduleDisconnect(BROADCAST_TIMER_KEY, mensagem, () => {
      for (const socket of this.io.sockets.sockets.values()) {
        disconnectIfConnected(socket);
      }
    });
    return {
      channel: SERVIDOR_EMERGENCIA_LISTEN,
      alvo: 'todos',
      delivered,
      disconnectScheduled,
      prazoMs: mensagem.PrazoMs,
    };
  }

  public emitToSocket(socketId: string, mensagem: ServidorEmergenciaMensagem): ServidorEmergenciaEmitResult | null {
    const socket = this.io.sockets.sockets.get(socketId);
    if (!socket || !socket.connected) {
      return null;
    }

    socket.emit(SERVIDOR_EMERGENCIA_LISTEN, payloadFor(mensagem));
    const disconnectScheduled = this.scheduleDisconnect(socketId, mensagem, () => {
      const current = this.io.sockets.sockets.get(socketId);
      disconnectIfConnected(current);
    });
    return {
      channel: SERVIDOR_EMERGENCIA_LISTEN,
      alvo: socketId,
      delivered: 1,
      disconnectScheduled,
      prazoMs: mensagem.PrazoMs,
    };
  }

  private scheduleDisconnect(
    key: string,
    mensagem: ServidorEmergenciaMensagem,
    action: () => void,
  ): boolean {
    const previous = disconnectTimers.get(key);
    if (previous) {
      clearTimeout(previous);
      disconnectTimers.delete(key);
    }

    if (mensagem.Acao !== 'desconectar') {
      return false;
    }

    const timer = setTimeout(() => {
      disconnectTimers.delete(key);
      action();
    }, mensagem.PrazoMs);
    disconnectTimers.set(key, timer);
    return true;
  }
}

function payloadFor(mensagem: ServidorEmergenciaMensagem): string {
  return serializeServidorEmergenciaListen(mensagem);
}

function disconnectIfConnected(socket: Socket | undefined): void {
  if (!socket || !socket.connected) {
    return;
  }
  socket.disconnect(true);
}
