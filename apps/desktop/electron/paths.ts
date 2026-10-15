import fs from 'fs';
import path from 'path';

import { app } from 'electron';

function stagedRoot(): string {
  return path.resolve(__dirname, '..', '..', 'staging');
}

export function resolveNodeBinary(): string {
  const packaged = path.join(process.resourcesPath, 'node', 'node.exe');
  const staged = path.join(stagedRoot(), 'node', 'node.exe');
  if (app.isPackaged && fs.existsSync(packaged)) {
    return packaged;
  }
  if (fs.existsSync(staged)) {
    return staged;
  }
  return 'node';
}

export function resolveServerEntry(): string {
  const candidates = [
    app.isPackaged ? path.join(process.resourcesPath, 'server', 'src', 'server.js') : '',
    path.join(stagedRoot(), 'server', 'src', 'server.js'),
    path.resolve(__dirname, '..', '..', '..', 'dist.loja', 'src', 'server.js'),
    path.resolve(__dirname, '..', '..', '..', 'dist', 'src', 'server.js'),
  ].filter((candidate) => candidate.length > 0);

  const found = candidates.find((candidate) => fs.existsSync(candidate));
  if (!found) {
    throw new Error('Servidor compilado não encontrado. Rode o build antes de iniciar o serviço.');
  }
  return found;
}

export function envImportCandidates(): string[] {
  const cwd = process.cwd();
  return [
    process.env.DESKTOP_IMPORT_ENV ?? '',
    path.join(cwd, '.env'),
    path.resolve(cwd, '..', '.env'),
    path.resolve(cwd, '..', '..', '.env'),
  ].filter((candidate) => candidate.length > 0);
}
