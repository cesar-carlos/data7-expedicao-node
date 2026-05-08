const encryptEnv = process.env.DATABASE_ENCRYPT ?? process.env.SQL_ENCRYPT;
const trustEnv = process.env.DATABASE_TRUST_SERVER_CERTIFICATE ?? process.env.SQL_TRUST_SERVER_CERTIFICATE;

export = {
  user: process.env.USER_DATABASE,
  password: process.env.PASSWORD_DATABASE,
  database: process.env.DATABASE_NAME,
  server: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT as string),
  pool: { max: 30, min: 0, idleTimeoutMillis: 30000 },
  options: {
    encrypt: encryptEnv === 'true' || encryptEnv === '1',
    trustServerCertificate: trustEnv !== 'false' && trustEnv !== '0',
  },
};
