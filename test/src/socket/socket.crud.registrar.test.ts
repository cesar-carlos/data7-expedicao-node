import { describe, expect, it, vi } from 'vitest';

import SocketCrudRegistrar from '../../../src/socket/socket.crud.registrar';

type Handler = (data: unknown) => Promise<void>;

function fakeSocket() {
  const handlers = new Map<string, Handler>();
  return {
    id: 'sock1',
    connected: true,
    on: vi.fn((event: string, handler: Handler) => {
      handlers.set(event, handler);
    }),
    emit: vi.fn(),
    handlers,
  };
}

describe('SocketCrudRegistrar listen', () => {
  it('should emit *.listen from mutation rows when loadListen is omitted', async () => {
    const io = { emit: vi.fn() };
    const socket = fakeSocket();
    const registrar = new SocketCrudRegistrar(io as never, socket as never);

    registrar.mutation({
      eventSuffix: 'armazenar.insert',
      convert: (mutation) => mutation as Array<{ CodArmazenar: number }>,
      execute: async () => undefined,
      responseMap: (item) => item as unknown as Record<string, unknown>,
      listenChannel: 'armazenar.insert.listen',
      listenPayload: (items) => ({ Mutation: items.map((item) => item) }),
    });

    const handler = socket.handlers.get('sock1 armazenar.insert');
    expect(handler).toBeTypeOf('function');

    await handler?.(
      JSON.stringify({
        Session: 'session-1',
        Mutation: [{ CodArmazenar: 9 }],
      }),
    );

    expect(io.emit).toHaveBeenCalledTimes(1);
    expect(io.emit.mock.calls[0][0]).toBe('armazenar.insert.listen');
    const payload = JSON.parse(io.emit.mock.calls[0][1] as string);
    expect(payload).toEqual({ Mutation: [{ CodArmazenar: 9 }] });
    expect(socket.emit).toHaveBeenCalled();
  });

  it('should emit insert rows returned by execute and keep Session on listen', async () => {
    const io = { emit: vi.fn() };
    const socket = fakeSocket();
    const registrar = new SocketCrudRegistrar(io as never, socket as never);

    registrar.mutation({
      eventSuffix: 'armazenar.item.insert',
      convert: (mutation) => mutation as Array<{ Item: string }>,
      execute: async (items) => items.map((item) => ({ Item: `${item.Item}-db` })),
      responseMap: (item) => item as unknown as Record<string, unknown>,
      listenChannel: 'armazenar.item.insert.listen',
      listenPayload: (items, request) => ({
        Session: request.session,
        ResponseIn: request.responseIn,
        Mutation: items,
      }),
      allowEmptyMutation: true,
    });

    const handler = socket.handlers.get('sock1 armazenar.item.insert');
    await handler?.(
      JSON.stringify({
        Session: 'session-1',
        ResponseIn: 'resp-1',
        Mutation: [{ Item: '001' }],
      }),
    );

    const listen = JSON.parse(io.emit.mock.calls[0][1] as string);
    expect(listen).toEqual({
      Session: 'session-1',
      ResponseIn: 'resp-1',
      Mutation: [{ Item: '001-db' }],
    });
    const response = JSON.parse(socket.emit.mock.calls[0][1] as string);
    expect(response.Mutation).toEqual([{ Item: '001-db' }]);
  });
});
