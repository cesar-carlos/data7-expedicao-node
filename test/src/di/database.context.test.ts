import { afterEach, describe, expect, it, vi } from 'vitest';

import { validateDatabaseContexts } from '../../../src/di/database.context';

describe('validateDatabaseContexts', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should reject a process that did not load database contexts', () => {
    vi.stubEnv('LOCAL_DATABASE', '');
    vi.stubEnv('ONLINE_DATABASE', 'firebase');
    expect(() => validateDatabaseContexts()).toThrow(/LOCAL_DATABASE ausente/);
  });

  it('should accept known context literals', () => {
    vi.stubEnv('LOCAL_DATABASE', 'SQL_SERVER');
    vi.stubEnv('ONLINE_DATABASE', 'firebase');
    expect(() => validateDatabaseContexts()).not.toThrow();
  });
});
