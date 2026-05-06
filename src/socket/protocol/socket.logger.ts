import SocketErrorCode from './socket.error.code';

type SocketLogLevel = 'debug' | 'info' | 'warn' | 'error';

type SocketLogMetadata = {
  event?: string;
  socketId?: string;
  responseIn?: string;
  requestId?: string;
  durationMs?: number;
  status?: string;
  listenCount?: number;
  errorCode?: SocketErrorCode;
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
    console.error('[socket]', payload);
    return;
  }

  if (level === 'warn') {
    console.warn('[socket]', payload);
    return;
  }

  console.log('[socket]', payload);
}

function getSlowEventThresholdMs(): number {
  const raw = Number(process.env.SOCKET_SLOW_EVENT_MS);
  return Number.isFinite(raw) && raw > 0 ? raw : 250;
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
