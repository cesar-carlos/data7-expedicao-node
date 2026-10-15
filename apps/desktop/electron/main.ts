import path from 'path';

import { app, BrowserWindow } from 'electron';

import { materializeChildEnv, readConfig, secretValues } from './config-store';
import { registerIpc, publishLog, publishStatus } from './ipc';
import { appIcon } from './icons';
import { applyLoginItem } from './login-item';
import { LogBuffer } from './log-buffer';
import { acquireAppMutex, releaseAppMutex } from './mutex';
import { envImportCandidates, resolveNodeBinary, resolveServerEntry } from './paths';
import { ProcessSupervisor } from './process-supervisor';
import { claimSingleInstance } from './single-instance';
import { createTray, notifyStillRunning } from './tray';

function sharedDataDir(): string {
  const programData = process.env.PROGRAMDATA || path.join(process.env.SystemDrive || 'C:', 'ProgramData');
  return path.join(programData, 'data7-expedicao');
}

app.setName('data7-expedicao');
app.setPath('userData', sharedDataDir());
app.setAppUserModelId('com.se7e.data7expedicao');

let mainWindow: BrowserWindow | null = null;
let allowQuit = false;

function showWindow(): void {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }
  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }
  mainWindow.show();
  mainWindow.focus();
}

if (!claimSingleInstance(showWindow)) {
  app.quit();
} else {
  app.on('window-all-closed', () => undefined);

  app.whenReady().then(() => {
    if (!acquireAppMutex()) {
      app.quit();
      return;
    }

    const logs = new LogBuffer(path.join(app.getPath('userData'), 'logs'), () => secretValues(readConfig()));
    const supervisor = new ProcessSupervisor({
      log: logs,
      nodeBinary: resolveNodeBinary,
      serverEntry: resolveServerEntry,
      readConfig: () => readConfig(),
      materializeEnv: () => {
        const config = readConfig();
        return config ? materializeChildEnv(config) : null;
      },
      onStatus: publishStatus,
      onLine: publishLog,
    });

    registerIpc({
      supervisor,
      logs,
      envCandidates: envImportCandidates,
    });

    mainWindow = new BrowserWindow({
      width: 1100,
      height: 760,
      minWidth: 860,
      minHeight: 640,
      show: false,
      autoHideMenuBar: true,
      title: 'Data7 Expedição Servidor',
      icon: appIcon(),
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        sandbox: true,
        nodeIntegration: false,
        devTools: !app.isPackaged,
      },
    });

    mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    mainWindow.webContents.on('will-navigate', (event, url) => {
      const devUrl = url.startsWith('http://127.0.0.1:5173');
      const localFile = url.startsWith('file:');
      if (app.isPackaged ? !localFile : !devUrl) {
        event.preventDefault();
      }
    });
    if (app.isPackaged) {
      mainWindow.webContents.on('devtools-opened', () => {
        mainWindow?.webContents.closeDevTools();
      });
    }

    mainWindow.on('close', (event) => {
      if (allowQuit) {
        return;
      }
      const config = readConfig();
      if (!config || config.closeToTray) {
        event.preventDefault();
        mainWindow?.hide();
        notifyStillRunning(app.getPath('userData'));
      }
    });

    mainWindow.on('minimize', () => {
      const config = readConfig();
      if (config?.minimizeToTray) {
        mainWindow?.hide();
        notifyStillRunning(app.getPath('userData'));
      }
    });

    const devServer = !app.isPackaged;
    const load = devServer
      ? mainWindow.loadURL('http://127.0.0.1:5173')
      : mainWindow.loadFile(path.join(__dirname, '..', '..', 'dist-ui', 'index.html'));

    void load.then(() => {
      const config = readConfig();
      const hidden = process.argv.includes('--hidden');
      if (!hidden || !config) {
        showWindow();
      }
      if (config) {
        void applyLoginItem(config.startWithWindows);
        void supervisor.start();
      }
    });

    createTray({
      open: showWindow,
      restart: () => {
        void supervisor.restart();
      },
      quit: () => app.quit(),
    });

    app.on('before-quit', (event) => {
      if (allowQuit) {
        return;
      }
      event.preventDefault();
      allowQuit = true;
      void supervisor.stop().finally(() => {
        releaseAppMutex();
        app.quit();
      });
    });
  });
}
