import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';

import type { DesktopApi, LogLine, ServerStatus, SocketMonitorDetailView, SocketMonitorView } from '../shared/ipc-contract';

const api: DesktopApi = {
  getConfig: () => ipcRenderer.invoke('config:get'),
  saveConfig: (input) => ipcRenderer.invoke('config:save', input),
  testDatabase: (input) => ipcRenderer.invoke('database:test', input),
  importEnv: () => ipcRenderer.invoke('config:import'),
  startServer: () => ipcRenderer.invoke('server:start'),
  stopServer: () => ipcRenderer.invoke('server:stop'),
  restartServer: () => ipcRenderer.invoke('server:restart'),
  getStatus: () => ipcRenderer.invoke('server:status'),
  getRecentLogs: () => ipcRenderer.invoke('logs:recent'),
  getErrors: () => ipcRenderer.invoke('logs:errors'),
  clearLiveView: () => ipcRenderer.invoke('logs:clear-live'),
  clearErrorView: () => ipcRenderer.invoke('logs:clear-errors'),
  exportErrors: () => ipcRenderer.invoke('logs:export'),
  getSocketSnapshot: () => ipcRenderer.invoke('sockets:snapshot') as Promise<SocketMonitorView>,
  getSocketDetail: (socketId) => ipcRenderer.invoke('sockets:detail', socketId) as Promise<SocketMonitorDetailView>,
  onLog: (listener) => {
    const wrapped = (_event: IpcRendererEvent, line: LogLine) => listener(line);
    ipcRenderer.on('logs:line', wrapped);
    return () => ipcRenderer.removeListener('logs:line', wrapped);
  },
  onStatus: (listener) => {
    const wrapped = (_event: IpcRendererEvent, status: ServerStatus) => listener(status);
    ipcRenderer.on('status:changed', wrapped);
    return () => ipcRenderer.removeListener('status:changed', wrapped);
  },
};

contextBridge.exposeInMainWorld('desktop', api);
