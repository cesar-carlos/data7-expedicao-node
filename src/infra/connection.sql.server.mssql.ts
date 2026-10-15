import { ConnectionPool, config as SqlConfig, Transaction, Request } from 'mssql';

import createMssqlConfig from '../assets/config.msql';

export default class ConnectionSqlServerMssql {
  private static instance: ConnectionSqlServerMssql;
  private pool: ConnectionPool | null = null;
  private isClosing: boolean = false;

  private initializationPromise: Promise<void> | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private heartbeatRunning = false;
  private consecutiveHealthFailures = 0;
  private reconnectPromise: Promise<void> | null = null;
  private initializing = false;

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

  private constructor() {}

  private async initPool(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    if (this.pool && this.pool.connected) {
      return;
    }

    if (this.isClosing) {
      throw new Error('Cannot initialize pool while closing');
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

      const config = createMssqlConfig();
      const poolConfig: SqlConfig = {
        ...config,
        connectionTimeout: 30000,
        requestTimeout: 30000,
        pool: {
          max: 50,
          min: 2,
          idleTimeoutMillis: 30000,
          acquireTimeoutMillis: 60000,
        },
        options: {
          ...config.options,
          enableArithAbort: true,
        },
      } as SqlConfig;

      const pool = new ConnectionPool(poolConfig);
      this.pool = pool;

      pool.on('connect', () => {
        this.connectionMetrics.totalConnections++;
        this.connectionMetrics.lastConnectionTime = new Date();
        this.logInfo('Pool de conexão conectado com sucesso', {
          totalConnections: this.connectionMetrics.totalConnections,
          timestamp: this.connectionMetrics.lastConnectionTime,
        });
        this.startHeartbeat();
      });

      pool.on('close', () => {
        if (this.pool !== pool) return;
        this.logInfo('Pool de conexão fechado');
        this.pool = null;
        this.stopHeartbeat();
      });

      pool.on('error', (err) => {
        this.connectionMetrics.failedConnections++;
        this.logError('Erro no pool de conexão', err, {
          failedConnections: this.connectionMetrics.failedConnections,
        });
        if (this.initializing || this.isClosing || this.reconnectPromise) return;
        if (this.pool !== pool) return;
        void this.reconnectSingleFlight();
      });

      await pool.connect();
    } catch (error) {
      this.connectionMetrics.failedConnections++;
      this.logError('Erro ao inicializar pool', error, {
        failedConnections: this.connectionMetrics.failedConnections,
      });
      const failed = this.pool;
      this.pool = null;
      this.stopHeartbeat();
      if (failed) {
        try {
          await failed.close();
        } catch {
          // o pool já falhou ao abrir; o close só evita conexão órfã
        }
      }
      throw new Error(
        `Falha ao inicializar pool de conexão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      );
    } finally {
      this.initializing = false;
    }
  }

  public static getInstance(): ConnectionSqlServerMssql {
    if (!ConnectionSqlServerMssql.instance) {
      ConnectionSqlServerMssql.instance = new ConnectionSqlServerMssql();
    }
    return ConnectionSqlServerMssql.instance;
  }

  async getConnection(): Promise<ConnectionPool> {
    return this.getConnectionWithRetry(3);
  }

  private async getConnectionWithRetry(maxRetries: number = 3): Promise<ConnectionPool> {
    if (this.pool?.connected) {
      return this.pool;
    }

    if (this.reconnectPromise) {
      await this.reconnectPromise;
      if (this.pool?.connected) return this.pool;
    }

    if (this.pool && !this.pool.connected) {
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
          willRetry: attempt < maxRetries,
        });

        if (attempt < maxRetries) {
          const delay = 1000 * attempt; // Backoff exponencial
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

      // Rollback de todas as transações ativas antes de fechar
      if (this.activeTransactions.size > 0) {
        this.logInfo(`Fazendo rollback de ${this.activeTransactions.size} transações ativas antes de fechar o pool`);
        await this.rollbackAllTransactions();
      }

      if (this.pool) {
        if (this.pool.connected) {
          await this.pool.close();
        }
        this.pool = null;
        this.logInfo('Pool de conexão fechado com sucesso', {
          totalConnections: this.connectionMetrics.totalConnections,
          failedConnections: this.connectionMetrics.failedConnections,
          reconnections: this.connectionMetrics.reconnections,
          totalTransactions: this.connectionMetrics.totalTransactions,
          failedTransactions: this.connectionMetrics.failedTransactions,
        });
      }
    } catch (error) {
      this.logError('Erro ao fechar pool', error);
      this.pool = null;
      throw new Error(
        `Falha ao fechar pool de conexão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      );
    } finally {
      this.isClosing = false;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this.pool || !this.pool.connected) {
        return false;
      }

      const result = await this.pool.request().query('SELECT 1 as health');
      const isHealthy = result.recordset.length > 0;

      if (!isHealthy) {
        this.logError('Health check falhou: resultado inválido');
      }

      return isHealthy;
    } catch (error) {
      this.logError('Health check falhou', error);
      return false;
    }
  }

  getPoolStats() {
    if (!this.pool) {
      return null;
    }

    return {
      connected: this.pool.connected,
      connecting: this.pool.connecting,
      healthy: this.pool.healthy,
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

  // ==================== TRANSACTION CONTROL METHODS ====================

  /**
   * Inicia uma nova transação
   * @param transactionId - ID único para a transação (opcional, será gerado se não fornecido)
   * @param timeoutMs - Timeout da transação em milissegundos (padrão: 30 segundos)
   * @returns ID da transação
   */
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

      this.logInfo(`Transação iniciada`, {
        transactionId: txId,
        timeout: `${timeoutMs}ms`,
        activeTransactions: this.activeTransactions.size,
      });

      return txId;
    } catch (error) {
      this.connectionMetrics.failedTransactions++;
      this.logError(`Erro ao iniciar transação ${txId}`, error);
      throw new Error(`Falha ao iniciar transação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Confirma uma transação
   * @param transactionId - ID da transação
   */
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
      this.logInfo(`Transação commitada com sucesso`, {
        transactionId,
        duration: `${duration}ms`,
        activeTransactions: this.activeTransactions.size,
      });
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

  /**
   * Desfaz uma transação
   * @param transactionId - ID da transação
   */
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
      this.logInfo(`Transação desfeita com sucesso`, {
        transactionId,
        duration: `${duration}ms`,
        activeTransactions: this.activeTransactions.size,
      });
    } catch (error) {
      this.connectionMetrics.failedTransactions++;
      this.activeTransactions.delete(transactionId); // Remove mesmo em caso de erro
      this.connectionMetrics.activeTransactions = this.activeTransactions.size;

      this.logError(`Erro ao fazer rollback da transação ${transactionId}`, error);
      throw new Error(
        `Falha no rollback da transação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      );
    }
  }

  /**
   * Obtém uma requisição SQL associada a uma transação
   * @param transactionId - ID da transação
   * @returns Request object para executar comandos SQL na transação
   */
  getTransactionRequest(transactionId: string): Request {
    const txData = this.activeTransactions.get(transactionId);

    if (!txData || txData.state !== 'active') {
      throw new Error(`Transação '${transactionId}' não encontrada ou já foi finalizada`);
    }

    return txData.transaction.request();
  }

  /**
   * Executa um único comando no autocommit do SQL Server.
   * Um statement já é atômico; BEGIN/COMMIT em volta só acrescentava duas idas à rede.
   * O timeout do comando continua sendo o requestTimeout do pool.
   */
  async executeInTransaction<T>(
    operation: (request: Request, transactionId: string) => Promise<T>,
    _timeoutMs: number = 30000,
  ): Promise<T> {
    const pool = await this.getConnection();
    return operation(pool.request(), 'autocommit');
  }

  /**
   * Lista todas as transações ativas
   */
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

  /**
   * Força o rollback de todas as transações ativas
   */
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
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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

  private getHeartbeatIntervalMs(): number {
    const raw = process.env.SQL_HEARTBEAT_INTERVAL_MS;
    if (!raw) return 30000;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n >= 5000 ? n : 30000;
  }

  /** Pré-conecta o pool e valida com SELECT 1 (menos latência na primeira requisição). */
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
      return; // Já está rodando
    }

    const intervalMs = this.getHeartbeatIntervalMs();

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

      const isHealthy = await this.healthCheck();
      if (isHealthy) {
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

  private logInfo(message: string, metadata?: any): void {
    console.log(`[DB] ${message}`, {
      timestamp: new Date().toISOString(),
      ...metadata,
    });
  }

  private logError(message: string, error?: any, metadata?: any): void {
    console.error(`[DB] ${message}`, {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      ...metadata,
    });
  }

  static async shutdown(): Promise<void> {
    if (ConnectionSqlServerMssql.instance) {
      await ConnectionSqlServerMssql.instance.closePool();
      ConnectionSqlServerMssql.instance = null as any;
    }
  }
}
