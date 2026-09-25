import { afterEach, describe, expect, it, vi } from 'vitest';

import createMssqlConfig from '../../../src/assets/config.msql';

describe('createMssqlConfig', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should read the server from the environment at call time', () => {
    vi.stubEnv('USER_DATABASE', 'sa');
    vi.stubEnv('PASSWORD_DATABASE', 'secret');
    vi.stubEnv('DATABASE_NAME', 'loja');
    vi.stubEnv('DATABASE_HOST', 'LOCALHOST\\DATA7');
    vi.stubEnv('DATABASE_PORT', '1433');

    expect(createMssqlConfig().server).toBe('LOCALHOST\\DATA7');
  });

  it('should fail with a clear error when the host is missing', () => {
    vi.stubEnv('USER_DATABASE', 'sa');
    vi.stubEnv('PASSWORD_DATABASE', 'secret');
    vi.stubEnv('DATABASE_NAME', 'loja');
    vi.stubEnv('DATABASE_HOST', '');

    expect(() => createMssqlConfig()).toThrow(/DATABASE_HOST ausente/);
  });
});
