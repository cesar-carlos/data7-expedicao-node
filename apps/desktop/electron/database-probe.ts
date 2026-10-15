import sql from 'mssql';
import { ZodError } from 'zod';

import type { DesktopConfig } from '../shared/config-schema';
import { mergeSavedConfig } from '../shared/config-schema';
import type { DatabaseProbeResult } from '../shared/ipc-contract';

const PROBE_TIMEOUT_MS = 8000;

function described(error: unknown): string {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? 'Verifique os dados do SQL Server.';
  }
  const raw = error instanceof Error ? error.message : String(error);
  const message = raw.replace(/\s+/g, ' ').trim();
  if (/login failed/i.test(message)) {
    return 'O usuário ou a senha foi recusado.';
  }
  if (/cannot open database/i.test(message)) {
    return 'Não consegui abrir esse banco.';
  }
  if (/ENOTFOUND|EAI_AGAIN|getaddrinfo/i.test(message)) {
    return 'Não encontrei o host.';
  }
  if (/ECONNREFUSED/i.test(message)) {
    return 'O SQL Server recusou a conexão nessa porta.';
  }
  if (/ETIMEOUT|ETIMEDOUT|timeout/i.test(message)) {
    return 'O SQL Server não respondeu a tempo.';
  }
  return message.slice(0, 240) || 'Não foi possível conectar.';
}

export async function probeDatabase(previous: DesktopConfig | null, input: unknown): Promise<DatabaseProbeResult> {
  let config: DesktopConfig;
  try {
    config = mergeSavedConfig(previous, input);
  } catch (error) {
    return { ok: false, message: described(error) };
  }

  const pool = new sql.ConnectionPool({
    server: config.databaseHost,
    port: config.databasePort,
    database: config.databaseName,
    user: config.databaseUser,
    password: config.databasePassword,
    connectionTimeout: PROBE_TIMEOUT_MS,
    requestTimeout: PROBE_TIMEOUT_MS,
    options: {
      encrypt: false,
      trustServerCertificate: true,
      enableArithAbort: true,
    },
    pool: { max: 1, min: 0, idleTimeoutMillis: 1000 },
  });

  try {
    await pool.connect();
    await pool.request().query('SELECT 1 AS ok');
    return { ok: true, message: 'Conexão com o SQL Server estabelecida.' };
  } catch (error) {
    return { ok: false, message: described(error) };
  } finally {
    await pool.close().catch(() => undefined);
  }
}
