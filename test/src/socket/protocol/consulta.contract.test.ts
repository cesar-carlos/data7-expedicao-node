import { describe, expect, it } from 'vitest';

import SocketProtocolAdapter from '../../../../src/socket/protocol/socket.protocol.adapter';
import { mutationBasicListenPayload, parseSocketEventPayload } from '../../../../src/socket/socket.event.helpers';

describe('consulta socket contract', () => {
  it('should keep a Flutter object-list Where', () => {
    const request = SocketProtocolAdapter.fromLegacy(
      {
        Session: 'sock-1',
        ResponseIn: '8b3c1e2a-4d55-4f10-9c11-0a1b2c3d4e5f',
        Where: [
          { key: 'CodEmpresa', value: 1 },
          { key: 'CodConferir', value: 290 },
          { key: 'CodCarrinho', value: 94 },
        ],
        Pagination: 'LIMIT=200&OFFSET=0&PAGE=1',
        OrderBy: 'order_by=Item&order_direction=ASC',
      },
      {
        defaultResponseIn: 'sock-1 conferir.item.consulta',
        eventName: 'conferir.item.consulta',
        kind: 'query',
      },
    );

    expect(request.where).toEqual([
      { key: 'CodEmpresa', value: 1 },
      { key: 'CodConferir', value: 290 },
      { key: 'CodCarrinho', value: 94 },
    ]);
    expect(request.pagination?.getLimit()).toBe(200);
    expect(request.pagination?.getOffset()).toBe(0);
    expect(request.responseIn).toBe('8b3c1e2a-4d55-4f10-9c11-0a1b2c3d4e5f');
  });

  it('should keep a QueryBuilder SQL Where string', () => {
    const payload = parseSocketEventPayload(
      JSON.stringify({
        Session: 'sock-1',
        ResponseIn: 'resp-1',
        Where: 'CodEmpresa = 1 AND CodConferir = 290 AND CodCarrinho = 94',
        Pagination: 'LIMIT=200&OFFSET=0&PAGE=1',
      }),
      { defaultResponseIn: 'sock-1 conferir.item.consulta' },
    );

    expect(payload.where).toBe('CodEmpresa = 1 AND CodConferir = 290 AND CodCarrinho = 94');
  });

  it('should treat an omitted Where as empty string', () => {
    const request = SocketProtocolAdapter.fromLegacy(
      { Session: 'sock-1' },
      { defaultResponseIn: 'sock-1 separar.consulta', eventName: 'separar.consulta', kind: 'query' },
    );

    expect(request.where).toBe('');
    expect(request.pagination).toBeUndefined();
  });

  it('should keep Mutation as an object or as an array', () => {
    const asObject = SocketProtocolAdapter.fromLegacy(
      { Session: 'sock-1', ResponseIn: 'resp-1', Mutation: { CodEmpresa: 1, Origem: 'PED', CodOrigem: 10 } },
      { defaultResponseIn: 'sock-1 conferir.insert', eventName: 'conferir.insert', kind: 'mutation' },
    );
    const asArray = SocketProtocolAdapter.fromLegacy(
      { Session: 'sock-1', Mutation: [{ CodEmpresa: 1, Origem: 'PED', CodOrigem: 10 }] },
      { defaultResponseIn: 'sock-1 conferir.insert', eventName: 'conferir.insert', kind: 'mutation' },
    );

    expect(asObject.mutation).toEqual([{ CodEmpresa: 1, Origem: 'PED', CodOrigem: 10 }]);
    expect(asArray.mutation).toEqual([{ CodEmpresa: 1, Origem: 'PED', CodOrigem: 10 }]);
  });

  it('should keep Session and ResponseIn on a basic mutation listen payload', () => {
    const payload = mutationBasicListenPayload(
      [{ toJson: () => ({ CodProduto: 9 }) }],
      { session: 'sock-1', responseIn: 'resp-1' },
    );

    expect(payload).toEqual({
      Session: 'sock-1',
      ResponseIn: 'resp-1',
      Mutation: [{ CodProduto: 9 }],
    });
  });
});
