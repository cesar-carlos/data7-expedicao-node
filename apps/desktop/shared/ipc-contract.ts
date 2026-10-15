import type { DesktopConfig, PublicDesktopConfig } from './config-schema';

export type ServerState = 'stopped' | 'starting' | 'running' | 'failed';

export type ServerStatus = {
  state: ServerState;
  portOpen: boolean;
  pid: number | null;
  port: number;
  message: string;
  attempt: number;
  restartRequired: boolean;
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
  onLog(listener: (line: LogLine) => void): () => void;
  onStatus(listener: (status: ServerStatus) => void): () => void;
};
