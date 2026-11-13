import { describe, expect, it, vi } from 'vitest';
import type { Socket } from 'socket.io';

import { withSocketRequest, type SocketHandlerContext } from '../../../src/socket/socket.event.helpers';
import { socketQueryDedupeKey } from '../../../src/socket/protocol/socket.query.dedupe';
import { Pagination } from '../../../src/contracts/local.base.params';

function createFakeSocket(id = 'sock-1'): Socket & { emitted: Array<{ event: string; payload: string }> } {
  const emitted: Array<{ event: string; payload: string }> = [];
  return {
    id,
    connected: true,
    emit(event: string, payload: string) {
      emitted.push({ event, payload });
    },
    emitted,
  } as unknown as Socket & { emitted: Array<{ event: string; payload: string }> };
}

function deferred() {
  let release!: () => void;
  const promise = new Promise<void>((resolve) => { release = resolve; });
  return { promise, release };
}

function query(socket: Socket, responseIn: string, handler: (context: SocketHandlerContext) => Promise<void>): Promise<void> {
  return withSocketRequest(socket, {
    Session: socket.id, ResponseIn: responseIn, Where: [{ key: 'CodEmpresa', value: 1 }],
  }, {
    defaultResponseIn: `${socket.id} separar.consulta`, eventName: 'separar.consulta', kind: 'query',
  }, handler);
}

describe('socket query dedupe', () => {
  it('should answer every ResponseIn with the classified error when the shared query fails', async () => {
    const socket = createFakeSocket();
    const gate = deferred();
    const handler = vi.fn(async () => {
      await gate.promise;
      throw new Error('internal database failure');
    });
    const first = query(socket, 'error-1', handler);
    const second = query(socket, 'error-2', handler);
    gate.release();
    await Promise.all([first, second]);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(socket.emitted.map(({ event }) => event).sort()).toEqual(['error-1', 'error-2']);
    for (const emitted of socket.emitted) {
      expect(JSON.parse(emitted.payload)).toMatchObject({
        Session: socket.id, ResponseIn: emitted.event, Code: 'INTERNAL_ERROR',
        Error: [expect.stringMatching(/^\[INTERNAL_ERROR\]/)],
      });
      expect(JSON.parse(emitted.payload)).not.toHaveProperty('Data');
    }
  });

  it.each([false, true])('should execute again after a completed query (failed: %s)', async (fails) => {
    const socket = createFakeSocket();
    const gate = deferred();
    let runs = 0;
    const handler = vi.fn(async ({ emitQuery }: SocketHandlerContext) => {
      runs++;
      if (runs === 1) {
        await gate.promise;
        if (fails) throw new Error('first query failed');
      }
      emitQuery([{ run: runs }]);
    });
    const first = query(socket, 'first', handler);
    const shared = query(socket, 'shared', handler);
    gate.release();
    await Promise.all([first, shared]);
    await query(socket, 'later', handler);
    expect(handler).toHaveBeenCalledTimes(2);
    expect(socket.emitted).toHaveLength(3);
    expect(JSON.parse(socket.emitted.find(({ event }) => event === 'later')!.payload)).toMatchObject({
      Session: socket.id, ResponseIn: 'later', Data: [{ run: 2 }],
    });
  });

  it('should execute identical in-flight queries independently for different sockets', async () => {
    const firstSocket = createFakeSocket('a');
    const secondSocket = createFakeSocket('b');
    const gate = deferred();
    const handler = vi.fn(async ({ emitQuery, request }: SocketHandlerContext) => {
      await gate.promise;
      emitQuery([{ owner: request.session }]);
    });
    const first = query(firstSocket, 'reply-a', handler);
    const second = query(secondSocket, 'reply-b', handler);
    gate.release();
    await Promise.all([first, second]);
    expect(handler).toHaveBeenCalledTimes(2);
    expect(firstSocket.emitted).toHaveLength(1);
    expect(secondSocket.emitted).toHaveLength(1);
    expect(JSON.parse(firstSocket.emitted[0]!.payload)).toMatchObject({
      Session: 'a', ResponseIn: 'reply-a', Data: [{ owner: 'a' }],
    });
    expect(JSON.parse(secondSocket.emitted[0]!.payload)).toMatchObject({
      Session: 'b', ResponseIn: 'reply-b', Data: [{ owner: 'b' }],
    });
  });

  it('should share one query and answer every ResponseIn', async () => {
    const socket = createFakeSocket();
    let runs = 0;
    const where = [{ key: 'CodEmpresa', value: 1 }];

    const handler = async ({ emitQuery }: SocketHandlerContext) => {
      runs += 1;
      await new Promise((resolve) => setTimeout(resolve, 20));
      emitQuery([{ CodEmpresa: 1 }]);
    };

    await Promise.all([
      withSocketRequest(
        socket,
        {
          Session: 'sock-1',
          ResponseIn: 'uuid-1',
          Where: where,
        },
        { defaultResponseIn: 'sock-1 separar.consulta', eventName: 'separar.consulta', kind: 'query' },
        handler,
      ),
      withSocketRequest(
        socket,
        {
          Session: 'sock-1',
          ResponseIn: 'uuid-2',
          Where: where,
        },
        { defaultResponseIn: 'sock-1 separar.consulta', eventName: 'separar.consulta', kind: 'query' },
        handler,
      ),
    ]);

    expect(runs).toBe(1);
    expect(socket.emitted.map((item) => item.event)).toEqual(['uuid-1', 'uuid-2']);
    expect(socket.emitted.every((item) => item.payload.includes('"CodEmpresa":1'))).toBe(true);
  });

  it('should not share mutations', async () => {
    const socket = createFakeSocket();
    let runs = 0;

    const handler = async ({ emitMutation }: SocketHandlerContext) => {
      runs += 1;
      await new Promise((resolve) => setTimeout(resolve, 10));
      emitMutation([{ CodEmpresa: 1 }]);
    };

    await Promise.all([
      withSocketRequest(
        socket,
        { Session: 'sock-1', ResponseIn: 'mut-1', Mutation: [{ CodEmpresa: 1, Origem: 'PED', CodOrigem: 1 }] },
        { defaultResponseIn: 'sock-1 separar.update', eventName: 'separar.update', kind: 'mutation' },
        handler,
      ),
      withSocketRequest(
        socket,
        { Session: 'sock-1', ResponseIn: 'mut-2', Mutation: [{ CodEmpresa: 1, Origem: 'PED', CodOrigem: 1 }] },
        { defaultResponseIn: 'sock-1 separar.update', eventName: 'separar.update', kind: 'mutation' },
        handler,
      ),
    ]);

    expect(runs).toBe(2);
  });

  it('should include pagination in the dedupe key', () => {
    const first = socketQueryDedupeKey({
      eventName: 'separar.consulta',
      where: [],
      pagination: Pagination.create(20),
      orderBy: undefined,
    });
    const second = socketQueryDedupeKey({
      eventName: 'separar.consulta',
      where: [],
      pagination: Pagination.create(40),
      orderBy: undefined,
    });

    expect(first).not.toBe(second);
  });
});
