import fs from 'fs';
import path from 'path';

import { app } from 'electron';

import {
  defaultDesktopConfig,
  desktopConfigFromEnv,
  mergeSavedConfig,
  parseDesktopConfig,
  parseEnvText,
  serviceConfigChanged,
  toProcessEnv,
  toPublicConfig,
  type DesktopConfig,
  type PublicDesktopConfig,
} from '../shared/config-schema';

export type StoredSnapshot = {
  config: PublicDesktopConfig;
  needsSetup: boolean;
};

function configFile(): string {
  return path.join(app.getPath('userData'), 'config.json');
}

export function configExists(): boolean {
  return fs.existsSync(configFile());
}

export function readConfig(): DesktopConfig | null {
  if (!configExists()) {
    return null;
  }

  try {
    const raw: unknown = JSON.parse(fs.readFileSync(configFile(), 'utf8'));
    return parseDesktopConfig(raw);
  } catch (error) {
    console.error('[config] Arquivo de configuração ilegível', error);
    return null;
  }
}

export function writeConfig(config: DesktopConfig): void {
  const directory = app.getPath('userData');
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(configFile(), JSON.stringify(config, null, 2), { encoding: 'utf8', mode: 0o600 });
}

export function readSnapshot(): StoredSnapshot {
  const config = readConfig();
  if (!config) {
    return { config: toPublicConfig(defaultDesktopConfig), needsSetup: true };
  }
  return { config: toPublicConfig(config), needsSetup: false };
}

export function saveIncomingConfig(input: unknown): {
  config: DesktopConfig;
  previous: DesktopConfig | null;
  restart: boolean;
} {
  const previous = readConfig();
  const next = mergeSavedConfig(previous, input);
  writeConfig(next);
  return {
    config: next,
    previous,
    restart: previous ? serviceConfigChanged(previous, next) : true,
  };
}

export function importExistingEnv(candidates: readonly string[]): DesktopConfig | null {
  if (configExists()) {
    return null;
  }

  for (const candidate of candidates) {
    if (!fs.existsSync(candidate)) {
      continue;
    }
    return desktopConfigFromEnv(parseEnvText(fs.readFileSync(candidate, 'utf8')));
  }
  return null;
}

export function materializeChildEnv(config: DesktopConfig): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (value === undefined) {
      continue;
    }
    if (key.startsWith('ELECTRON_') || key === 'NODE_OPTIONS' || key === 'NODE_DEBUG' || key === 'NODE_INSPECT') {
      continue;
    }
    env[key] = value;
  }
  return { ...env, ...toProcessEnv(config) };
}

export function secretValues(config: DesktopConfig | null): string[] {
  if (!config) {
    return [];
  }
  return [config.databasePassword];
}
