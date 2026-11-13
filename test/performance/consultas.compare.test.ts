import { describe, expect, it } from 'vitest';
import { compareReports } from './consultas.compare';

function fixture() {
  return { schemaVersion: 1, revision: 'abc', sourceSha256: 'source',
    environment: { node: 'v24', cpu: 'fixture' }, configuration: { samples: 30, rowsPerResponse: 20 },
    results: [{ scenario: 'example', operationsPerSample: 20, expectedBackendCallsPerSample: 1,
      expectedBindsPerSample: 0, medianMs: 2, p95Ms: 4 }] };
}
describe('benchmark report comparison', () => {
  it('should calculate signed deltas without treating slower timings as failure', () => {
    const after = fixture();
    after.results[0]!.medianMs = 3;
    after.results[0]!.p95Ms = 2;
    after.sourceSha256 = 'changed';
    const comparison = compareReports(fixture(), after);
    expect(comparison.warnings).toEqual([]);
    expect(comparison.sourceChanged).toBe(true);
    expect(comparison.results[0]).toMatchObject({ comparable: true,
      median: { deltaMs: 1, deltaPercent: 50 }, p95: { deltaMs: -2, deltaPercent: -50 } });
  });
  it('should flag environment, configuration and workload differences', () => {
    const after = fixture();
    after.environment.node = 'v26';
    after.configuration.samples = 40;
    after.results[0]!.operationsPerSample = 100;
    const comparison = compareReports(fixture(), after);
    expect(comparison.warnings).toHaveLength(3);
    expect(comparison.results[0]!.comparable).toBe(false);
  });
  it('should report added and removed scenarios without pairing unrelated workloads', () => {
    const after = fixture();
    after.results[0]!.scenario = 'new';
    expect(compareReports(fixture(), after)).toMatchObject({
      warnings: ['Removed scenario: example', 'Added scenario: new'], results: [] });
  });
  it('should represent percentage against a zero baseline as null', () => {
    const before = fixture();
    before.results[0]!.medianMs = 0;
    expect(compareReports(before, fixture()).results[0]!.median.deltaPercent).toBeNull();
  });
  it('should reject invalid numbers, duplicate scenarios and unsupported schemas', () => {
    const invalid = fixture();
    invalid.results[0]!.medianMs = -1;
    expect(() => compareReports(invalid, fixture())).toThrow();
    const duplicate = fixture();
    duplicate.results.push(duplicate.results[0]!);
    expect(() => compareReports(duplicate, fixture())).toThrow();
    expect(() => compareReports({ ...fixture(), schemaVersion: 2 }, fixture())).toThrow();
  });
});
