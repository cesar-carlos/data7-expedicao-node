import { describe, expect, it, vi } from 'vitest';
import type { Socket } from 'socket.io';

import { withSocketRequest, type SocketHandlerContext } from '../../../src/socket/socket.event.helpers';
import { socketQueryDedupeKey } from '../../../src/socket/protocol/socket.query.dedupe';
import { Pagination } from '../../../src/contracts/local.base.params';

function createFakeSocket(): Socket & { emitted: Array<{ event: string; payload: string }> } {
  const emitted: Array<{ event: string; payload: string }> = [];
  return {
    id: 'sock-1',
    connected: true,
    emit(event: string, payload: string) {
      emitted.push({ event, payload });
    },
    emitted,
  } as unknown as Socket & { emitted: Array<{ event: string; payload: string }> };
}

describe('socket query dedupe', () => {
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
