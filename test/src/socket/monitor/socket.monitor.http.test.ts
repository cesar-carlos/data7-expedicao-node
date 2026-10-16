import { createServer, type Server as HttpServer } from 'http';
import express from 'express';
import { Server } from 'socket.io';
import { io as ioClient, type Socket } from 'socket.io-client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import AppSocket from '../../../../src/aplication/app.socket.config';
import socketMonitorRouter from '../../../../src/route/socket.monitor.route';
import type { SocketClientDetail, SocketMonitorSnapshot } from '../../../../src/socket/monitor/socket.monitor';

describe('socket monitor http', () => {
  let httpServer: HttpServer;
  let io: Server;
  let port = 0;

  beforeAll(async () => {
    const app = express();
    app.use(socketMonitorRouter);
    httpServer = createServer(app);
    io = new Server(httpServer, { cors: { origin: '*' } });
    new AppSocket(io);
    await new Promise<void>((resolve) => {
      httpServer.listen(0, '127.0.0.1', () => resolve());
    });
    const address = httpServer.address();
    if (!address || typeof address === 'string') {
      throw new Error('Porta do monitor indisponível');
    }
    port = address.port;
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      io.close(() => resolve());
    });
    if (httpServer.listening) {
      await new Promise<void>((resolve, reject) => {
        httpServer.close((error) => (error ? reject(error) : resolve()));
      });
    }
  });

  it('lists a connected client and removes it after disconnect', async () => {
    const socket = await connect(port);
    const socketId = socket.id ?? '';
    try {
      const listed = await waitForSnapshot(port, (snapshot) => snapshot.clients.some((client) => client.socketId === socketId));
      expect(listed.clients.map((client) => client.socketId)).toContain(socketId);
    } finally {
      socket.close();
    }

    const gone = await waitForSnapshot(
      port,
      (snapshot) => !snapshot.clients.some((client) => client.socketId === socketId),
    );
    expect(gone.recentDisconnects.some((record) => record.socketId === socketId)).toBe(true);
  }, 20000);

  it('shows truncated traffic for the open client only', async () => {
    const first = await connect(port);
    const second = await connect(port);
    const markerA = 'not-json-alpha';
    const markerB = 'not-json-beta';
    try {
      await readDetail(port, first.id);
      await emitInvalid(first, markerA);
      await emitInvalid(second, markerB);

      const detailA = await readDetail(port, first.id);
      expect(detailA.trace.some((entry) => entry.direction === 'in' && entry.preview.includes(markerA))).toBe(true);
      expect(detailA.trace.some((entry) => entry.preview.includes(markerB))).toBe(false);
      expect(detailA.trace.some((entry) => entry.direction === 'out' && entry.error)).toBe(true);

      const detailB = await readDetail(port, second.id);
      expect(detailB.trace.some((entry) => entry.preview.includes(markerA))).toBe(false);
    } finally {
      first.close();
      second.close();
    }
  }, 20000);
});

function connect(port: number): Promise<Socket> {
  const socket = ioClient(`http://127.0.0.1:${port}`, { reconnection: false, forceNew: true });
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('conexão socket expirou')), 5000);
    socket.once('connect', () => {
      clearTimeout(timer);
      resolve(socket);
    });
    socket.once('connect_error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

async function emitInvalid(socket: Socket, marker: string): Promise<void> {
  const eventName = `${socket.id} usuario.consulta`;
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('resposta socket expirou')), 5000);
    socket.once(eventName, () => {
      clearTimeout(timer);
      resolve();
    });
    socket.emit(eventName, marker);
  });
}

async function readDetail(port: number, socketId: string): Promise<SocketClientDetail> {
  const response = await fetch(`http://127.0.0.1:${port}/internal/sockets/${encodeURIComponent(socketId)}`);
  expect(response.status).toBe(200);
  return (await response.json()) as SocketClientDetail;
}

async function waitForSnapshot(port: number, predicate: (snapshot: SocketMonitorSnapshot) => boolean): Promise<SocketMonitorSnapshot> {
  const started = Date.now();
  let last: SocketMonitorSnapshot | null = null;
  while (Date.now() - started < 5000) {
    const response = await fetch(`http://127.0.0.1:${port}/internal/sockets`);
    expect(response.status).toBe(200);
    last = (await response.json()) as SocketMonitorSnapshot;
    if (predicate(last)) {
      return last;
    }
    await new Promise((resolve) => setTimeout(resolve, 40));
  }
  throw new Error('snapshot não chegou no estado esperado');
}
