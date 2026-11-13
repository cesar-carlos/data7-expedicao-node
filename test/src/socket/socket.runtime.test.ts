import { v4 as uuidv4 } from 'uuid';
import { describe, expect, test, vi } from 'vitest';
import ConferenciaItemRepository from '../../../src/socket/conferencia.item/conferencia.item.repository';
import { requestSocket, startSocketTestServer } from '../../helpers/socket.server';

describe('socket runtime', () => {
  test('should emit legacy error payload for invalid mutation body without accessing persistence', async () => {
    const insert = vi.spyOn(ConferenciaItemRepository.prototype, 'insert');
    const server = await startSocketTestServer();
    try {
      const socket = await server.connect();
      const responseIn = uuidv4();
      const wirePayload = await requestSocket(socket, 'conferencia.item.insert', {
        Session: socket.id,
        ResponseIn: responseIn,
        Mutation: 'invalid',
      });
      expect(typeof wirePayload).toBe('string');
      const payload: unknown = JSON.parse(String(wirePayload));
      expect(payload).toMatchObject({
        Session: socket.id,
        ResponseIn: responseIn,
        Code: 'INVALID_PAYLOAD',
        Error: [expect.stringMatching(/\[INVALID_PAYLOAD\].*invalid mutation payload/i)],
      });
      expect(insert).not.toHaveBeenCalled();
    } finally {
      await server.close();
      vi.restoreAllMocks();
    }
  });
});
