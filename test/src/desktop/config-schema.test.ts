import { describe, expect, it } from 'vitest';

import {
  defaultDesktopConfig,
  desktopConfigFromEnv,
  mergeSavedConfig,
  parseEnvText,
  redactText,
  retryDelayMs,
  serviceConfigChanged,
  toProcessEnv,
  toPublicConfig,
} from '../../../apps/desktop/shared/config-schema';

describe('desktop config schema', () => {
  it('translates a saved config into the environment the server already reads', () => {
    const config = {
      ...defaultDesktopConfig,
      serverPort: 3001,
      databaseHost: 'LOCALHOST\\DATA7',
      databaseName: 'Estacao',
      databaseUser: 'sa',
      databasePassword: 'segredo',
      closeToTray: true,
    };

    const env = toProcessEnv(config);

    expect(env.LOCAL_DATABASE).toBe('sql_server');
    expect(env.SERVER_PORT).toBe('3001');
    expect(env.DATABASE_HOST).toBe('LOCALHOST\\DATA7');
    expect(env.USER_DATABASE).toBe('sa');
    expect(env.PASSWORD_DATABASE).toBe('segredo');
    expect(env.EXPEDICAO_DESKTOP).toBe('1');
    expect(env.CORS_ORIGINS).toBe('');
    expect(env.SOCKET_AUTH_TOKEN).toBe('');
    expect(env.JWT_SECRET).toBe('');
  });

  it('imports an existing env file once into the form shape', () => {
    const parsed = desktopConfigFromEnv(
      parseEnvText(`
        # loja
        SERVER_PORT=3001
        DATABASE_HOST=LOCALHOST\\DATA7
        DATABASE_PORT=1433
        DATABASE_NAME=Estacao
        USER_DATABASE=sa
        PASSWORD_DATABASE="segredo banco"
      `),
    );

    expect(parsed.serverPort).toBe(3001);
    expect(parsed.databaseHost).toBe('LOCALHOST\\DATA7');
    expect(parsed.databasePassword).toBe('segredo banco');
    expect(parsed.closeToTray).toBe(true);
    expect(parsed.minimizeToTray).toBe(false);
  });

  it('keeps a stored secret when the save leaves the field empty', () => {
    const previous = {
      ...defaultDesktopConfig,
      databaseName: 'Estacao',
      databaseUser: 'sa',
      databasePassword: 'antiga',
    };
    const saved = mergeSavedConfig(previous, {
      ...previous,
      databasePassword: '',
      serverPort: 3010,
    });

    expect(saved.databasePassword).toBe('antiga');
    expect(saved.serverPort).toBe(3010);
    expect(toPublicConfig(saved).passwordSet).toBe(true);
    expect(toPublicConfig(saved)).not.toHaveProperty('databasePassword');
  });

  it('restarts the child only when a value read at boot changes', () => {
    const previous = { ...defaultDesktopConfig, databaseName: 'Estacao', databaseUser: 'sa' };
    expect(serviceConfigChanged(previous, { ...previous, closeToTray: false })).toBe(false);
    expect(serviceConfigChanged(previous, { ...previous, serverPort: 3010 })).toBe(true);
  });

  it('stops retrying after repeated failures and redacts secrets', () => {
    expect(retryDelayMs(1)).toBe(1000);
    expect(retryDelayMs(2)).toBe(2000);
    expect(retryDelayMs(4)).toBe(8000);
    expect(retryDelayMs(5)).toBeNull();
    expect(redactText('senha=segredo-banco jwt=abc.def.ghi', ['segredo-banco'])).toBe('senha=*** jwt=***');
  });
});
