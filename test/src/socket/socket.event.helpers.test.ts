import { describe, expect, test } from 'vitest';

import {
  convertSocketMutationPayload,
  parseSocketEventPayload,
  requireSequenceValue,
  sequenceNameFromWhere,
  socketWhereHasKey,
} from '../../../src/socket/socket.event.helpers';
import { SocketClientError } from '../../../src/utils/repository.error';

describe('socket.event.helpers', () => {
  test('should parse a valid socket payload string', () => {
    const responseIn = 'client separar.consulta';
    const payload = parseSocketEventPayload(
      JSON.stringify({
        Session: 'session-1',
        ResponseIn: responseIn,
        Where: [{ key: 'CodEmpresa', value: 1 }],
      }),
      { defaultResponseIn: 'fallback' },
    );

    expect(payload.session).toBe('session-1');
    expect(payload.responseIn).toBe(responseIn);
    expect(payload.where).toEqual([{ key: 'CodEmpresa', value: 1 }]);
  });

  test('should reject invalid socket payloads', () => {
    expect(() => parseSocketEventPayload('invalid-json', { defaultResponseIn: 'fallback' })).toThrow();
    expect(() => parseSocketEventPayload('[]', { defaultResponseIn: 'fallback' })).toThrow();
  });

  test('should require a positive sequence value', () => {
    expect(requireSequenceValue({ Valor: 12 }, 'ConferirEstoque')).toBe(12);
    expect(() => requireSequenceValue(undefined, 'ConferirEstoque')).toThrow(SocketClientError);
    expect(() => requireSequenceValue({ Valor: 0 }, 'ConferirEstoque')).toThrow(/Sequencia indisponivel/);
  });

  test('should read the sequence name from Where without String(object)', () => {
    expect(sequenceNameFromWhere('Produto_Sequencia')).toBe('Produto_Sequencia');
    expect(sequenceNameFromWhere([{ key: 'Nome', value: 'Produto_Sequencia' }])).toBe('Produto_Sequencia');
    expect(() => sequenceNameFromWhere([{ key: 'CodEmpresa', value: 1 }])).toThrow(SocketClientError);
  });

  test('should require CodCarrinho in Where and treat 0 as missing', () => {
    expect(socketWhereHasKey([{ key: 'CodCarrinho', value: 15 }], 'CodCarrinho')).toBe(true);
    expect(socketWhereHasKey([{ key: 'CodCarrinho', value: 0 }], 'CodCarrinho')).toBe(false);
    expect(socketWhereHasKey([{ key: 'CodEmpresa', value: 1 }], 'CodCarrinho')).toBe(false);
    expect(socketWhereHasKey('CodEmpresa = 1 AND CodCarrinho = 94', 'CodCarrinho')).toBe(true);
    expect(socketWhereHasKey('CodEmpresa = 1 AND CodCarrinho = 0', 'CodCarrinho')).toBe(false);
    expect(socketWhereHasKey(['CodCarrinho = 15'], 'CodCarrinho')).toBe(true);
  });

  test('should reject invalid mutation payloads', () => {
    expect(() => convertSocketMutationPayload([], (mutation) => mutation, { eventName: 'usuario.insert' })).toThrow(
      /expected at least one item/i,
    );
    expect(() => convertSocketMutationPayload('invalid', (mutation) => mutation, { eventName: 'usuario.insert' })).toThrow(
      /must be an object/i,
    );
  });
});
