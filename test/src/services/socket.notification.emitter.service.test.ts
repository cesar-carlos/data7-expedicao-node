import { describe, expect, test, vi } from 'vitest';
import SocketNotificationEmitterService from '../../../src/services/socket.notification.emitter.service';

describe('socket.notification.emitter.service', () => {
  test('should emit mutation listen payloads with legacy shape', () => {
    const emit = vi.fn();
    const service = new SocketNotificationEmitterService({ emit } as any);

    service.emitMutation('conferir.update.listen', [{ CodConferir: 1 }]);

    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledWith(
      'conferir.update.listen',
      JSON.stringify({
        Mutation: [{ CodConferir: 1 }],
      }),
    );
  });

  test('should emit data listen payloads with legacy shape', () => {
    const emit = vi.fn();
    const service = new SocketNotificationEmitterService({ emit } as any);

    service.emitData('separar.update.listen', [{ CodSepararEstoque: 7 }]);

    expect(emit).toHaveBeenCalledWith(
      'separar.update.listen',
      JSON.stringify({
        Data: [{ CodSepararEstoque: 7 }],
      }),
    );
  });
});
