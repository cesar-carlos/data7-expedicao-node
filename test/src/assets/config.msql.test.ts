import { describe, expect, it } from 'vitest';

import { MSSQL_POOL_DEFAULTS, resolveMssqlRuntimeOptions } from '../../../src/assets/config.msql';

describe('resolveMssqlRuntimeOptions', () => {
  it('should use defaults when env is empty', () => {
    const options = resolveMssqlRuntimeOptions({});

    expect(options.pool.max).toBe(MSSQL_POOL_DEFAULTS.max);
    expect(options.pool.min).toBe(MSSQL_POOL_DEFAULTS.min);
    expect(options.healthCheckTimeoutMs).toBe(MSSQL_POOL_DEFAULTS.healthCheckTimeoutMs);
    expect(options.heartbeatIntervalMs).toBe(MSSQL_POOL_DEFAULTS.heartbeatIntervalMs);
  });

  it('should clamp pool size and drop min when it is above max', () => {
    const options = resolveMssqlRuntimeOptions({
      SQL_POOL_MAX: '8',
      SQL_POOL_MIN: '40',
      SQL_HEARTBEAT_INTERVAL_MS: '1000',
      SQL_HEALTHCHECK_TIMEOUT_MS: '50',
    });

    expect(options.pool.max).toBe(8);
    expect(options.pool.min).toBe(8);
    expect(options.heartbeatIntervalMs).toBe(5_000);
    expect(options.healthCheckTimeoutMs).toBe(500);
  });

  it('should ignore non-numeric values', () => {
    const options = resolveMssqlRuntimeOptions({
      SQL_POOL_MAX: 'abc',
      SQL_REQUEST_TIMEOUT_MS: '',
    });

    expect(options.pool.max).toBe(MSSQL_POOL_DEFAULTS.max);
    expect(options.requestTimeout).toBe(MSSQL_POOL_DEFAULTS.requestTimeout);
  });
});
