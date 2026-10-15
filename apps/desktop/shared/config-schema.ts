import { z } from 'zod';

export const MAX_START_FAILURES = 5;

const WINDOW_KEYS = ['startWithWindows', 'closeToTray', 'minimizeToTray'] as const;

export const desktopConfigSchema = z.object({
  serverPort: z.number().int().min(1).max(65535),
  databaseHost: z.string().trim().min(1, 'Informe o host do SQL Server'),
  databasePort: z.number().int().min(1).max(65535),
  databaseName: z.string().trim().min(1, 'Informe o nome do banco'),
  databaseUser: z.string().trim().min(1, 'Informe o usuário do banco'),
  databasePassword: z.string(),
  separarListenEnabled: z.boolean(),
  separarListenIntervalMs: z.number().int().min(1000).max(86_400_000),
  separarListenLimit: z.number().int().min(1).max(500),
  separarListenDebug: z.boolean(),
  sqlHeartbeatIntervalMs: z.number().int().min(5000),
  startWithWindows: z.boolean(),
  closeToTray: z.boolean(),
  minimizeToTray: z.boolean(),
});

export type DesktopConfig = z.infer<typeof desktopConfigSchema>;

export type PublicDesktopConfig = Omit<DesktopConfig, 'databasePassword'> & {
  passwordSet: boolean;
};

export const defaultDesktopConfig: DesktopConfig = {
  serverPort: 3001,
  databaseHost: 'localhost',
  databasePort: 1433,
  databaseName: '',
  databaseUser: '',
  databasePassword: '',
  separarListenEnabled: true,
  separarListenIntervalMs: 8000,
  separarListenLimit: 20,
  separarListenDebug: false,
  sqlHeartbeatIntervalMs: 30_000,
  startWithWindows: false,
  closeToTray: true,
  minimizeToTray: false,
};

export function parseDesktopConfig(input: unknown): DesktopConfig {
  return desktopConfigSchema.parse(input);
}

export function toPublicConfig(config: DesktopConfig): PublicDesktopConfig {
  return {
    serverPort: config.serverPort,
    databaseHost: config.databaseHost,
    databasePort: config.databasePort,
    databaseName: config.databaseName,
    databaseUser: config.databaseUser,
    separarListenEnabled: config.separarListenEnabled,
    separarListenIntervalMs: config.separarListenIntervalMs,
    separarListenLimit: config.separarListenLimit,
    separarListenDebug: config.separarListenDebug,
    sqlHeartbeatIntervalMs: config.sqlHeartbeatIntervalMs,
    startWithWindows: config.startWithWindows,
    closeToTray: config.closeToTray,
    minimizeToTray: config.minimizeToTray,
    passwordSet: config.databasePassword.length > 0,
  };
}

/** Campo vazio na gravação mantém o segredo anterior. */
export function mergeSavedConfig(previous: DesktopConfig | null, input: unknown): DesktopConfig {
  const parsed = parseDesktopConfig(input);
  if (!previous) {
    return parsed;
  }

  return {
    ...parsed,
    databasePassword: parsed.databasePassword === '' ? previous.databasePassword : parsed.databasePassword,
  };
}

export function serviceConfigChanged(previous: DesktopConfig, next: DesktopConfig): boolean {
  const keys = Object.keys(next) as (keyof DesktopConfig)[];
  return keys.some((key) => !WINDOW_KEYS.includes(key as (typeof WINDOW_KEYS)[number]) && previous[key] !== next[key]);
}

export function parseEnvText(text: string): Record<string, string> {
  const values: Record<string, string> = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }
    const separator = line.indexOf('=');
    if (separator <= 0) {
      continue;
    }
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }
  return values;
}

function intFrom(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw.trim() === '') {
    return fallback;
  }
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function boolFrom(raw: string | undefined, fallback: boolean): boolean {
  if (raw === undefined || raw.trim() === '') {
    return fallback;
  }
  const value = raw.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(value)) {
    return true;
  }
  if (['0', 'false', 'no', 'off'].includes(value)) {
    return false;
  }
  return fallback;
}

export function desktopConfigFromEnv(map: Record<string, string>): DesktopConfig {
  const defaults = defaultDesktopConfig;
  const candidate = {
    ...defaults,
    serverPort: intFrom(map.SERVER_PORT, defaults.serverPort),
    databaseHost: map.DATABASE_HOST ?? defaults.databaseHost,
    databasePort: intFrom(map.DATABASE_PORT, defaults.databasePort),
    databaseName: map.DATABASE_NAME ?? defaults.databaseName,
    databaseUser: map.USER_DATABASE ?? defaults.databaseUser,
    databasePassword: map.PASSWORD_DATABASE ?? '',
    separarListenEnabled: boolFrom(map.SEPARAR_LISTEN_ENABLED, defaults.separarListenEnabled),
    separarListenIntervalMs: intFrom(map.SEPARAR_LISTEN_INTERVAL_MS, defaults.separarListenIntervalMs),
    separarListenLimit: intFrom(map.SEPARAR_LISTEN_LIMIT, defaults.separarListenLimit),
    separarListenDebug: boolFrom(map.SEPARAR_LISTEN_DEBUG, defaults.separarListenDebug),
    sqlHeartbeatIntervalMs: intFrom(map.SQL_HEARTBEAT_INTERVAL_MS, defaults.sqlHeartbeatIntervalMs),
  };
  const parsed = desktopConfigSchema.safeParse(candidate);
  if (parsed.success) {
    return parsed.data;
  }
  return candidate;
}

export function toProcessEnv(config: DesktopConfig): Record<string, string> {
  const env: Record<string, string> = {
    SERVER_PORT: String(config.serverPort),
    CORS_ORIGINS: '',
    SOCKET_AUTH_TOKEN: '',
    JWT_SECRET: '',
    LOCAL_DATABASE: 'sql_server',
    DATABASE_HOST: config.databaseHost,
    DATABASE_PORT: String(config.databasePort),
    DATABASE_NAME: config.databaseName,
    USER_DATABASE: config.databaseUser,
    PASSWORD_DATABASE: config.databasePassword,
    SEPARAR_LISTEN_ENABLED: config.separarListenEnabled ? 'true' : 'false',
    SEPARAR_LISTEN_INTERVAL_MS: String(config.separarListenIntervalMs),
    SEPARAR_LISTEN_LIMIT: String(config.separarListenLimit),
    SEPARAR_LISTEN_DEBUG: config.separarListenDebug ? 'true' : 'false',
    SQL_HEARTBEAT_INTERVAL_MS: String(config.sqlHeartbeatIntervalMs),
    EXPEDICAO_DESKTOP: '1',
    NODE_ENV: 'production',
  };

  return env;
}

export function retryDelayMs(failures: number): number | null {
  if (failures >= MAX_START_FAILURES) {
    return null;
  }
  return Math.min(1000 * 2 ** Math.max(failures - 1, 0), 15_000);
}

export function redactText(text: string, secrets: readonly string[]): string {
  const unique = [...new Set(secrets.map((secret) => secret.trim()).filter((secret) => secret.length >= 4))];
  unique.sort((left, right) => right.length - left.length);

  let redacted = text;
  for (const secret of unique) {
    redacted = redacted.split(secret).join('***');
  }

  return redacted.replace(/(password|pwd|jwt|secret)\s*[=:]\s*[^;\s]+/gi, (match) => {
    const separator = match.search(/[=:]/);
    return `${match.slice(0, separator + 1)}***`;
  });
}
