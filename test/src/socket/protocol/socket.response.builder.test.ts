import { describe, expect, test } from 'vitest';

import SocketResponseBuilder from '../../../../src/socket/protocol/socket.response.builder';

describe('socket.response.builder', () => {
  test('should serialize legacy error responses as string arrays', () => {
    const payload = SocketResponseBuilder.error({
      session: 'session-1',
      responseIn: 'client response',
    }, 'Unexpected socket error');

    expect(payload).toEqual({
      Session: 'session-1',
      ResponseIn: 'client response',
      Error: ['Unexpected socket error'],
    });
  });

  test('should serialize mutation responses with legacy keys', () => {
    const serialized = SocketResponseBuilder.serialize(
      SocketResponseBuilder.mutation({
        session: 'session-2',
        responseIn: 'client mutation',
      }, [{ CodEmpresa: 1 }]),
    );

    expect(JSON.parse(serialized)).toEqual({
      Session: 'session-2',
      ResponseIn: 'client mutation',
      Mutation: [{ CodEmpresa: 1 }],
    });
  });
});
