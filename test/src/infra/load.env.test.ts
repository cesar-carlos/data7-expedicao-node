import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, describe, expect, it } from 'vitest';

import { resolveEnvPath } from '../../../src/infra/load.env';

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
});
