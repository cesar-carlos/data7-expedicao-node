import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

/**
 * Ordem: pasta do entrypoint, pasta pai e `process.cwd()`.
 * O build copia `.env` para `dist.loja/src/`; o PM2 costuma iniciar com outro cwd.
 */
export function resolveEnvPath(baseDir: string, cwd: string = process.cwd()): string | undefined {
  const candidates = [
    path.resolve(baseDir, '.env'),
    path.resolve(baseDir, '..', '.env'),
    path.resolve(cwd, '.env'),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate));
}

export function loadEnv(baseDir: string): string | undefined {
  const envPath = resolveEnvPath(baseDir);
  if (!envPath) {
    console.error('[env] Nenhum arquivo .env encontrado', {
      baseDir,
      cwd: process.cwd(),
    });
    return undefined;
  }

  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.error('[env] Falha ao ler arquivo de ambiente', { path: envPath });
    return undefined;
  }

  console.log('[env] Variáveis carregadas', { path: envPath });
  return envPath;
}
