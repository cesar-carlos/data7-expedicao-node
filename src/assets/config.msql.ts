function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `${name} ausente. O .env não foi carregado neste processo (cwd=${process.cwd()}).`,
    );
  }
  return value;
}

function createMssqlConfig() {
  const encryptEnv = process.env.DATABASE_ENCRYPT ?? process.env.SQL_ENCRYPT;
  const trustEnv =
    process.env.DATABASE_TRUST_SERVER_CERTIFICATE ?? process.env.SQL_TRUST_SERVER_CERTIFICATE;
  const parsedPort = Number.parseInt(process.env.DATABASE_PORT ?? '1433', 10);

  return {
    user: requiredEnv('USER_DATABASE'),
    password: requiredEnv('PASSWORD_DATABASE'),
    database: requiredEnv('DATABASE_NAME'),
    server: requiredEnv('DATABASE_HOST'),
    port: Number.isFinite(parsedPort) ? parsedPort : 1433,
    pool: { max: 30, min: 0, idleTimeoutMillis: 30000 },
    options: {
      encrypt: encryptEnv === 'true' || encryptEnv === '1',
      trustServerCertificate: trustEnv !== 'false' && trustEnv !== '0',
    },
  };
}

export = createMssqlConfig;
