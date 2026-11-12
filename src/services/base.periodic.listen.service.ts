import PeriodicListenContract from '../contracts/periodic.listen.contract';
import { logAppError, logAppInfo } from '../infra/app.logger';

const MAX_BACKOFF_EXPONENT = 5;
const MAX_BACKOFF_MS = 120_000;

export default abstract class BasePeriodicListenService implements PeriodicListenContract {
  private timeoutRef: NodeJS.Timeout | null = null;
  private running: boolean = false;
  private paused: boolean = false;
  private consecutiveFailures: number = 0;
  protected intervalTime: number;

  constructor(intervalTime: number = 8000) {
    this.intervalTime = intervalTime;
  }

  /**
   * Método abstrato que deve ser implementado pelas subclasses
   * para definir o comportamento específico de emissão de dados
   */
  protected abstract emitData(): Promise<void>;

  /**
   * Inicia o listener periódico (uma execução por vez, sem sobreposição;
   * backoff exponencial após falhas consecutivas).
   */
  public start(): void {
    if (this.running) {
      logAppInfo(`${this.constructor.name} já está em execução`);
      return;
    }

    this.running = true;
    this.paused = false;
    this.consecutiveFailures = 0;

    logAppInfo(`${this.constructor.name} iniciado`, { intervalMs: this.intervalTime });
    void this.runTick();
  }

  /**
   * Para o listener periódico e limpa o agendamento
   */
  public stop(): void {
    if (!this.running) {
      logAppInfo(`${this.constructor.name} não está em execução`);
      return;
    }

    if (this.timeoutRef) {
      clearTimeout(this.timeoutRef);
      this.timeoutRef = null;
    }

    this.running = false;
    this.paused = false;
    this.consecutiveFailures = 0;

    logAppInfo(`${this.constructor.name} parado`);
  }

  /**
   * Pausa as emissões sem parar o ciclo de agendamento
   */
  public pause(): void {
    if (!this.running) {
      logAppInfo(`${this.constructor.name} não está em execução`);
      return;
    }

    if (this.paused) {
      logAppInfo(`${this.constructor.name} já está pausado`);
      return;
    }

    this.paused = true;
    logAppInfo(`${this.constructor.name} pausado`);
  }

  /**
   * Retoma as emissões
   */
  public resume(): void {
    if (!this.running) {
      logAppInfo(`${this.constructor.name} não está em execução`);
      return;
    }

    if (!this.paused) {
      logAppInfo(`${this.constructor.name} não está pausado`);
      return;
    }

    this.paused = false;
    logAppInfo(`${this.constructor.name} retomado`);
  }

  public isRunning(): boolean {
    return this.running;
  }

  public isPaused(): boolean {
    return this.paused;
  }

  public listen(): void {
    this.start();
  }

  private async runTick(): Promise<void> {
    if (!this.running) {
      return;
    }

    if (this.paused) {
      this.scheduleNext(this.intervalTime);
      return;
    }

    try {
      await this.emitData();
      this.consecutiveFailures = 0;
    } catch (error: unknown) {
      this.consecutiveFailures += 1;
      this.logEmitError(error);
    }

    if (!this.running) {
      return;
    }

    this.scheduleNext(this.computeNextDelayMs());
  }

  private computeNextDelayMs(): number {
    if (this.consecutiveFailures === 0) {
      return this.intervalTime;
    }
    const exponent = Math.min(this.consecutiveFailures, MAX_BACKOFF_EXPONENT);
    return Math.min(this.intervalTime * Math.pow(2, exponent), MAX_BACKOFF_MS);
  }

  private scheduleNext(delayMs: number): void {
    if (!this.running) {
      return;
    }
    if (this.timeoutRef) {
      clearTimeout(this.timeoutRef);
    }
    this.timeoutRef = setTimeout(() => {
      this.timeoutRef = null;
      void this.runTick();
    }, delayMs);
  }

  private logEmitError(error: unknown): void {
    const name = this.constructor.name;
    logAppError(`${name} erro ao emitir dados`, {
      error: error instanceof Error ? error.message : String(error),
      consecutiveFailures: this.consecutiveFailures,
      nextDelayMs: this.computeNextDelayMs(),
    });
  }
}
