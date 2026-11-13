import { ConnectionPool, config as SqlConfig, Transaction, Request } from 'mssql';

import createMssqlConfig, { resolveMssqlRuntimeOptions, type MssqlRuntimeOptions } from '../assets/config.msql';
import { logAppError, logAppInfo, logAppWarn } from './app.logger';
import { trackSqlRequest } from './sql.request.scope';

/** Commit below this threshold stays out of the log. PM2 stdout was hundreds of MB. */
const SLOW_TRANSACTION_LOG_MS = 1000;
const GET_CONNECTION_MAX_RETRIES = 3;

type PoolFactory = (config: SqlConfig) => ConnectionPool;

type PoolCounters = {
  size?: number;
  available?: number;
  pending?: number;
  borrowed?: number;
};

type HealthProbe = 'ok' | 'busy' | 'fail';

type TrackedPool = ConnectionPool & { __sqlScopeTracked?: boolean } & PoolCounters;

type TimedRequest = Request & { timeout?: number };

export function isSqlPoolAcquireTimeout(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /resource.?request timed out|timeout: resource|acquire.*timeout|ETIMEOUT/i.test(message);
}

export default class ConnectionSqlServerMssql {
  private static instance: ConnectionSqlServerMssql | undefined;
  private pool: ConnectionPool | null = null;
  private openingPool: ConnectionPool | null = null;
  private isClosing = false;

  private initializationPromise: Promise<void> | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private heartbeatRunning = false;
  private consecutiveHealthFailures = 0;
  private reconnectPromise: Promise<void> | null = null;
  private initializing = false;
  private untrackedRequest: ConnectionPool['request'] | null = null;
  private runtime: MssqlRuntimeOptions = resolveMssqlRuntimeOptions();
  private readonly createPool: PoolFactory;

  private static readonly healthFailuresBeforeReconnect = 2;

  private connectionMetrics = {
    totalConnections: 0,
    failedConnections: 0,
    reconnections: 0,
    lastConnectionTime: null as Date | null,
    uptime: Date.now(),
    activeTransactions: 0,
    totalTransactions: 0,
    failedTransactions: 0,
  };

  private activeTransactions = new Map<
    string,
    {
      transaction: Transaction;
      startTime: Date;
      timeout?: NodeJS.Timeout;
      state: 'active' | 'committing' | 'rollingback' | 'done';
    }
  >();

  private constructor(createPool?: PoolFactory) {
    this.createPool = createPool ?? ((config) => new ConnectionPool(config));
  }

  private async initPool(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    if (this.pool?.connected) {
      return;
    }

    if (this.isClosing) {
      throw new Error('Não é possível inicializar o pool enquanto ele está fechando');
    }

    this.initializationPromise = this.doInitialize();

    try {
      await this.initializationPromise;
    } finally {
      this.initializationPromise = null;
    }
  }

  private async doInitialize(): Promise<void> {
    this.initializing = true;
    try {
      this.logInfo('Inicializando pool de conexão...', {
        attempt: this.connectionMetrics.totalConnections + 1,
      });

      this.runtime = resolveMssqlRuntimeOptions();
      const config = createMssqlConfig();
      const poolConfig: SqlConfig = {
        ...config,
        connectionTimeout: this.runtime.connectionTimeout,
        requestTimeout: this.runtime.requestTimeout,
        pool: this.runtime.pool,
        options: {
          ...config.options,
          enableArithAbort: true,
        },
      };

      const pool = this.createPool(poolConfig);
      this.openingPool = pool;
      try {
        this.bindPoolEvents(pool);
        await pool.connect();
      } catch (connectError) {
        try {
          await pool.close();
        } catch {
          // The pool never opened; close only avoids an orphan TDS socket.
        }
        throw connectError;
      } finally {
        if (this.openingPool === pool) {
          this.openingPool = null;
        }
      }

      if (this.isClosing) {
        try {
          await pool.close();
        } catch {
          // Shutdown won the race with connect().
        }
        throw new Error('Não é possível inicializar o pool enquanto ele está fechando');
      }

      this.pool = pool;
      this.ensureRequestTracking(pool);
      this.connectionMetrics.totalConnections++;
      this.connectionMetrics.lastConnectionTime = new Date();
      this.logInfo('Pool de conexão conectado com sucesso', {
        totalConnections: this.connectionMetrics.totalConnections,
        timestamp: this.connectionMetrics.lastConnectionTime,
        poolMax: this.runtime.pool.max,
        poolMin: this.runtime.pool.min,
      });
      this.startHeartbeat();
    } catch (error) {
      this.connectionMetrics.failedConnections++;
      this.logError('Erro ao inicializar pool', error, {
        failedConnections: this.connectionMetrics.failedConnections,
      });
      this.pool = null;
      this.untrackedRequest = null;
      this.stopHeartbeat();
      throw new Error(
        `Falha ao inicializar pool de conexão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      );
    } finally {
      this.initializing = false;
    }
  }

  private bindPoolEvents(pool: ConnectionPool): void {
    pool.on('error', (err) => {
      this.connectionMetrics.failedConnections++;
      this.logError('Erro no pool de conexão', err, {
        failedConnections: this.connectionMetrics.failedConnections,
      });
      if (this.initializing || this.isClosing || this.reconnectPromise) return;
      if (this.pool !== pool) return;
      void this.reconnectSingleFlight();
    });

    pool.on('close', () => {
      if (this.pool !== pool) return;
      this.logInfo('Pool de conexão fechado');
      this.pool = null;
      this.untrackedRequest = null;
      this.stopHeartbeat();
    });
  }

  public static getInstance(): ConnectionSqlServerMssql {
    if (!ConnectionSqlServerMssql.instance) {
      ConnectionSqlServerMssql.instance = new ConnectionSqlServerMssql();
    }
    return ConnectionSqlServerMssql.instance;
  }

  /** Replaces the singleton so tests can inject a fake pool factory. */
  static startTestInstance(createPool: PoolFactory): ConnectionSqlServerMssql {
    const instance = new ConnectionSqlServerMssql(createPool);
    ConnectionSqlServerMssql.instance = instance;
    return instance;
  }

  async getConnection(): Promise<ConnectionPool> {
    const pool = await this.getConnectionWithRetry(GET_CONNECTION_MAX_RETRIES);
    this.ensureRequestTracking(pool);
    return pool;
  }

  private ensureRequestTracking(pool: ConnectionPool): void {
    const tracked = pool as TrackedPool;
    if (tracked.__sqlScopeTracked) return;

    const originalRequest = pool.request.bind(pool);
    this.untrackedRequest = originalRequest;
    pool.request = ((...args: Parameters<ConnectionPool['request']>) => {
      const request = originalRequest(...args);
      trackSqlRequest(request);
      patchTrackedRequest(request);
      return request;
    }) as ConnectionPool['request'];
    tracked.__sqlScopeTracked = true;
  }

  private async getConnectionWithRetry(maxRetries: number = GET_CONNECTION_MAX_RETRIES): Promise<ConnectionPool> {
    if (this.isClosing) {
      throw new Error('Não é possível obter conexão enquanto o pool está fechando');
    }

    if (this.initializationPromise) {
      await this.initializationPromise;
      if (this.pool?.connected) return this.pool;
    }

    if (this.reconnectPromise) {
      await this.reconnectPromise;
      if (this.pool?.connected) return this.pool;
    }

    if (this.pool?.connected) {
      return this.pool;
    }

    if (this.pool?.connecting) {
      await this.initPool();
      if (this.pool?.connected) return this.pool;
    }

    if (this.pool && !this.pool.connected && !this.pool.connecting) {
      this.logInfo('Pool desconectado, tentando reconectar...', {
        reconnections: this.connectionMetrics.reconnections,
      });
      try {
        await this.reconnectSingleFlight();
      } catch (error) {
        this.logError('Reconexão do pool falhou', error);
      }
      if (this.pool?.connected) return this.pool;
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      if (this.isClosing) {
        throw new Error('Não é possível obter conexão enquanto o pool está fechando');
      }

      try {
        await this.initPool();

        if (!this.pool || !this.pool.connected) {
          throw new Error('Pool não foi inicializado corretamente');
        }

        this.logInfo('Conexão estabelecida com sucesso', {
          attempt,
          maxRetries,
        });

        return this.pool;
      } catch (error) {
        lastError = error as Error;
        this.logError(`Tentativa ${attempt} de ${maxRetries} falhou`, error, {
          attempt,
          maxRetries,
          willRetry: attempt < maxRetries && !this.isClosing,
        });

        if (attempt < maxRetries && !this.isClosing) {
          const delay = Math.min(1000 * 2 ** (attempt - 1), 4000);
          this.logInfo(`Aguardando ${delay}ms antes da próxima tentativa...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(
      `Falha ao estabelecer conexão após ${maxRetries} tentativas: ${lastError?.message || 'Erro desconhecido'}`,
    );
  }

  async closePool(): Promise<void> {
    if (this.isClosing) {
      return;
    }

    this.isClosing = true;

    try {
      this.stopHeartbeat();

      if (this.activeTransactions.size > 0) {
        this.logInfo(`Fazendo rollback de ${this.activeTransactions.size} transações ativas antes de fechar o pool`);
        await this.rollbackAllTransactions();
      }

      // mssql rejects close() during connect(). Keep shutdown active until
      // initialization settles; doInitialize closes a pool opened during shutdown.
      if (this.initializationPromise) {
        await this.initializationPromise.catch(() => undefined);
      }

      const opening = this.openingPool;
      this.openingPool = null;
      const pool = this.pool;
      this.pool = null;
      this.untrackedRequest = null;

      const toClose = [opening, pool].filter((item, index, list): item is ConnectionPool => {
        return item !== null && list.indexOf(item) === index;
      });

      for (const candidate of toClose) {
        try {
          await candidate.close();
        } catch (error) {
          this.logError('Erro ao fechar pool', error);
          throw new Error(
            `Falha ao fechar pool de conexão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
          );
        }
      }

      if (toClose.length > 0) {
        this.logInfo('Pool de conexão fechado com sucesso', {
          totalConnections: this.connectionMetrics.totalConnections,
          failedConnections: this.connectionMetrics.failedConnections,
          reconnections: this.connectionMetrics.reconnections,
          totalTransactions: this.connectionMetrics.totalTransactions,
          failedTransactions: this.connectionMetrics.failedTransactions,
        });
      }
    } finally {
      this.isClosing = false;
    }
  }

  async healthCheck(): Promise<boolean> {
    const probe = await this.probeHealth();
    return probe === 'ok' || probe === 'busy';
  }

  private async probeHealth(): Promise<HealthProbe> {
    const pool = this.pool;
    if (!pool || !pool.connected) {
      return 'fail';
    }

    const counters = readPoolCounters(pool);
    if (isPoolBusy(counters)) {
      return 'busy';
    }

    try {
      const request = this.createUntrackedRequest(pool);
      request.timeout = this.runtime.healthCheckTimeoutMs;
      const result = await request.query('SELECT 1 as health');
      if (result.recordset.length === 0) {
        this.logError('Health check falhou: resultado inválido');
        return 'fail';
      }
      return 'ok';
    } catch (error) {
      if (isSqlPoolAcquireTimeout(error)) {
        this.logInfo('Health check omitido: pool ocupado (acquire timeout)');
        return 'busy';
      }
      this.logError('Health check falhou', error);
      return 'fail';
    }
  }

  private createUntrackedRequest(pool: ConnectionPool): TimedRequest {
    const makeRequest = this.untrackedRequest ?? pool.request.bind(pool);
    return makeRequest() as TimedRequest;
  }

  getPoolStats() {
    if (!this.pool) {
      return null;
    }

    const counters = readPoolCounters(this.pool);
    return {
      connected: this.pool.connected,
      connecting: this.pool.connecting,
      healthy: this.pool.healthy,
      size: counters.size,
      available: counters.available,
      pending: counters.pending,
      borrowed: counters.borrowed,
    };
  }

  getMetrics() {
    return {
      ...this.connectionMetrics,
      uptime: Date.now() - this.connectionMetrics.uptime,
      poolStats: this.getPoolStats(),
      heartbeatActive: this.heartbeatInterval !== null,
      activeTransactions: this.activeTransactions.size,
    };
  }

  async beginTransaction(transactionId?: string, timeoutMs: number = 30000): Promise<string> {
    const pool = await this.getConnection();
    const txId = transactionId || this.generateTransactionId();

    if (this.activeTransactions.has(txId)) {
      throw new Error(`Transação com ID '${txId}' já está ativa`);
    }

    try {
      const transaction = new Transaction(pool);
      await transaction.begin();

      const timeout = setTimeout(() => {
        const current = this.activeTransactions.get(txId);
        if (!current || current.state !== 'active') return;
        this.logError(`Transação ${txId} expirou após ${timeoutMs}ms - fazendo rollback automático`);
        this.rollbackTransaction(txId).catch((err) => this.logError('Erro durante rollback automático', err));
      }, timeoutMs);

      this.activeTransactions.set(txId, {
        transaction,
        startTime: new Date(),
        timeout,
        state: 'active',
      });

      this.connectionMetrics.totalTransactions++;
      this.connectionMetrics.activeTransactions = this.activeTransactions.size;

      return txId;
    } catch (error) {
      this.connectionMetrics.failedTransactions++;
      this.logError(`Erro ao iniciar transação ${txId}`, error);
      throw new Error(`Falha ao iniciar transação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async commitTransaction(transactionId: string): Promise<void> {
    const txData = this.activeTransactions.get(transactionId);

    if (!txData || txData.state !== 'active') {
      throw new Error(`Transação '${transactionId}' não encontrada ou já foi finalizada`);
    }

    txData.state = 'committing';
    if (txData.timeout) {
      clearTimeout(txData.timeout);
    }

    try {
      await txData.transaction.commit();
      txData.state = 'done';

      this.activeTransactions.delete(transactionId);
      this.connectionMetrics.activeTransactions = this.activeTransactions.size;

      const duration = Date.now() - txData.startTime.getTime();
      this.logSlowTransaction('commit', duration);
    } catch (error) {
      this.connectionMetrics.failedTransactions++;
      this.logError(`Erro ao fazer commit da transação ${transactionId}`, error);

      if (txData.state === 'committing') {
        txData.state = 'active';
      }

      try {
        await this.rollbackTransaction(transactionId);
      } catch (rollbackError) {
        this.logError(`Erro adicional durante rollback após falha no commit`, rollbackError);
      }

      throw new Error(`Falha no commit da transação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async rollbackTransaction(transactionId: string): Promise<void> {
    const txData = this.activeTransactions.get(transactionId);

    if (!txData) {
      this.logError(`Tentativa de rollback de transação inexistente: ${transactionId}`);
      return;
    }

    if (txData.state === 'committing' || txData.state === 'rollingback' || txData.state === 'done') {
      return;
    }

    txData.state = 'rollingback';
    if (txData.timeout) {
      clearTimeout(txData.timeout);
    }

    try {
      await txData.transaction.rollback();
      txData.state = 'done';

      this.activeTransactions.delete(transactionId);
      this.connectionMetrics.activeTransactions = this.activeTransactions.size;

      const duration = Date.now() - txData.startTime.getTime();
      this.logSlowTransaction('rollback', duration);
    } catch (error) {
      this.connectionMetrics.failedTransactions++;
      this.activeTransactions.delete(transactionId);
      this.connectionMetrics.activeTransactions = this.activeTransactions.size;

      this.logError(`Erro ao fazer rollback da transação ${transactionId}`, error);
      throw new Error(
        `Falha no rollback da transação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      );
    }
  }

  getTransactionRequest(transactionId: string): Request {
    const txData = this.activeTransactions.get(transactionId);

    if (!txData || txData.state !== 'active') {
      throw new Error(`Transação '${transactionId}' não encontrada ou já foi finalizada`);
    }

    return txData.transaction.request();
  }

  /**
   * Runs one command on SQL Server autocommit.
   * A single statement is already atomic; wrapping BEGIN/COMMIT added two extra round trips.
   * Real transactions stay opt-in via beginTransaction so legacy collectors keep the same commit boundary.
   */
  async executeInTransaction<T>(
    operation: (request: Request, transactionId: string) => Promise<T>,
    _timeoutMs: number = 30000,
  ): Promise<T> {
    const pool = await this.getConnection();
    return operation(pool.request(), 'autocommit');
  }

  getActiveTransactions(): Array<{
    id: string;
    startTime: Date;
    duration: number;
  }> {
    const now = Date.now();
    return Array.from(this.activeTransactions.entries()).map(([id, data]) => ({
      id,
      startTime: data.startTime,
      duration: now - data.startTime.getTime(),
    }));
  }

  async rollbackAllTransactions(): Promise<void> {
    const activeIds = Array.from(this.activeTransactions.keys());

    if (activeIds.length === 0) {
      return;
    }

    this.logInfo(`Fazendo rollback de ${activeIds.length} transações ativas`, {
      transactionIds: activeIds,
    });

    const rollbackPromises = activeIds.map((id) =>
      this.rollbackTransaction(id).catch((error) => this.logError(`Erro ao fazer rollback da transação ${id}`, error)),
    );

    await Promise.all(rollbackPromises);
  }

  private generateTransactionId(): string {
    return `tx_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }

  private reconnectSingleFlight(): Promise<void> {
    if (this.reconnectPromise) return this.reconnectPromise;

    this.reconnectPromise = this.doReconnect().finally(() => {
      this.reconnectPromise = null;
    });
    return this.reconnectPromise;
  }

  private async doReconnect(): Promise<void> {
    if (this.isClosing) return;

    this.logInfo('Reconectando o pool de conexão...');
    const previous = this.pool;
    this.pool = null;
    this.untrackedRequest = null;
    this.stopHeartbeat();
    this.consecutiveHealthFailures = 0;

    if (previous) {
      try {
        await previous.close();
      } catch (error) {
        this.logError('Erro ao fechar pool durante reconexão', error);
      }
    }

    this.connectionMetrics.reconnections++;
    await this.initPool();
  }

  /** Opens the pool and validates it with SELECT 1 so the first request is not cold. */
  async warmup(): Promise<void> {
    try {
      await this.getConnection();
      await this.healthCheck();
    } catch (e) {
      this.logError('Warmup do pool falhou; conexão será lazy na primeira operação', e);
    }
  }

  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      return;
    }

    const intervalMs = this.runtime.heartbeatIntervalMs;

    this.heartbeatInterval = setInterval(() => {
      void this.runHeartbeat();
    }, intervalMs);
    this.heartbeatInterval.unref();

    this.logInfo('Heartbeat iniciado', { intervalMs });
  }

  private async runHeartbeat(): Promise<void> {
    if (this.heartbeatRunning || this.isClosing || this.reconnectPromise) return;
    this.heartbeatRunning = true;
    try {
      if (!this.pool?.connected) return;

      const probe = await this.probeHealth();
      if (probe === 'ok' || probe === 'busy') {
        this.consecutiveHealthFailures = 0;
        return;
      }

      this.consecutiveHealthFailures += 1;
      if (this.consecutiveHealthFailures < ConnectionSqlServerMssql.healthFailuresBeforeReconnect) {
        this.logError('Health check falhou; a próxima falha consecutiva reconecta o pool');
        return;
      }

      this.consecutiveHealthFailures = 0;
      this.logError('Health check falhou de forma consecutiva, tentando reconectar...');
      try {
        await this.reconnectSingleFlight();
      } catch (error) {
        this.logError('Falha na reconexão automática', error);
      }
    } finally {
      this.heartbeatRunning = false;
    }
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
      this.logInfo('Heartbeat parado');
    }
  }

  private logSlowTransaction(action: 'commit' | 'rollback', durationMs: number): void {
    if (durationMs < SLOW_TRANSACTION_LOG_MS) return;
    logAppWarn(`Transação lenta`, { action, durationMs });
  }

  private logInfo(message: string, metadata?: Record<string, unknown>): void {
    logAppInfo(message, metadata);
  }

  private logError(message: string, error?: unknown, metadata?: Record<string, unknown>): void {
    logAppError(message, {
      error: error instanceof Error ? error.message : error,
      ...metadata,
    });
  }

  static async shutdown(): Promise<void> {
    if (ConnectionSqlServerMssql.instance) {
      await ConnectionSqlServerMssql.instance.closePool();
      ConnectionSqlServerMssql.instance = undefined;
    }
  }

  /** Drops the singleton after tests. Heartbeat is stopped even if close hangs. */
  static async resetForTests(): Promise<void> {
    const instance = ConnectionSqlServerMssql.instance;
    if (!instance) return;
    instance.stopHeartbeat();
    instance.pool = null;
    instance.openingPool = null;
    instance.untrackedRequest = null;
    instance.initializationPromise = null;
    instance.reconnectPromise = null;
    instance.isClosing = false;
    ConnectionSqlServerMssql.instance = undefined;
  }
}

function readPoolCounters(pool: ConnectionPool): PoolCounters {
  const counters = pool as TrackedPool;
  return {
    size: typeof counters.size === 'number' ? counters.size : undefined,
    available: typeof counters.available === 'number' ? counters.available : undefined,
    pending: typeof counters.pending === 'number' ? counters.pending : undefined,
    borrowed: typeof counters.borrowed === 'number' ? counters.borrowed : undefined,
  };
}

function isPoolBusy(counters: PoolCounters): boolean {
  if (counters.available !== 0) return false;
  const pending = counters.pending ?? 0;
  const borrowed = counters.borrowed ?? 0;
  return pending > 0 || borrowed > 0;
}

function patchTrackedRequest(request: Request): void {
  const originalQuery = request.query.bind(request) as (command: string) => Promise<unknown>;

  const patchedQuery = (command: string) => {
    const sqlText = typeof command === 'string' ? `SET LOCK_TIMEOUT -1;\n${command}` : command;
    return originalQuery(sqlText).catch((error: unknown) => {
      try {
        request.cancel();
      } catch {
        // The driver may already have finished the request.
      }
      throw error;
    });
  };

  (request as unknown as { query: typeof patchedQuery }).query = patchedQuery;
}
