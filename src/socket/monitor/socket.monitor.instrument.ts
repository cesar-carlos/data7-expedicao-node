import type { Server as SocketIOServer, Socket } from 'socket.io';

import { SocketMonitor } from './socket.monitor';

interface EnginePacket {
  type?: string | number;
  data?: unknown;
}

interface EngineConn {
  transport: { name: string };
  writeBuffer?: readonly unknown[];
  on(event: 'packetCreate' | 'packet', listener: (packet: unknown) => void): void;
  on(event: 'drain' | 'upgrade' | 'close', listener: () => void): void;
  off(event: string, listener: (...args: unknown[]) => void): void;
}

const instrumentedServers = new WeakSet<SocketIOServer>();
const instrumentedSockets = new WeakSet<Socket>();

type EmitFn = (event: string, ...args: unknown[]) => boolean;

/**
 * Bytes stay on the engine packet path so socket.emit and io.emit do not count them twice.
 * Every client keeps a short history without the body. The body is kept only for the client open in the desktop.
 */
export function instrumentServer(io: SocketIOServer, monitor: SocketMonitor): void {
  if (instrumentedServers.has(io)) {
    return;
  }
  instrumentedServers.add(io);

  const original = io.emit.bind(io) as EmitFn;
  io.emit = ((event: string, ...args: unknown[]) => {
    monitor.noteBroadcast(event, args[0]);
    return original(event, ...args);
  }) as typeof io.emit;
}

export function instrumentSocket(socket: Socket, monitor: SocketMonitor): () => void {
  if (instrumentedSockets.has(socket)) {
    return () => undefined;
  }
  instrumentedSockets.add(socket);

  const engine = socket.conn as unknown as EngineConn;
  monitor.attach({
    socketId: socket.id,
    address: socket.handshake.address ?? '',
    transport: engine.transport.name,
    readBuffer: () => engine.writeBuffer?.length ?? 0,
  });

  const onPacketCreate = (packet: unknown): void => {
    const parsed = asPacket(packet);
    if (packetKind(parsed) === 'ping') {
      monitor.notePing(socket.id);
    }
    monitor.noteBytes(socket.id, 'out', payloadBytes(parsed.data));
  };
  const onPacket = (packet: unknown): void => {
    const parsed = asPacket(packet);
    if (packetKind(parsed) === 'pong') {
      monitor.notePong(socket.id);
    }
    monitor.noteBytes(socket.id, 'in', payloadBytes(parsed.data));
  };
  const onDrain = (): void => {
    monitor.rememberBufferDepth(socket.id, engine.writeBuffer?.length ?? 0);
  };
  const onUpgrade = (): void => {
    monitor.setTransport(socket.id, engine.transport.name);
  };

  engine.on('packetCreate', onPacketCreate);
  engine.on('packet', onPacket);
  engine.on('drain', onDrain);
  engine.on('upgrade', onUpgrade);

  const originalEmit = socket.emit.bind(socket) as EmitFn;
  socket.emit = ((event: string, ...args: unknown[]) => {
    monitor.noteOutbound(socket.id, event, args[0]);
    return originalEmit(event, ...args);
  }) as typeof socket.emit;

  let detached = false;
  const detach = (): void => {
    if (detached) {
      return;
    }
    detached = true;
    engine.off('packetCreate', onPacketCreate);
    engine.off('packet', onPacket);
    engine.off('drain', onDrain);
    engine.off('upgrade', onUpgrade);
  };

  engine.on('close', detach);
  return detach;
}

function asPacket(value: unknown): EnginePacket {
  if (typeof value !== 'object' || value === null) {
    return {};
  }
  const record = value as { type?: unknown; data?: unknown };
  const type = record.type;
  return {
    type: typeof type === 'string' || typeof type === 'number' ? type : undefined,
    data: record.data,
  };
}

function packetKind(packet: EnginePacket): string {
  if (packet.type === 'ping' || packet.type === 2) {
    return 'ping';
  }
  if (packet.type === 'pong' || packet.type === 3) {
    return 'pong';
  }
  return '';
}

function payloadBytes(data: unknown): number {
  if (typeof data === 'string') {
    return Buffer.byteLength(data);
  }
  if (Buffer.isBuffer(data)) {
    return data.length;
  }
  if (data instanceof ArrayBuffer) {
    return data.byteLength;
  }
  if (ArrayBuffer.isView(data)) {
    return data.byteLength;
  }
  if (Array.isArray(data)) {
    let total = 0;
    for (const part of data) {
      total += payloadBytes(part);
    }
    return total;
  }
  return 0;
}
