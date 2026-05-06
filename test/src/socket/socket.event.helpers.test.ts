import { describe, expect, test } from 'vitest';

import { convertSocketMutationPayload, parseSocketEventPayload } from '../../../src/socket/socket.event.helpers';

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

  test('should reject invalid mutation payloads', () => {
    expect(() => convertSocketMutationPayload([], (mutation) => mutation, { eventName: 'usuario.insert' })).toThrow(
      /expected at least one item/i,
    );
    expect(() => convertSocketMutationPayload('invalid', (mutation) => mutation, { eventName: 'usuario.insert' })).toThrow(
      /must be an object/i,
    );
  });
});
