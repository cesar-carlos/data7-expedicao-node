import PeriodicListenContract from '../contracts/periodic.listen.contract';

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
      console.log(`[${this.constructor.name}] Já está em execução`);
      return;
    }

    this.running = true;
    this.paused = false;
    this.consecutiveFailures = 0;

    console.log(`[${this.constructor.name}] Iniciado com intervalo base de ${this.intervalTime}ms`);
    void this.runTick();
  }

  /**
   * Para o listener periódico e limpa o agendamento
   */
  public stop(): void {
    if (!this.running) {
      console.log(`[${this.constructor.name}] Não está em execução`);
      return;
    }

    if (this.timeoutRef) {
      clearTimeout(this.timeoutRef);
      this.timeoutRef = null;
    }

    this.running = false;
    this.paused = false;
    this.consecutiveFailures = 0;

    console.log(`[${this.constructor.name}] Parado`);
  }

  /**
   * Pausa as emissões sem parar o ciclo de agendamento
   */
  public pause(): void {
    if (!this.running) {
      console.log(`[${this.constructor.name}] Não está em execução`);
      return;
    }

    if (this.paused) {
      console.log(`[${this.constructor.name}] Já está pausado`);
      return;
    }

    this.paused = true;
    console.log(`[${this.constructor.name}] Pausado`);
  }

  /**
   * Retoma as emissões
   */
  public resume(): void {
    if (!this.running) {
      console.log(`[${this.constructor.name}] Não está em execução`);
      return;
    }

    if (!this.paused) {
      console.log(`[${this.constructor.name}] Não está pausado`);
      return;
    }

    this.paused = false;
    console.log(`[${this.constructor.name}] Retomado`);
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
    if (error instanceof Error) {
      console.error(`[${name}] Erro ao emitir dados:`, error.message);
      if (error.stack) {
        console.error(error.stack);
      }
    } else {
      console.error(`[${name}] Erro ao emitir dados:`, error);
    }
    console.error(
      `[${name}] Falhas consecutivas: ${this.consecutiveFailures}; próximo intervalo (ms): ${this.computeNextDelayMs()}`,
    );
  }
}
