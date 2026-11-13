/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { z } from 'zod';

const resultSchema = z.object({
  scenario: z.string().min(1),
  operationsPerSample: z.number().int().positive(),
  expectedBackendCallsPerSample: z.number().int().nonnegative(),
  expectedBindsPerSample: z.number().int().nonnegative(),
  rowsPerResponse: z.number().int().nonnegative().optional(),
  medianMs: z.number().finite().nonnegative(),
  p95Ms: z.number().finite().nonnegative(),
});
const reportSchema = z.object({
  schemaVersion: z.literal(1),
  revision: z.string(),
  sourceSha256: z.string(),
  environment: z.record(z.string(), z.unknown()),
  configuration: z.record(z.string(), z.unknown()),
  results: z.array(resultSchema).min(1),
}).refine(report => new Set(report.results.map(result => result.scenario)).size === report.results.length,
  'Duplicate scenario names');

interface Delta { beforeMs: number; afterMs: number; deltaMs: number; deltaPercent: number | null }
interface Comparison {
  warnings: string[];
  sourceChanged: boolean;
  revisionChanged: boolean;
  results: Array<{ scenario: string; comparable: boolean; median: Delta; p95: Delta }>;
}
function delta(beforeMs: number, afterMs: number): Delta {
  return { beforeMs, afterMs, deltaMs: afterMs - beforeMs,
    deltaPercent: beforeMs === 0 ? null : (afterMs - beforeMs) / beforeMs * 100 };
}

/** Offline comparison only; timing changes never determine the exit code. */
export function compareReports(beforeInput: unknown, afterInput: unknown): Comparison {
  const before = reportSchema.parse(beforeInput);
  const after = reportSchema.parse(afterInput);
  const warnings: string[] = [];
  for (const section of ['environment', 'configuration'] as const) {
    for (const key of new Set([...Object.keys(before[section]), ...Object.keys(after[section])])) {
      if (JSON.stringify(before[section][key]) !== JSON.stringify(after[section][key])) {
        warnings.push(`${section}.${key}: ${JSON.stringify(before[section][key])} -> ${JSON.stringify(after[section][key])}`);
      }
    }
  }
  const sameSetup = warnings.length === 0;
  const results: Comparison['results'] = [];
  for (const previous of before.results) {
    const current = after.results.find(result => result.scenario === previous.scenario);
    if (!current) { warnings.push(`Removed scenario: ${previous.scenario}`); continue; }
    const sameWork = previous.operationsPerSample === current.operationsPerSample
      && previous.expectedBackendCallsPerSample === current.expectedBackendCallsPerSample
      && previous.expectedBindsPerSample === current.expectedBindsPerSample
      && (previous.rowsPerResponse ?? before.configuration.rowsPerResponse)
        === (current.rowsPerResponse ?? after.configuration.rowsPerResponse);
    if (!sameWork) warnings.push(`Workload changed: ${previous.scenario}`);
    results.push({ scenario: previous.scenario, comparable: sameSetup && sameWork,
      median: delta(previous.medianMs, current.medianMs), p95: delta(previous.p95Ms, current.p95Ms) });
  }
  for (const current of after.results) {
    if (!before.results.some(result => result.scenario === current.scenario)) warnings.push(`Added scenario: ${current.scenario}`);
  }
  return { warnings, sourceChanged: before.sourceSha256 !== after.sourceSha256,
    revisionChanged: before.revision !== after.revision, results };
}

if (require.main === module) {
  try {
    const args = process.argv.slice(2);
    if (args.length !== 2) throw new Error('Usage: npm run bench:consultas:compare -- before.json after.json');
    const comparison = compareReports(JSON.parse(readFileSync(args[0]!, 'utf8')), JSON.parse(readFileSync(args[1]!, 'utf8')));
    console.log(JSON.stringify(comparison, null, 2));
  } catch (error: unknown) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
