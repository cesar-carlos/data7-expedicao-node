import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as ioClient, type Socket } from 'socket.io-client';
import AppSocket from '../../src/aplication/app.socket.config';
import { resetServidorEmergenciaForTests } from '../../src/services/servidor.emergencia.service';

/** Real transport and handlers, without application bootstrap or database warmup. */
export async function startSocketTestServer(): Promise<{
  connect: () => Promise<Socket>;
  close: () => Promise<void>;
}> {
  const httpServer = createServer();
  const io = new Server(httpServer);
  const clients = new Set<Socket>();
  new AppSocket(io);
  await new Promise<void>((resolve, reject) => {
    httpServer.once('error', reject);
    httpServer.listen(0, '127.0.0.1', () => {
      httpServer.off('error', reject);
      resolve();
    });
  });
  const address = httpServer.address();
  if (!address || typeof address === 'string') throw new Error('Missing socket test port');
  const url = `http://127.0.0.1:${address.port}`;

  return {
    connect: async () => {
      const socket = ioClient(url, { autoConnect: false, reconnection: false, forceNew: true });
      clients.add(socket);
      await new Promise<void>((resolve, reject) => {
        const cleanup = (): void => {
          clearTimeout(timer);
          socket.off('connect', connected);
          socket.off('connect_error', failed);
        };
        const connected = (): void => { cleanup(); resolve(); };
        const failed = (error: Error): void => { cleanup(); socket.close(); reject(error); };
        const timer = setTimeout(() => failed(new Error('Socket test connection timed out')), 5000);
        socket.once('connect', connected);
        socket.once('connect_error', failed);
        socket.connect();
      });
      return socket;
    },
    close: async () => {
      for (const socket of clients) socket.close();
      resetServidorEmergenciaForTests();
      await new Promise<void>((resolve) => io.close(() => resolve()));
    },
  };
}

/** Register the reply before sending, so a fast handler cannot race the test. */
export function requestSocket(socket: Socket, event: string, request: { ResponseIn: string } & Record<string, unknown>): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const receive = (payload: unknown): void => {
      clearTimeout(timer);
      resolve(payload);
    };
    const timer = setTimeout(() => {
      socket.off(request.ResponseIn, receive);
      reject(new Error(`Socket response timed out: ${event}`));
    }, 5000);
    socket.once(request.ResponseIn, receive);
    socket.emit(`${socket.id} ${event}`, JSON.stringify(request));
  });
}
