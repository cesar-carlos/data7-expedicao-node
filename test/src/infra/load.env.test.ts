import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { loadEnv, resolveEnvPath } from '../../../src/infra/load.env';

describe('resolveEnvPath', () => {
  const created: string[] = [];

  afterEach(() => {
    for (const dir of created.splice(0)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('should prefer the env file next to the entrypoint', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'env-loader-'));
    created.push(root);
    const entryDir = path.join(root, 'dist.loja', 'src');
    fs.mkdirSync(entryDir, { recursive: true });
    fs.writeFileSync(path.join(entryDir, '.env'), 'SERVER_PORT=3001\n');
    fs.writeFileSync(path.join(root, '.env'), 'SERVER_PORT=9\n');

    expect(resolveEnvPath(entryDir, root)).toBe(path.join(entryDir, '.env'));
  });

  it('should fall back to the parent directory and then the cwd', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'env-loader-'));
    created.push(root);
    const entryDir = path.join(root, 'src');
    const cwd = path.join(root, 'other');
    fs.mkdirSync(entryDir, { recursive: true });
    fs.mkdirSync(cwd, { recursive: true });
    fs.writeFileSync(path.join(root, '.env'), 'SERVER_PORT=3001\n');

    expect(resolveEnvPath(entryDir, cwd)).toBe(path.join(root, '.env'));

    fs.rmSync(path.join(root, '.env'));
    fs.writeFileSync(path.join(cwd, '.env'), 'SERVER_PORT=3001\n');
    expect(resolveEnvPath(entryDir, cwd)).toBe(path.join(cwd, '.env'));
  });

  it('does not treat a missing env file as a failure when the process already received the environment', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const previous = process.env.EXPEDICAO_DESKTOP;
    const previousCwd = process.cwd();
    process.env.EXPEDICAO_DESKTOP = '1';
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'env-loader-'));
    created.push(root);
    try {
      process.chdir(root);
      expect(loadEnv(path.join(root, 'missing'))).toBeUndefined();
      expect(error).not.toHaveBeenCalled();
    } finally {
      process.chdir(previousCwd);
      if (previous === undefined) {
        delete process.env.EXPEDICAO_DESKTOP;
      } else {
        process.env.EXPEDICAO_DESKTOP = previous;
      }
      error.mockRestore();
    }
  });
});
