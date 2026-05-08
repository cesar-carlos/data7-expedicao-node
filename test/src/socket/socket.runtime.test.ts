import { v4 as uuidv4 } from 'uuid';
import { io, Socket } from 'socket.io-client';
import { afterEach, describe, expect, test } from 'vitest';

import App from '../../../src/aplication/app';

describe('socket runtime', () => {
  let app: App | null = null;

  afterEach(async () => {
    if (app) {
      await app.stop();
      app = null;
    }

    delete process.env.SOCKET_AUTH_TOKEN;
  });

  test('should emit legacy error payload for invalid mutation body', async () => {
    const testPort = String(4100 + Math.floor(Math.random() * 1000));
    process.env.SERVER_PORT = testPort;
    app = new App();
    await app.execute();

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const socket: Socket = io(`http://localhost:${testPort}`, {
      reconnection: false,
      forceNew: true,
    });

    await new Promise((resolve) => socket.on('connect', resolve));

    const responseIn = uuidv4();
    const payloadPromise = new Promise<any>((resolve) => {
      socket.on(responseIn, (receiver) => {
        const payload = typeof receiver === 'string' ? JSON.parse(receiver) : receiver;
        socket.off(responseIn);
        resolve(payload);
      });
    });

    socket.emit(`${socket.id} conferencia.item.insert`, JSON.stringify({
      Session: socket.id,
      ResponseIn: responseIn,
      Mutation: 'invalid',
    }));

    const payload = await payloadPromise;
    expect(payload).toMatchObject({
      Session: socket.id,
      ResponseIn: responseIn,
    });
    expect(payload.Error).toBeInstanceOf(Array);
    expect(payload.Error[0]).toMatch(/invalid mutation payload/i);

    socket.close();
  }, 15000);

  test('should reject socket connection without auth token when configured', async () => {
    const testPort = String(5200 + Math.floor(Math.random() * 1000));
    process.env.SERVER_PORT = testPort;
    process.env.SOCKET_AUTH_TOKEN = 'socket-secret';
    app = new App();
    await app.execute();

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const socket: Socket = io(`http://localhost:${testPort}`, {
      reconnection: false,
      forceNew: true,
    });

    const error = await new Promise<Error>((resolve) => {
      socket.on('connect_error', (connectError) => {
        resolve(connectError);
      });
    });

    expect(error.message).toBe('Unauthorized socket connection');
    socket.close();
  }, 15000);
});
