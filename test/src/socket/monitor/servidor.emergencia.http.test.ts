import { createServer, type Server as HttpServer } from 'http';
import express from 'express';
import { Server } from 'socket.io';
import { io as ioClient, type Socket } from 'socket.io-client';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import AppSocket from '../../../../src/aplication/app.socket.config';
import appErrorMiddleware from '../../../../src/middleware/app.error.middleware';
import socketMonitorRouter from '../../../../src/route/socket.monitor.route';
import {
  clearServidorEmergenciaTimersForTests,
  resetServidorEmergenciaForTests,
} from '../../../../src/services/servidor.emergencia.service';
import { SERVIDOR_EMERGENCIA_LISTEN } from '../../../../src/socket/protocol/servidor.emergencia';

describe('servidor.emergencia http', () => {
  let httpServer: HttpServer;
  let io: Server;
  let port = 0;

  beforeAll(async () => {
    const app = express();
    app.use(express.json());
    app.use(socketMonitorRouter);
    app.use(appErrorMiddleware);
    httpServer = createServer(app);
    io = new Server(httpServer, { cors: { origin: '*' } });
    new AppSocket(io);
    await new Promise<void>((resolve) => {
      httpServer.listen(0, '127.0.0.1', () => resolve());
    });
    const address = httpServer.address();
    if (!address || typeof address === 'string') {
      throw new Error('Porta do canal de emergencia indisponivel');
    }
    port = address.port;
  });

  afterEach(() => {
    clearServidorEmergenciaTimersForTests();
  });

  afterAll(async () => {
    resetServidorEmergenciaForTests();
    await new Promise<void>((resolve) => {
      io.close(() => resolve());
    });
    if (httpServer.listening) {
      await new Promise<void>((resolve, reject) => {
        httpServer.close((error) => (error ? reject(error) : resolve()));
      });
    }
  });

  it('should deliver a broadcast aviso on servidor.emergencia.listen', async () => {
    const socket = await connect(port);
    try {
      const received = waitForEmergencia(socket);
      const response = await fetch(`http://127.0.0.1:${port}/internal/sockets/emergencia`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          Nivel: 'aviso',
          Mensagem: 'Manutencao em 10 minutos.',
        }),
      });
      expect(response.status).toBe(204);
      const event = await received;
      expect(event.Data[0]?.Nivel).toBe('aviso');
      expect(event.Data[0]?.Mensagem).toBe('Manutencao em 10 minutos.');
      expect(event.Data[0]?.Acao).toBe('nenhuma');
      expect(socket.connected).toBe(true);
    } finally {
      socket.close();
    }
  }, 20000);

  it('should return 404 when the target socket does not exist', async () => {
    const response = await fetch(`http://127.0.0.1:${port}/internal/sockets/emergencia`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        Nivel: 'desconectar',
        Mensagem: 'Encerrar.',
        SocketId: 'socket-inexistente',
      }),
    });
    expect(response.status).toBe(404);
  });
});

function connect(port: number): Promise<Socket> {
  const socket = ioClient(`http://127.0.0.1:${port}`, { reconnection: false, forceNew: true });
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('conexao socket expirou')), 5000);
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

function waitForEmergencia(socket: Socket): Promise<{ Data: Array<Record<string, unknown>> }> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('aviso de emergencia nao chegou')), 5000);
    socket.once(SERVIDOR_EMERGENCIA_LISTEN, (payload: unknown) => {
      clearTimeout(timer);
      const parsed = typeof payload === 'string' ? JSON.parse(payload) : payload;
      resolve(parsed as { Data: Array<Record<string, unknown>> });
    });
  });
}
