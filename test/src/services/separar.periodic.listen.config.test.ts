import { describe, it, expect, afterEach, vi } from 'vitest';

import { resolveSepararPeriodicListenConfig } from '../../../src/services/separar.periodic.listen.config';

describe('resolveSepararPeriodicListenConfig', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should use defaults when env is unset', () => {
    vi.stubEnv('SEPARAR_LISTEN_ENABLED', '');
    vi.stubEnv('SEPARAR_LISTEN_INTERVAL_MS', '');
    vi.stubEnv('SEPARAR_LISTEN_LIMIT', '');
    vi.stubEnv('SEPARAR_LISTEN_DEBUG', '');
    const c = resolveSepararPeriodicListenConfig();
    expect(c.enabled).toBe(true);
    expect(c.intervalMs).toBe(8000);
    expect(c.limit).toBe(20);
    expect(c.debug).toBe(false);
  });

  it('should parse SEPARAR_LISTEN_ENABLED', () => {
    vi.stubEnv('SEPARAR_LISTEN_ENABLED', 'false');
    expect(resolveSepararPeriodicListenConfig().enabled).toBe(false);
    vi.unstubAllEnvs();
    vi.stubEnv('SEPARAR_LISTEN_ENABLED', '0');
    expect(resolveSepararPeriodicListenConfig().enabled).toBe(false);
  });

  it('should clamp interval and limit', () => {
    vi.stubEnv('SEPARAR_LISTEN_INTERVAL_MS', '50');
    vi.stubEnv('SEPARAR_LISTEN_LIMIT', '9000');
    const c = resolveSepararPeriodicListenConfig();
    expect(c.intervalMs).toBe(1000);
    expect(c.limit).toBe(500);
  });

  it('should enable debug', () => {
    vi.stubEnv('SEPARAR_LISTEN_DEBUG', 'true');
    expect(resolveSepararPeriodicListenConfig().debug).toBe(true);
  });
});
