import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ConnectionPool } from 'mssql';

import ConnectionSqlServerMssql, { isSqlPoolAcquireTimeout } from '../../../src/infra/connection.sql.server.mssql';

type FakeRequest = {
  query: ReturnType<typeof vi.fn>;
  cancel: ReturnType<typeof vi.fn>;
  timeout: number;
  once: ReturnType<typeof vi.fn>;
};

type FakePool = {
  connected: boolean;
  connecting: boolean;
  healthy: boolean;
  size: number;
  available: number;
  pending: number;
  borrowed: number;
  connectCalls: number;
  closeCalls: number;
  requestQuery: ReturnType<typeof vi.fn>;
  connect: () => Promise<void>;
  close: () => Promise<void>;
  on: (event: string, listener: (...args: unknown[]) => void) => void;
  request: () => FakeRequest;
  emit: (event: string, ...args: unknown[]) => void;
};

function createFakePool(): FakePool {
  const listeners = new Map<string, Array<(...args: unknown[]) => void>>();
  let rejectConnect: ((error: Error) => void) | null = null;

  const pool: FakePool = {
    connected: false,
    connecting: false,
    healthy: true,
    size: 2,
    available: 2,
    pending: 0,
    borrowed: 0,
    connectCalls: 0,
    closeCalls: 0,
    requestQuery: vi.fn(async () => ({ recordset: [{ health: 1 }] })),
    async connect() {
      pool.connectCalls += 1;
      pool.connecting = true;
      await new Promise<void>((resolve, reject) => {
        rejectConnect = reject;
        queueMicrotask(() => {
          if (pool.closeCalls > 0) {
            reject(new Error('closed during connect'));
            return;
          }
          pool.connecting = false;
          pool.connected = true;
          resolve();
        });
      });
    },
    async close() {
      pool.closeCalls += 1;
      pool.connected = false;
      pool.connecting = false;
      if (rejectConnect) {
        rejectConnect(new Error('closed during connect'));
        rejectConnect = null;
      }
    },
    on(event, listener) {
      const list = listeners.get(event) ?? [];
      list.push(listener);
      listeners.set(event, list);
    },
    request() {
      return {
        query: pool.requestQuery,
        cancel: vi.fn(),
        timeout: 0,
        once: vi.fn(),
      };
    },
    emit(event, ...args) {
      for (const listener of listeners.get(event) ?? []) {
        listener(...args);
      }
    },
  };

  return pool;
}

describe('ConnectionSqlServerMssql', () => {
  const previousEnv = {
    USER_DATABASE: process.env.USER_DATABASE,
    PASSWORD_DATABASE: process.env.PASSWORD_DATABASE,
    DATABASE_NAME: process.env.DATABASE_NAME,
    DATABASE_HOST: process.env.DATABASE_HOST,
    SQL_HEARTBEAT_INTERVAL_MS: process.env.SQL_HEARTBEAT_INTERVAL_MS,
  };

  beforeEach(() => {
    process.env.USER_DATABASE = 'sa';
    process.env.PASSWORD_DATABASE = 'x';
    process.env.DATABASE_NAME = 'db';
    process.env.DATABASE_HOST = 'localhost';
    process.env.SQL_HEARTBEAT_INTERVAL_MS = '30000';
  });

  afterEach(async () => {
    await ConnectionSqlServerMssql.resetForTests();
    vi.useRealTimers();
    for (const [key, value] of Object.entries(previousEnv)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });

  it('should share one pool across concurrent getConnection calls', async () => {
    const created: FakePool[] = [];
    const connection = ConnectionSqlServerMssql.startTestInstance(() => {
      const pool = createFakePool();
      created.push(pool);
      return pool as unknown as ConnectionPool;
    });

    const [first, second] = await Promise.all([connection.getConnection(), connection.getConnection()]);

    expect(created).toHaveLength(1);
    expect(first).toBe(second);
    expect(created[0]?.closeCalls).toBe(0);
    expect(created[0]?.connectCalls).toBe(1);
  });

  it('should not treat a connecting pool as dead and reconnect over it', async () => {
    let releaseConnect: (() => void) | undefined;
    const gate = new Promise<void>((resolve) => {
      releaseConnect = resolve;
    });
    const created: FakePool[] = [];

    const connection = ConnectionSqlServerMssql.startTestInstance(() => {
      const pool = createFakePool();
      pool.connect = async () => {
        pool.connectCalls += 1;
        pool.connecting = true;
        await gate;
        pool.connecting = false;
        pool.connected = true;
      };
      created.push(pool);
      return pool as unknown as ConnectionPool;
    });

    const pending = connection.getConnection();
    await vi.waitFor(() => expect(created).toHaveLength(1));
    const second = connection.getConnection();
    releaseConnect?.();

    const [firstPool, secondPool] = await Promise.all([pending, second]);
    expect(created).toHaveLength(1);
    expect(firstPool).toBe(secondPool);
    expect(created[0]?.closeCalls).toBe(0);
  });

  it.each([false, true])('should wait for an opening pool before closing (connect fails: %s)', async (fails) => {
    let releaseConnect: (() => void) | undefined;
    const gate = new Promise<void>((resolve) => {
      releaseConnect = resolve;
    });
    const created: FakePool[] = [];

    const connection = ConnectionSqlServerMssql.startTestInstance(() => {
      const pool = createFakePool();
      pool.connect = async () => {
        pool.connectCalls += 1;
        pool.connecting = true;
        await gate;
        pool.connecting = false;
        if (fails) throw new Error('connection failed');
        pool.connected = true;
      };
      const originalClose = pool.close.bind(pool);
      pool.close = async () => {
        if (pool.connecting) throw new Error('Cannot close a pool while it is connecting');
        await originalClose();
      };
      created.push(pool);
      return pool as unknown as ConnectionPool;
    });

    const pending = connection.getConnection();
    const rejected = expect(pending).rejects.toThrow(/fechando|Falha ao inicializar/);
    await vi.waitFor(() => expect(created).toHaveLength(1));
    const closing = connection.closePool();
    const closed = expect(closing).resolves.toBeUndefined();
    expect(created[0]?.closeCalls).toBe(0);
    releaseConnect?.();

    await closed;
    await rejected;
    expect(created[0]?.closeCalls).toBeGreaterThan(0);
    expect(created[0]?.connectCalls).toBe(1);
    expect(connection.getPoolStats()).toBeNull();
    expect(connection.getMetrics().heartbeatActive).toBe(false);
  });

  it('should fail fast while the pool is closing', async () => {
    let resolveClose: (() => void) | undefined;
    const created: FakePool[] = [];

    const connection = ConnectionSqlServerMssql.startTestInstance(() => {
      const pool = createFakePool();
      created.push(pool);
      return pool as unknown as ConnectionPool;
    });

    await connection.getConnection();
    created[0]!.close = () =>
      new Promise<void>((resolve) => {
        resolveClose = resolve;
      });

    const closing = connection.closePool();
    await expect(connection.getConnection()).rejects.toThrow('Não é possível obter conexão enquanto o pool está fechando');
    resolveClose?.();
    await closing;
  });

  it.each([false, true])('should make concurrent close callers await the same outcome (failure: %s)', async (fails) => {
    const pool = createFakePool();
    const connection = ConnectionSqlServerMssql.startTestInstance(() => pool as unknown as ConnectionPool);
    await connection.getConnection();
    let finish!: () => void;
    pool.close = vi.fn(() => new Promise<void>((resolve, reject) => {
      finish = () => fails ? reject(new Error('close failure')) : resolve();
    }));
    const outcomes: string[] = [];
    const observe = () => connection.closePool().then(
      () => { outcomes.push('closed'); },
      (error: unknown) => { outcomes.push(error instanceof Error ? error.message : String(error)); },
    );
    const first = observe();
    const second = observe();
    await Promise.resolve();
    await Promise.resolve();
    expect(outcomes).toEqual([]);
    expect(pool.close).toHaveBeenCalledTimes(1);
    finish();
    await Promise.all([first, second]);
    expect(outcomes).toEqual(Array(2).fill(fails ? 'Falha ao fechar pool de conexão: close failure' : 'closed'));
    // A completed close must not leave a stale shared promise or closing flag.
    await expect(connection.closePool()).resolves.toBeUndefined();
    expect(pool.close).toHaveBeenCalledTimes(1);
    expect(connection.getMetrics().heartbeatActive).toBe(false);
  });

  it('should not count a busy pool as a failed health check', async () => {
    const created: FakePool[] = [];
    const connection = ConnectionSqlServerMssql.startTestInstance(() => {
      const pool = createFakePool();
      created.push(pool);
      return pool as unknown as ConnectionPool;
    });

    await connection.getConnection();
    const pool = created[0]!;
    pool.available = 0;
    pool.pending = 3;
    pool.borrowed = 20;
    pool.requestQuery = vi.fn(async () => {
      throw new Error('should not run SELECT 1 while the pool is busy');
    });

    await expect(connection.healthCheck()).resolves.toBe(true);
    expect(pool.requestQuery).not.toHaveBeenCalled();
    expect(connection.getMetrics().reconnections).toBe(0);
  });

  it('should start heartbeat after connect and expose Tarn counters', async () => {
    vi.useFakeTimers();
    try {
      const created: FakePool[] = [];
      const connection = ConnectionSqlServerMssql.startTestInstance(() => {
        const pool = createFakePool();
        created.push(pool);
        return pool as unknown as ConnectionPool;
      });

      await connection.getConnection();
      expect(connection.getMetrics().heartbeatActive).toBe(true);
      expect(connection.getPoolStats()).toMatchObject({
        connected: true,
        size: 2,
        available: 2,
        pending: 0,
        borrowed: 0,
      });
    } finally {
      vi.useRealTimers();
    }
  });

  it('should treat acquire timeout as a busy pool, not a dead one', () => {
    expect(isSqlPoolAcquireTimeout(new Error('Timeout: ResourceRequest timed out'))).toBe(true);
    expect(isSqlPoolAcquireTimeout(new Error('Login failed'))).toBe(false);
  });

  it.each(['success', 'busy', 'acquire-timeout'])('should reset consecutive heartbeat failures after %s', async (recovery) => {
    vi.useFakeTimers();
    const pool = createFakePool();
    const connection = ConnectionSqlServerMssql.startTestInstance(() => pool as unknown as ConnectionPool);
    await connection.getConnection();
    pool.requestQuery.mockRejectedValueOnce(new Error('network failure'));
    await vi.advanceTimersByTimeAsync(30000);
    expect(connection.getMetrics().reconnections).toBe(0);
    if (recovery === 'busy') { pool.available = 0; pool.pending = 1; }
    if (recovery === 'acquire-timeout') pool.requestQuery.mockRejectedValueOnce(new Error('ResourceRequest timed out'));
    await vi.advanceTimersByTimeAsync(30000);
    pool.available = 2; pool.pending = 0;
    pool.requestQuery.mockRejectedValueOnce(new Error('network failure'));
    await vi.advanceTimersByTimeAsync(30000);
    expect(connection.getMetrics().reconnections).toBe(0);
    expect(pool.closeCalls).toBe(0);
    expect(pool.requestQuery).toHaveBeenCalledTimes(recovery === 'busy' ? 2 : 3);
  });

  it('should share heartbeat reconnection with concurrent connection requests', async () => {
    vi.useFakeTimers();
    const pools: FakePool[] = [];
    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    const connection = ConnectionSqlServerMssql.startTestInstance(() => {
      const pool = createFakePool();
      if (pools.length === 1) {
        const connect = pool.connect;
        pool.connect = async () => { await gate; await connect(); };
      }
      pools.push(pool);
      return pool as unknown as ConnectionPool;
    });
    await connection.getConnection();
    pools[0]!.requestQuery.mockRejectedValue(new Error('network failure'));
    await vi.advanceTimersByTimeAsync(30000);
    expect(pools).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(30000);
    expect(pools).toHaveLength(2);
    const first = connection.getConnection();
    const second = connection.getConnection();
    release();
    expect(await first).toBe(await second);
    expect(await first).toBe(pools[1]);
    expect(pools[0]!.closeCalls).toBe(1);
    expect(connection.getMetrics().reconnections).toBe(1);
    await vi.advanceTimersByTimeAsync(30000);
    expect(pools[1]!.requestQuery).toHaveBeenCalledTimes(1);
    expect(pools).toHaveLength(2);
  });

  it('should avoid overlapping probes and stop heartbeat scheduling on shutdown', async () => {
    vi.useFakeTimers();
    const pool = createFakePool();
    const connection = ConnectionSqlServerMssql.startTestInstance(() => pool as unknown as ConnectionPool);
    await connection.getConnection();
    let release!: () => void;
    pool.requestQuery.mockImplementationOnce(() => new Promise((resolve) => {
      release = () => resolve({ recordset: [{ health: 1 }] });
    }));
    await vi.advanceTimersByTimeAsync(90000);
    expect(pool.requestQuery).toHaveBeenCalledTimes(1);
    await connection.closePool();
    release();
    await vi.advanceTimersByTimeAsync(90000);
    expect(pool.requestQuery).toHaveBeenCalledTimes(1);
    expect(pool.closeCalls).toBe(1);
    expect(connection.getMetrics().heartbeatActive).toBe(false);
    expect(connection.getMetrics().reconnections).toBe(0);
  });

  it('should reset LOCK_TIMEOUT and cancel the request when a tracked query fails', async () => {
    const created: FakePool[] = [];
    const connection = ConnectionSqlServerMssql.startTestInstance(() => {
      const pool = createFakePool();
      created.push(pool);
      return pool as unknown as ConnectionPool;
    });

    const pool = await connection.getConnection();
    const fakePool = created[0]!;
    fakePool.requestQuery = vi.fn(async (sql: string) => {
      expect(sql.startsWith('SET LOCK_TIMEOUT -1;')).toBe(true);
      throw new Error('Timeout: Request failed to complete in 30000ms');
    });

    const request = pool.request() as unknown as FakeRequest;
    await expect(request.query('SELECT 1')).rejects.toThrow(/Timeout: Request failed to complete/);
    expect(request.cancel).toHaveBeenCalled();
  });
});
