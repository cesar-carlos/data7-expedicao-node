type AppLogLevel = 'debug' | 'info' | 'warn' | 'error';

type AppLogMetadata = Record<string, unknown>;

const APP_LOG_PRIORITY: Record<AppLogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function getConfiguredLevel(): AppLogLevel {
  const raw = process.env.APP_LOG_LEVEL?.toLowerCase();
  if (raw === 'debug' || raw === 'info' || raw === 'warn' || raw === 'error') {
    return raw;
  }
  return 'info';
}

function shouldLog(level: AppLogLevel): boolean {
  return APP_LOG_PRIORITY[level] >= APP_LOG_PRIORITY[getConfiguredLevel()];
}

function oneLine(value: unknown): string {
  return String(value).replace(/\s+/g, ' ').slice(0, 300);
}

function formatAppLogLine(message: string, metadata?: AppLogMetadata): string {
  const parts = [`[app] ${message}`];
  if (!metadata) return parts.join(' ');
  for (const [key, value] of Object.entries(metadata)) {
    if (value === undefined || value === null || value === '') continue;
    parts.push(`${key}=${oneLine(value)}`);
  }
  return parts.join(' ');
}

function write(level: AppLogLevel, message: string, metadata?: AppLogMetadata): void {
  if (!shouldLog(level)) return;

  const line = formatAppLogLine(message, metadata);
  if (level === 'error') {
    console.error(line);
    return;
  }
  if (level === 'warn') {
    console.warn(line);
    return;
  }
  console.log(line);
}

export function logAppInfo(message: string, metadata?: AppLogMetadata): void {
  write('info', message, metadata);
}

export function logAppWarn(message: string, metadata?: AppLogMetadata): void {
  write('warn', message, metadata);
}

export function logAppError(message: string, metadata?: AppLogMetadata): void {
  write('error', message, metadata);
}

export function logCaughtError(context: string, error: unknown, metadata?: AppLogMetadata): void {
  const message = error instanceof Error ? error.message : String(error);
  logAppError(context, { error: message, ...metadata });
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
