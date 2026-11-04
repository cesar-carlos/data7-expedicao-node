import SocketErrorCode from './socket.error.code';

type SocketLogLevel = 'debug' | 'info' | 'warn' | 'error';

type SocketLogMetadata = {
  event?: string;
  socketId?: string;
  responseIn?: string;
  requestId?: string;
  durationMs?: number;
  rows?: number;
  listenRows?: number;
  status?: string;
  listenCount?: number;
  errorCode?: SocketErrorCode;
  error?: string;
  [key: string]: unknown;
};

const SOCKET_LOG_PRIORITY: Record<SocketLogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function getConfiguredLevel(): SocketLogLevel {
  const raw = process.env.SOCKET_LOG_LEVEL?.toLowerCase();
  if (raw === 'debug' || raw === 'info' || raw === 'warn' || raw === 'error') {
    return raw;
  }

  return 'info';
}

function shouldLog(level: SocketLogLevel): boolean {
  return SOCKET_LOG_PRIORITY[level] >= SOCKET_LOG_PRIORITY[getConfiguredLevel()];
}

function write(level: SocketLogLevel, message: string, metadata?: SocketLogMetadata): void {
  if (!shouldLog(level)) {
    return;
  }

  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...metadata,
  };

  if (level === 'error') {
    console.error(formatSocketLogLine(message, metadata));
    return;
  }

  if (level === 'warn') {
    console.warn(formatSocketLogLine(message, metadata));
    return;
  }

  console.log('[socket]', payload);
}

const SLOW_EVENT_DEFAULT_MS = 2000;

export function getSlowEventThresholdMs(): number {
  const raw = Number(process.env.SOCKET_SLOW_EVENT_MS);
  return Number.isFinite(raw) && raw > 0 ? raw : SLOW_EVENT_DEFAULT_MS;
}

/** Uma linha, sem o objeto inspecionado. O stderr do Expedição grava cada linha em disco. */
export function formatSocketLogLine(message: string, metadata?: SocketLogMetadata): string {
  const parts = [`[socket] ${message}`];
  appendLogPart(parts, 'event', metadata?.event);
  appendLogPart(parts, 'durationMs', metadata?.durationMs);
  appendLogPart(parts, 'rows', metadata?.rows);
  appendLogPart(parts, 'listenRows', metadata?.listenRows);
  appendLogPart(parts, 'listenCount', metadata?.listenCount);
  appendLogPart(parts, 'status', metadata?.status);
  appendLogPart(parts, 'errorCode', metadata?.errorCode);
  if (metadata?.error) {
    parts.push(`error=${oneLine(metadata.error)}`);
  }
  return parts.join(' ');
}

function appendLogPart(parts: string[], name: string, value: unknown): void {
  if (value === undefined || value === null || value === '') return;
  parts.push(`${name}=${oneLine(value)}`);
}

function oneLine(value: unknown): string {
  return String(value).replace(/\s+/g, ' ').slice(0, 300);
}

export function logSocketInfo(message: string, metadata?: SocketLogMetadata): void {
  write('info', message, metadata);
}

export function logSocketWarn(message: string, metadata?: SocketLogMetadata): void {
  write('warn', message, metadata);
}

export function logSocketError(message: string, metadata?: SocketLogMetadata): void {
  write('error', message, metadata);
}

export function logSocketLifecycle(
  message: string,
  metadata?: SocketLogMetadata,
  level: SocketLogLevel = 'info',
): void {
  write(level, message, metadata);
}

export function logSocketDuration(metadata: SocketLogMetadata): void {
  if ((metadata.durationMs ?? 0) >= getSlowEventThresholdMs()) {
    write('warn', 'Slow socket event', metadata);
  }
}
