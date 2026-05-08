export type SepararPeriodicListenResolvedConfig = {
  /** Quando false, o serviço não é registrado em `AppLinstens`. */
  enabled: boolean;
  intervalMs: number;
  limit: number;
  /** Log de dedup omitido / emitido (console). */
  debug: boolean;
};

const DEFAULT_INTERVAL_MS = 8000;
const DEFAULT_LIMIT = 20;

const MIN_INTERVAL_MS = 1000;
const MAX_INTERVAL_MS = 86_400_000;

const MIN_LIMIT = 1;
const MAX_LIMIT = 500;

function parsePositiveInt(raw: string | undefined, fallback: number, min: number, max: number): number {
  if (raw === undefined || String(raw).trim() === '') {
    return fallback;
  }
  const n = Number.parseInt(String(raw), 10);
  if (!Number.isFinite(n)) {
    return fallback;
  }
  return Math.min(Math.max(n, min), max);
}

function parseEnabled(raw: string | undefined, fallback: boolean): boolean {
  if (raw === undefined || String(raw).trim() === '') {
    return fallback;
  }
  const v = String(raw).trim().toLowerCase();
  if (['0', 'false', 'no', 'off'].includes(v)) {
    return false;
  }
  if (['1', 'true', 'yes', 'on'].includes(v)) {
    return true;
  }
  return fallback;
}

function parseDebug(raw: string | undefined): boolean {
  if (raw === undefined || String(raw).trim() === '') {
    return false;
  }
  const v = String(raw).trim().toLowerCase();
  return ['1', 'true', 'yes', 'on'].includes(v);
}

/**
 * Lê variáveis de ambiente para o poll periódico de `separar.consulta.listen`.
 * Chamado na subida da aplicação (após `dotenv.config()`).
 */
export function resolveSepararPeriodicListenConfig(): SepararPeriodicListenResolvedConfig {
  return {
    enabled: parseEnabled(process.env.SEPARAR_LISTEN_ENABLED, true),
    intervalMs: parsePositiveInt(
      process.env.SEPARAR_LISTEN_INTERVAL_MS,
      DEFAULT_INTERVAL_MS,
      MIN_INTERVAL_MS,
      MAX_INTERVAL_MS,
    ),
    limit: parsePositiveInt(process.env.SEPARAR_LISTEN_LIMIT, DEFAULT_LIMIT, MIN_LIMIT, MAX_LIMIT),
    debug: parseDebug(process.env.SEPARAR_LISTEN_DEBUG),
  };
}
