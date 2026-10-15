import { spawn, type ChildProcess } from 'child_process';
import path from 'path';

import { retryDelayMs, serviceConfigChanged, type DesktopConfig } from '../shared/config-schema';
import type { LogLine, ServerStatus } from '../shared/ipc-contract';
import type { LogBuffer } from './log-buffer';
import { probePort } from './port-check';

const STOP_TIMEOUT_MS = 8000;
const PORT_GRACE_MS = 20_000;

export type SupervisorDeps = {
  log: LogBuffer;
  nodeBinary: () => string;
  serverEntry: () => string;
  readConfig: () => DesktopConfig | null;
  materializeEnv: () => NodeJS.ProcessEnv | null;
  onStatus: (status: ServerStatus) => void;
  onLine: (line: LogLine) => void;
};

export class ProcessSupervisor {
  private child: ChildProcess | null = null;
  private failures = 0;
  private intentionalStop = false;
  private spawnedAt = 0;
  private retryTimer: NodeJS.Timeout | null = null;
  private probeTimer: NodeJS.Timeout | null = null;
  private launched: DesktopConfig | null = null;
  private status: ServerStatus = {
    state: 'stopped',
    portOpen: false,
    pid: null,
    port: 0,
    message: 'Configure e salve para iniciar.',
    attempt: 0,
    restartRequired: false,
  };

  constructor(private readonly deps: SupervisorDeps) {}

  current(): ServerStatus {
    return this.status;
  }

  isRunning(): boolean {
    return this.child !== null;
  }

  noteSaved(): void {
    this.publish({
      state: this.status.state,
      portOpen: this.status.portOpen,
      pid: this.status.pid,
      port: this.status.port,
      message: this.status.message,
      attempt: this.status.attempt,
    });
  }

  async start(): Promise<ServerStatus> {
    if (this.child) {
      return this.status;
    }
    this.intentionalStop = false;
    this.failures = 0;
    this.clearRetry();
    this.spawnChild();
    return this.status;
  }

  async stop(): Promise<ServerStatus> {
    this.intentionalStop = true;
    this.clearRetry();
    const child = this.child;
    if (!child) {
      this.launched = null;
      this.publish({
        state: 'stopped',
        portOpen: false,
        pid: null,
        port: this.status.port,
        message: 'Serviço parado.',
        attempt: 0,
      });
      return this.status;
    }

    this.publish({ ...this.status, state: 'starting', message: 'Encerrando o serviço.' });
    if (child.stdin && !child.stdin.destroyed) {
      child.stdin.write('shutdown\n');
    }
    await this.waitForExit(child, STOP_TIMEOUT_MS);
    if (this.child) {
      this.child.kill();
      await this.waitForExit(this.child, 2000);
    }
    this.child = null;
    this.launched = null;
    this.stopProbe();
    this.publish({
      state: 'stopped',
      portOpen: false,
      pid: null,
      port: this.status.port,
      message: 'Serviço parado.',
      attempt: 0,
    });
    return this.status;
  }

  async restart(): Promise<ServerStatus> {
    await this.stop();
    this.intentionalStop = false;
    this.failures = 0;
    return this.start();
  }

  private spawnChild(): void {
    const env = this.deps.materializeEnv();
    const config = this.deps.readConfig();
    if (!env || !config) {
      this.publish({
        state: 'stopped',
        portOpen: false,
        pid: null,
        port: config?.serverPort ?? 0,
        message: 'Configure e salve para iniciar.',
        attempt: 0,
      });
      return;
    }

    let nodeBinary = 'node';
    let entry = '';
    try {
      nodeBinary = this.deps.nodeBinary();
      entry = this.deps.serverEntry();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.emitInternal('err', message);
      this.publish({
        state: 'failed',
        portOpen: false,
        pid: null,
        port: config.serverPort,
        message,
        attempt: this.failures,
      });
      return;
    }

    this.spawnedAt = Date.now();
    const child = spawn(nodeBinary, [entry], {
      cwd: path.dirname(entry),
      env,
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
    });
    this.child = child;
    this.launched = config;
    this.publish({
      state: 'starting',
      portOpen: false,
      pid: child.pid ?? null,
      port: config.serverPort,
      message: 'Iniciando o serviço.',
      attempt: this.failures,
    });
    this.startProbe();

    child.stdout?.setEncoding('utf8');
    child.stderr?.setEncoding('utf8');
    child.stdout?.on('data', (chunk: string) => this.forward('out', chunk));
    child.stderr?.on('data', (chunk: string) => this.forward('err', chunk));
    child.on('error', (error) => {
      this.emitInternal('err', error.message);
    });
    child.on('exit', (code) => {
      if (this.child === child) {
        this.child = null;
      }
      this.forward('out', '');
      this.deps.log.flush('out').forEach((line) => this.deps.onLine(line));
      this.deps.log.flush('err').forEach((line) => this.deps.onLine(line));
      this.stopProbe();
      if (this.intentionalStop) {
        return;
      }
      this.failures += 1;
      const delay = retryDelayMs(this.failures);
      const detail = code === null ? 'O processo foi encerrado.' : `O processo saiu com código ${code}.`;
      if (delay === null) {
        this.publish({
          state: 'failed',
          portOpen: false,
          pid: null,
          port: config.serverPort,
          message: `${detail} As tentativas automáticas pararam.`,
          attempt: this.failures,
        });
        return;
      }
      this.publish({
        state: 'starting',
        portOpen: false,
        pid: null,
        port: config.serverPort,
        message: `${detail} Nova tentativa em ${Math.round(delay / 1000)}s.`,
        attempt: this.failures,
      });
      this.retryTimer = setTimeout(() => this.spawnChild(), delay);
    });
  }

  private forward(stream: 'out' | 'err', chunk: string): void {
    for (const line of this.deps.log.append(stream, chunk)) {
      this.deps.onLine(line);
    }
  }

  private emitInternal(stream: 'out' | 'err', text: string): void {
    for (const line of this.deps.log.append(stream, `${text}\n`)) {
      this.deps.onLine(line);
    }
  }

  private startProbe(): void {
    this.stopProbe();
    this.probeTimer = setInterval(() => {
      void this.refreshPort();
    }, 2000);
  }

  private stopProbe(): void {
    if (this.probeTimer) {
      clearInterval(this.probeTimer);
      this.probeTimer = null;
    }
  }

  private async refreshPort(): Promise<void> {
    const child = this.child;
    const live = this.launched;
    if (!child || !live) {
      return;
    }
    const open = await probePort(live.serverPort);
    if (this.child !== child || this.intentionalStop) {
      return;
    }
    if (open) {
      this.failures = 0;
      this.publish({
        state: 'running',
        portOpen: true,
        pid: child.pid ?? null,
        port: live.serverPort,
        message: 'No ar.',
        attempt: 0,
      });
      return;
    }
    const waiting = Date.now() - this.spawnedAt;
    if (waiting > PORT_GRACE_MS) {
      this.publish({
        state: 'failed',
        portOpen: false,
        pid: child.pid ?? null,
        port: live.serverPort,
        message: 'O processo está ativo, mas a porta não aceita conexão.',
        attempt: this.failures,
      });
      return;
    }
    this.publish({
      state: 'starting',
      portOpen: false,
      pid: child.pid ?? null,
      port: live.serverPort,
      message: 'Aguardando a porta.',
      attempt: this.failures,
    });
  }

  private waitForExit(child: ChildProcess, timeoutMs: number): Promise<void> {
    if (child.exitCode !== null || child.signalCode !== null) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      const timer = setTimeout(() => resolve(), timeoutMs);
      child.once('exit', () => {
        clearTimeout(timer);
        resolve();
      });
    });
  }

  private clearRetry(): void {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
  }

  private restartRequired(): boolean {
    const current = this.deps.readConfig();
    if (!this.child || !this.launched || !current) {
      return false;
    }
    return serviceConfigChanged(this.launched, current);
  }

  private publish(status: Omit<ServerStatus, 'restartRequired'>): void {
    this.status = { ...status, restartRequired: this.restartRequired() };
    this.deps.onStatus(this.status);
  }
}
