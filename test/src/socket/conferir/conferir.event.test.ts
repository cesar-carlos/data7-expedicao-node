import { v4 as uuidv4 } from 'uuid';
import { io, Socket } from 'socket.io-client';
import { expect, test, describe, beforeAll } from 'vitest';

import App from '../../../../src/aplication/app';

describe('Teste conferencia de pedidos socket', () => {
  beforeAll(() => async () => {});

  test('Deve consultar as conferencia via socket', async () => {
    const app = new App();
    app.execute();

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const socket: Socket = io('http://localhost:3001');
    await new Promise((resolve) => setTimeout(resolve, 100));

    const event = `${socket.id} conferir.consulta`;
    const responseIn = uuidv4();
    const params = '';

    const send = {
      Session: socket.id,
      ResponseIn: responseIn,
      Where: params,
    };

    socket.emit(event, JSON.stringify(send));

    const responsePromise = new Promise((resolve) => {
      socket.on(responseIn, (receiver) => {
        const payload = typeof receiver === 'string' ? JSON.parse(receiver) : receiver;
        socket.off(responseIn);
        resolve(payload);
      });
    });

    const payload = (await responsePromise) as { Data?: unknown[]; Error?: string };
    expect(payload.Data).toBeDefined();
    expect(payload.Data).toBeInstanceOf(Array);
  });
}, 15000);
