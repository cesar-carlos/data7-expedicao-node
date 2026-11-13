import PeriodicListenContract from '../contracts/periodic.listen.contract';
import { logAppError, logAppInfo } from '../infra/app.logger';

const MAX_BACKOFF_EXPONENT = 5;
const MAX_BACKOFF_MS = 120_000;

export default abstract class BasePeriodicListenService implements PeriodicListenContract {
  private timeoutRef: NodeJS.Timeout | null = null;
  private running: boolean = false;
  private paused: boolean = false;
  private consecutiveFailures: number = 0;
  private generation = 0;
  private emitting = false;
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
    this.generation += 1;
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
    this.generation += 1;
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
    if (!this.running || this.emitting) {
      return;
    }

    if (this.paused) {
      this.scheduleNext(this.intervalTime);
      return;
    }

    const generation = this.generation;
    this.emitting = true;
    try {
      await this.emitData();
      if (generation === this.generation) this.consecutiveFailures = 0;
    } catch (error: unknown) {
      if (generation === this.generation) {
        this.consecutiveFailures += 1;
        this.logEmitError(error);
      } else {
        logAppError(`${this.constructor.name} erro ao emitir dados`, {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    } finally {
      this.emitting = false;
    }

    if (!this.running) {
      return;
    }

    // A restart waits for the previous emission without inheriting its backoff.
    if (generation !== this.generation) {
      void this.runTick();
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
