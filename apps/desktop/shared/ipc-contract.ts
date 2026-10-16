import type { DesktopConfig, PublicDesktopConfig } from './config-schema';

export type ServerState = 'stopped' | 'starting' | 'running' | 'failed';

export type ServerStatus = {
  state: ServerState;
  portOpen: boolean;
  pid: number | null;
  port: number;
  message: string;
  attempt: number;
  /** Epoch em ms da próxima tentativa. Nulo quando não há espera. */
  retryAt: number | null;
  restartRequired: boolean;
  /** O que o processo no ar ainda não recebeu. Vazio quando não há reinício pendente. */
  pendingChanges: string[];
};

export type DatabaseProbeResult = {
  ok: boolean;
  message: string;
};

export type LogLine = {
  id: number;
  at: string;
  stream: 'out' | 'err';
  text: string;
  error: boolean;
};

export type ConfigSnapshot = {
  config: PublicDesktopConfig;
  needsSetup: boolean;
};

export type SocketTraceDirection = 'in' | 'out';

export type SocketTraceEntry = {
  at: string;
  direction: SocketTraceDirection;
  event: string;
  durationMs: number | null;
  bytes: number;
  slow: boolean;
  error: boolean;
  broadcast: boolean;
  preview: string;
};

export type SocketClientSummary = {
  socketId: string;
  address: string;
  transport: string;
  connectedAt: string;
  lastEventAt: string | null;
  lastEvent: string;
  lastSession: string;
  inCount: number;
  outCount: number;
  errorCount: number;
  slowCount: number;
  lastDurationMs: number | null;
  maxDurationMs: number | null;
  rttMs: number | null;
  rttAt: string | null;
  bytesIn: number;
  bytesOut: number;
  writeBufferDepth: number;
};

export type SocketDisconnectRecord = {
  socketId: string;
  at: string;
  reason: string;
  connectedMs: number;
};

export type SocketMonitorSnapshot = {
  now: string;
  eventLoopDelayMs: { mean: number; p99: number };
  clients: SocketClientSummary[];
  recentDisconnects: SocketDisconnectRecord[];
};

export type SocketClientDetail = SocketClientSummary & {
  trace: SocketTraceEntry[];
};

export type SocketMonitorView = {
  available: boolean;
  message: string;
  snapshot: SocketMonitorSnapshot | null;
};

export type SocketMonitorDetailView = {
  available: boolean;
  message: string;
  client: SocketClientDetail | null;
};

export type DesktopApi = {
  getConfig(): Promise<ConfigSnapshot>;
  saveConfig(input: DesktopConfig): Promise<ConfigSnapshot>;
  testDatabase(input: DesktopConfig): Promise<DatabaseProbeResult>;
  importEnv(): Promise<DesktopConfig | null>;
  startServer(): Promise<ServerStatus>;
  stopServer(): Promise<ServerStatus>;
  restartServer(): Promise<ServerStatus>;
  getStatus(): Promise<ServerStatus>;
  getRecentLogs(): Promise<LogLine[]>;
  getErrors(): Promise<LogLine[]>;
  clearLiveView(): Promise<void>;
  clearErrorView(): Promise<void>;
  exportErrors(): Promise<string | null>;
  getSocketSnapshot(): Promise<SocketMonitorView>;
  getSocketDetail(socketId: string): Promise<SocketMonitorDetailView>;
  onLog(listener: (line: LogLine) => void): () => void;
  onStatus(listener: (status: ServerStatus) => void): () => void;
};
