import { afterEach, describe, expect, it, vi } from 'vitest';
import AppApi from '../../../src/aplication/app.api';
import ServidorEmergenciaService, {
  getServidorEmergenciaIo,
  resetServidorEmergenciaForTests,
} from '../../../src/services/servidor.emergencia.service';
import { buildServidorEmergenciaMensagem } from '../../../src/socket/protocol/servidor.emergencia';

let api: AppApi | undefined;

afterEach(async () => {
  await api?.stop();
  api = undefined;
  resetServidorEmergenciaForTests();
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe('AppApi emergency lifecycle', () => {
  it('should clear emergency timers on stop and bind a fresh server on restart', async () => {
    vi.stubEnv('SERVER_PORT', '0');
    api = AppApi.getInstance();
    await api.start();
    const previousIo = api.getIO();
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    new ServidorEmergenciaService(previousIo).emitToAll(buildServidorEmergenciaMensagem({
      Nivel: 'desconectar', Mensagem: 'Manutencao', PrazoMs: 60000,
    }));
    expect(vi.getTimerCount()).toBe(1);

    await api.stop();
    expect(vi.getTimerCount()).toBe(0);
    expect(() => getServidorEmergenciaIo()).toThrow(/nao inicializado/);
    vi.useRealTimers();

    api = AppApi.getInstance();
    await api.start();
    expect(api.getIO()).not.toBe(previousIo);
    expect(getServidorEmergenciaIo()).toBe(api.getIO());
  });
});
