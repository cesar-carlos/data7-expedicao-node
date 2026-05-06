import { describe, expect, test } from 'vitest';

import SocketProtocolAdapter from '../../../../src/socket/protocol/socket.protocol.adapter';

describe('socket.protocol.adapter', () => {
  test('should normalize a valid legacy payload', () => {
    const request = SocketProtocolAdapter.fromLegacy(JSON.stringify({
      Session: 'session-1',
      ResponseIn: 'client conferencia.item.consulta.response',
      Where: [{ key: 'CodEmpresa', value: 1 }],
      Pagination: '$skip=0&$top=10',
      OrderBy: 'CodEmpresa asc',
    }), {
      defaultResponseIn: 'fallback',
      eventName: 'conferencia.item.consulta',
      kind: 'query',
    });

    expect(request.session).toBe('session-1');
    expect(request.responseIn).toBe('client conferencia.item.consulta.response');
    expect(request.where).toEqual([{ key: 'CodEmpresa', value: 1 }]);
    expect(request.kind).toBe('query');
    expect(request.requestId).toBeTruthy();
  });

  test('should fallback response channel when ResponseIn is missing', () => {
    const request = SocketProtocolAdapter.fromLegacy({
      Session: 'session-2',
      Where: [],
    }, {
      defaultResponseIn: 'client separar.item.select',
      eventName: 'separar.item.select',
      kind: 'query',
    });

    expect(request.responseIn).toBe('client separar.item.select');
  });

  test('should normalize a single mutation object into an array', () => {
    const request = SocketProtocolAdapter.fromLegacy({
      Session: 'session-3',
      Mutation: { CodEmpresa: 1, Item: '001' },
    }, {
      defaultResponseIn: 'client separar.item.insert',
      eventName: 'separar.item.insert',
      kind: 'mutation',
    });

    expect(request.mutation).toEqual([{ CodEmpresa: 1, Item: '001' }]);
  });

  test('should reject invalid payloads', () => {
    expect(() => SocketProtocolAdapter.fromLegacy('invalid-json', { defaultResponseIn: 'fallback' })).toThrow();
    expect(() => SocketProtocolAdapter.fromLegacy([], { defaultResponseIn: 'fallback' })).toThrow();
  });
});
