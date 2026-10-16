import fs from 'fs';

import { BrowserWindow, dialog, ipcMain } from 'electron';

import { readSocketDetail, readSocketSnapshot, stoppedSocketDetailView, stoppedSocketMonitorView } from './socket-monitor-client';
import type { DesktopConfig } from '../shared/config-schema';
import { toPublicConfig } from '../shared/config-schema';
import { importExistingEnv, readConfig, readSnapshot, saveIncomingConfig, type StoredSnapshot } from './config-store';
import { probeDatabase } from './database-probe';
import { applyLoginItem } from './login-item';
import type { LogBuffer } from './log-buffer';
import type { ProcessSupervisor } from './process-supervisor';

export type IpcDeps = {
  supervisor: ProcessSupervisor;
  logs: LogBuffer;
  envCandidates: () => string[];
};

function broadcast(channel: string, payload: unknown): void {
  for (const win of BrowserWindow.getAllWindows()) {
    if (!win.isDestroyed()) {
      win.webContents.send(channel, payload);
    }
  }
}

export function publishStatus(status: unknown): void {
  broadcast('status:changed', status);
}

export function publishLog(line: unknown): void {
  broadcast('logs:line', line);
}

export function registerIpc(deps: IpcDeps): void {
  ipcMain.handle('config:get', (): StoredSnapshot => readSnapshot());

  ipcMain.handle('config:import', () => importExistingEnv(deps.envCandidates()));

  ipcMain.handle('config:save', async (_event, input: DesktopConfig): Promise<StoredSnapshot> => {
    const saved = saveIncomingConfig(input);
    deps.supervisor.noteSaved();
    try {
      await applyLoginItem(saved.config.startWithWindows);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(`Configuração gravada. O início com o Windows para todos os usuários precisa de administrador. ${detail}`);
    }
    return { config: toPublicConfig(saved.config), needsSetup: false };
  });

  ipcMain.handle('database:test', (_event, input: DesktopConfig) => probeDatabase(readConfig(), input));

  ipcMain.handle('server:start', () => deps.supervisor.start());
  ipcMain.handle('server:stop', () => deps.supervisor.stop());
  ipcMain.handle('server:restart', () => deps.supervisor.restart());
  ipcMain.handle('server:status', () => deps.supervisor.current());
  ipcMain.handle('logs:recent', () => deps.logs.recent());
  ipcMain.handle('logs:errors', () => deps.logs.errorLines());
  ipcMain.handle('logs:clear-live', () => {
    deps.logs.clearLive();
  });
  ipcMain.handle('logs:clear-errors', () => {
    deps.logs.clearErrorView();
  });
  ipcMain.handle('logs:export', async () => {
    const options = {
      title: 'Exportar erros',
      defaultPath: 'erros-expedicao.log',
      filters: [{ name: 'Log', extensions: ['log', 'txt'] }],
    };
    const parent = BrowserWindow.getFocusedWindow();
    const result = parent ? await dialog.showSaveDialog(parent, options) : await dialog.showSaveDialog(options);
    if (result.canceled || !result.filePath) {
      return null;
    }
    fs.writeFileSync(result.filePath, deps.logs.exportText(), 'utf8');
    return result.filePath;
  });

  ipcMain.handle('sockets:snapshot', () => {
    const status = deps.supervisor.current();
    if (!status.portOpen) {
      return stoppedSocketMonitorView();
    }
    return readSocketSnapshot(status.port);
  });

  ipcMain.handle('sockets:detail', (_event, socketId: unknown) => {
    const status = deps.supervisor.current();
    if (!status.portOpen) {
      return stoppedSocketDetailView();
    }
    if (typeof socketId !== 'string') {
      return stoppedSocketDetailView('Cliente inválido.');
    }
    return readSocketDetail(status.port, socketId);
  });
}
