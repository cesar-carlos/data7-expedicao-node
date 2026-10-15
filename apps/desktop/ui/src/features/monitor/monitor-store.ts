import type { LogLine, ServerStatus } from '@shared/ipc-contract';
import { defineStore } from 'pinia';

import { desktop } from '../../shared/ipc/client';

const emptyStatus = (): ServerStatus => ({
  state: 'stopped',
  portOpen: false,
  pid: null,
  port: 0,
  message: 'Aguardando.',
  attempt: 0,
  restartRequired: false,
});

export const useMonitorStore = defineStore('monitor', {
  state: () => ({
    lines: [] as LogLine[],
    errors: [] as LogLine[],
    status: emptyStatus(),
    listening: false,
  }),
  actions: {
    async open(): Promise<void> {
      const api = desktop();
      if (!api) {
        return;
      }
      this.lines = await api.getRecentLogs();
      this.errors = await api.getErrors();
      this.status = await api.getStatus();
      if (this.listening) {
        return;
      }
      this.listening = true;
      api.onLog((line) => {
        this.lines = [...this.lines, line].slice(-400);
        if (line.error) {
          this.errors = [...this.errors, line].slice(-500);
        }
      });
      api.onStatus((status) => {
        this.status = status;
      });
    },
    async start(): Promise<void> {
      const api = desktop();
      if (!api) {
        return;
      }
      this.status = await api.startServer();
    },
    async stop(): Promise<void> {
      const api = desktop();
      if (!api) {
        return;
      }
      this.status = await api.stopServer();
    },
    async restart(): Promise<void> {
      const api = desktop();
      if (!api) {
        return;
      }
      this.status = await api.restartServer();
    },
    async clearLive(): Promise<void> {
      const api = desktop();
      if (!api) {
        return;
      }
      await api.clearLiveView();
      this.lines = [];
    },
    async clearErrors(): Promise<void> {
      const api = desktop();
      if (!api) {
        return;
      }
      await api.clearErrorView();
      this.errors = [];
    },
    async copy(lines: LogLine[]): Promise<void> {
      await navigator.clipboard.writeText(lines.map((line) => line.text).join('\n'));
    },
    async exportErrors(): Promise<void> {
      const api = desktop();
      if (!api) {
        return;
      }
      await api.exportErrors();
    },
  },
});
