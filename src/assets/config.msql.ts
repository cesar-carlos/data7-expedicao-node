export const MSSQL_POOL_DEFAULTS = {
  max: 20,
  min: 2,
  idleTimeoutMillis: 30_000,
  acquireTimeoutMillis: 60_000,
  connectionTimeout: 30_000,
  requestTimeout: 30_000,
  healthCheckTimeoutMs: 2_000,
  heartbeatIntervalMs: 30_000,
} as const;

export type MssqlRuntimeOptions = {
  pool: {
    max: number;
    min: number;
    idleTimeoutMillis: number;
    acquireTimeoutMillis: number;
  };
  connectionTimeout: number;
  requestTimeout: number;
  healthCheckTimeoutMs: number;
  heartbeatIntervalMs: number;
};

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `${name} ausente. O .env não foi carregado neste processo (cwd=${process.cwd()}).`,
    );
  }
  return value;
}

function parseBoundedInt(raw: string | undefined, fallback: number, min: number, max: number): number {
  if (raw === undefined || raw.trim() === '') {
    return fallback;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.min(Math.max(parsed, min), max);
}

/** Pool size and timeouts from env. Shared by the MSSQL adapter and tests. */
export function resolveMssqlRuntimeOptions(env: NodeJS.Dict<string> = process.env): MssqlRuntimeOptions {
  const max = parseBoundedInt(env.SQL_POOL_MAX, MSSQL_POOL_DEFAULTS.max, 1, 100);
  let min = parseBoundedInt(env.SQL_POOL_MIN, MSSQL_POOL_DEFAULTS.min, 0, 100);
  if (min > max) {
    min = max;
  }

  return {
    pool: {
      max,
      min,
      idleTimeoutMillis: parseBoundedInt(
        env.SQL_POOL_IDLE_TIMEOUT_MS,
        MSSQL_POOL_DEFAULTS.idleTimeoutMillis,
        1_000,
        300_000,
      ),
      acquireTimeoutMillis: parseBoundedInt(
        env.SQL_POOL_ACQUIRE_TIMEOUT_MS,
        MSSQL_POOL_DEFAULTS.acquireTimeoutMillis,
        1_000,
        120_000,
      ),
    },
    connectionTimeout: parseBoundedInt(
      env.SQL_CONNECTION_TIMEOUT_MS,
      MSSQL_POOL_DEFAULTS.connectionTimeout,
      1_000,
      120_000,
    ),
    requestTimeout: parseBoundedInt(
      env.SQL_REQUEST_TIMEOUT_MS,
      MSSQL_POOL_DEFAULTS.requestTimeout,
      1_000,
      120_000,
    ),
    healthCheckTimeoutMs: parseBoundedInt(
      env.SQL_HEALTHCHECK_TIMEOUT_MS,
      MSSQL_POOL_DEFAULTS.healthCheckTimeoutMs,
      500,
      10_000,
    ),
    heartbeatIntervalMs: parseBoundedInt(
      env.SQL_HEARTBEAT_INTERVAL_MS,
      MSSQL_POOL_DEFAULTS.heartbeatIntervalMs,
      5_000,
      300_000,
    ),
  };
}

function createMssqlConfig() {
  const encryptEnv = process.env.DATABASE_ENCRYPT ?? process.env.SQL_ENCRYPT;
  const trustEnv =
    process.env.DATABASE_TRUST_SERVER_CERTIFICATE ?? process.env.SQL_TRUST_SERVER_CERTIFICATE;
  const parsedPort = Number.parseInt(process.env.DATABASE_PORT ?? '1433', 10);
  const runtime = resolveMssqlRuntimeOptions();

  return {
    user: requiredEnv('USER_DATABASE'),
    password: requiredEnv('PASSWORD_DATABASE'),
    database: requiredEnv('DATABASE_NAME'),
    server: requiredEnv('DATABASE_HOST'),
    port: Number.isFinite(parsedPort) ? parsedPort : 1433,
    connectionTimeout: runtime.connectionTimeout,
    requestTimeout: runtime.requestTimeout,
    pool: runtime.pool,
    options: {
      encrypt: encryptEnv === 'true' || encryptEnv === '1',
      trustServerCertificate: trustEnv !== 'false' && trustEnv !== '0',
      enableArithAbort: true,
      appName: 'data7-expedicao',
    },
  };
}

export default createMssqlConfig;
