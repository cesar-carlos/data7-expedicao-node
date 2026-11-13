import 'reflect-metadata';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { cpus, platform, arch } from 'node:os';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import type { Socket } from 'socket.io';
import type { ConnectionPool } from 'mssql';
import { withSocketRequest } from '../../src/socket/socket.event.helpers';
import { executeSelectWhere } from '../../src/repository/common/consulta.sql.helper';
import { Params, Pagination, OrderBy } from '../../src/contracts/local.base.params';

// A separate process: no dotenv, bootstrap, network, real database or production writes.
process.env.APP_LOG_LEVEL = 'error';
process.env.SOCKET_LOG_LEVEL = 'error';
process.env.SQL_LOCK_TIMEOUT_MS = '5000';

const args = process.argv.slice(2);
const options = new Map<string, string>();
for (let i = 0; i < args.length; i += 2) {
  if (!['--samples', '--warmup', '--output'].includes(args[i]!) || !args[i + 1]) {
    throw new Error('Usage: npm run bench:consultas -- [--samples 30] [--warmup 5] [--output path.json]');
  }
  options.set(args[i]!, args[i + 1]!);
}
function integerOption(name: string, fallback: number, minimum: number): number {
  const value = Number(options.get(name) ?? fallback);
  assert(Number.isInteger(value) && value >= minimum && value <= 1000, `Invalid ${name}`);
  return value;
}
const samples = integerOption('--samples', 30, 5);
const warmup = integerOption('--warmup', 5, 1);
const rows = Array.from({ length: 20 }, (_, i) => ({ CodEmpresa: 1, CodProduto: i + 1, Quantidade: 10 }));
const burst = 20;
const helperIterations = 100;

interface Observation {
  backendCalls: number;
  responses: number;
  binds: number;
  payloads: Array<{ event: string; payload: string }>;
}
interface Scenario {
  name: string;
  operations: number;
  expectedBackendCalls: number;
  expectedBinds: number;
  expectedRows?: typeof rows;
  run: () => Promise<Observation>;
}

function socketScenario(mode: 'shared' | 'distinct' | 'separate-sockets' | 'sequential', rowCount = 20): Scenario {
  const responseRows = Array.from({ length: rowCount }, (_, i) => ({ CodEmpresa: 1, CodProduto: i + 1, Quantidade: 10 }));
  return {
    name: `socket-${mode}${rowCount === 20 ? '' : `-rows-${rowCount}`}`, operations: burst,
    expectedRows: responseRows,
    expectedBackendCalls: mode === 'shared' ? 1 : burst, expectedBinds: 0,
    async run() {
      const result: Observation = { backendCalls: 0, responses: 0, binds: 0, payloads: [] };
      const makeSocket = (id: string) => ({
        id, connected: true,
        emit(event: string, payload: string) { result.responses++; result.payloads.push({ event, payload }); },
      }) as unknown as Socket;
      const socket = makeSocket('bench');
      const invoke = (i: number) => withSocketRequest(
        mode === 'separate-sockets' ? makeSocket(`bench-${i}`) : socket,
        {
          Session: mode === 'separate-sockets' ? `bench-${i}` : 'bench', ResponseIn: `reply-${i}`,
          Where: [{ key: 'CodEmpresa', value: mode === 'distinct' ? i + 1 : 1 }],
          Pagination: `LIMIT=${rowCount}&OFFSET=0&PAGE=1`, OrderBy: 'order_by=CodProduto&order_direction=ASC',
        },
        { defaultResponseIn: 'bench separar.consulta', eventName: 'separar.consulta', kind: 'query' },
        async ({ emitQuery }) => {
          result.backendCalls++;
          // A deterministic event-loop barrier keeps the burst in flight without a timed sleep.
          await new Promise<void>((done) => setImmediate(done));
          emitQuery(responseRows);
        },
      );
      if (mode === 'sequential') {
        for (let i = 0; i < burst; i++) await invoke(i);
      } else {
        await Promise.all(Array.from({ length: burst }, (_, i) => invoke(i)));
      }
      return result;
    },
  };
}

function helperScenario(inValues: number, mixed = false): Scenario {
  const params = mixed
    ? [Params.equals('CodEmpresa', 1), Params.like('Descricao', 'PROD%'), Params.between('CodProduto', 10, 200), Params.isNull('Cancelado')]
    : inValues
    ? [Params.in('CodProduto', Array.from({ length: inValues }, (_, i) => i + 1))]
    : [Params.equals('CodEmpresa', 1), Params.equals('Situacao', 'AGUARDANDO')];
  const pagination = mixed ? Pagination.create(100, 200, 3) : Pagination.create(20);
  const order = OrderBy.create('CodProduto', mixed ? 'DESC' : 'ASC');
  return {
    name: mixed ? 'query-helper-mixed-page-3' : inValues ? 'query-helper-in-500' : 'query-helper-equality', operations: helperIterations,
    expectedBackendCalls: helperIterations, expectedBinds: (mixed ? 4 : inValues || 2) * helperIterations + 2 * helperIterations,
    async run() {
      const result: Observation = { backendCalls: 0, responses: 0, binds: 0, payloads: [] };
      const pool = { request: () => ({
        input() { result.binds++; return this; },
        async query() { result.backendCalls++; return { recordset: rows }; },
      }) } as unknown as ConnectionPool;
      for (let i = 0; i < helperIterations; i++) {
        const response = await executeSelectWhere(pool, 'SELECT CodEmpresa, CodProduto FROM BenchmarkFixture', params, pagination, order);
        result.responses += response.recordset === rows ? 1 : 0;
      }
      return result;
    },
  };
}

function verify(scenario: Scenario, result: Observation): void {
  assert.equal(result.backendCalls, scenario.expectedBackendCalls, `${scenario.name}: backend calls`);
  assert.equal(result.responses, scenario.operations, `${scenario.name}: responses`);
  assert.equal(result.binds, scenario.expectedBinds, `${scenario.name}: binds`);
  for (const { event, payload } of result.payloads) {
    const parsed = JSON.parse(payload);
    assert.equal(parsed.ResponseIn, event);
    assert.deepEqual(parsed.Data, scenario.expectedRows ?? rows);
    assert.equal(parsed.Error, undefined);
  }
  if (result.payloads.length) assert.equal(new Set(result.payloads.map(p => p.event)).size, burst);
}

function sourceFingerprint(): string {
  const files: string[] = [];
  const walk = (directory: string): void => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const file = join(directory, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (entry.name.endsWith('.ts')) files.push(file);
    }
  };
  walk('src');
  files.push('test/performance/consultas.benchmark.ts', 'package.json', 'package-lock.json');
  const hash = createHash('sha256');
  for (const file of files.sort()) {
    hash.update(file.replace(/\\/g, '/'));
    hash.update('\0');
    hash.update(readFileSync(file, 'utf8').replace(/\r\n/g, '\n'));
    hash.update('\0');
  }
  return hash.digest('hex');
}

async function main(): Promise<void> {
  const scenarios = [helperScenario(0), helperScenario(500), helperScenario(0, true),
    ...(['shared', 'distinct', 'separate-sockets', 'sequential'] as const).map(mode => socketScenario(mode)),
    socketScenario('distinct', 500), socketScenario('distinct', 1500)];
  const timings = new Map(scenarios.map(s => [s.name, [] as number[]]));
  // Rotate scenario order to reduce systematic warmup/order bias.
  for (let round = -warmup; round < samples; round++) {
    for (let j = 0; j < scenarios.length; j++) {
      const scenario = scenarios[(j + round + warmup) % scenarios.length]!;
      const start = performance.now();
      const result = await scenario.run();
      const elapsed = performance.now() - start;
      verify(scenario, result); // Correctness assertions are outside the timed section.
      if (round >= 0) timings.get(scenario.name)!.push(elapsed);
    }
  }
  let revision = 'unknown';
  try { revision = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(); } catch { /* Git is optional. */ }
  const report = {
    schemaVersion: 1, measuredAt: new Date().toISOString(), revision, sourceSha256: sourceFingerprint(),
    environment: { node: process.version, platform: platform(), arch: arch(), cpu: cpus()[0]?.model },
    configuration: { samples, warmup, rowsPerResponse: rows.length, burst, helperIterations, sqlLockTimeoutMs: 5000 },
    scope: 'Synthetic Node helpers and Socket.IO request processing; fake persistence and emit, no SQL Server or network. Timings include fixture setup and serialization, exclude assertions and module startup.',
    results: scenarios.map(s => {
      const raw = timings.get(s.name)!;
      const sorted = [...raw].sort((a, b) => a - b);
      const median = (sorted[Math.floor((samples - 1) / 2)]! + sorted[Math.floor(samples / 2)]!) / 2;
      return { scenario: s.name, operationsPerSample: s.operations,
        expectedBackendCallsPerSample: s.expectedBackendCalls, expectedBindsPerSample: s.expectedBinds,
        rowsPerResponse: (s.expectedRows ?? rows).length,
        medianMs: median, p95Ms: sorted[Math.ceil(samples * 0.95) - 1],
        operationsPerSecondAtMedian: s.operations * 1000 / median, samplesMs: raw };
    }),
  };
  const json = JSON.stringify(report, null, 2) + '\n';
  if (options.has('--output')) {
    const file = resolve(options.get('--output')!);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, json, 'utf8');
    console.log(`Report: ${file}`);
    console.table(report.results.map(({ samplesMs, ...summary }) => summary));
  } else console.log(json);
}

void main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
