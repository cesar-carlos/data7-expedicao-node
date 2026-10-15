import type { DesktopConfig, PublicDesktopConfig } from '@shared/config-schema';
import { defaultDesktopConfig } from '@shared/config-schema';
import { defineStore } from 'pinia';

import { desktop, ipcError } from '../../shared/ipc/client';
import { notifyError, notifyOk } from '../../shared/ui/notify';

function draftFromPublic(config: PublicDesktopConfig): DesktopConfig {
  const { passwordSet, ...rest } = config;
  void passwordSet;
  return { ...rest, databasePassword: '' };
}

function payloadOf(draft: DesktopConfig, password: string): string {
  return JSON.stringify({ ...draft, databasePassword: password });
}

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    draft: { ...defaultDesktopConfig },
    password: '',
    passwordSet: false,
    needsSetup: false,
    saving: false,
    savingId: 0,
    testing: false,
    committed: '',
  }),
  actions: {
    async load(): Promise<void> {
      const api = desktop();
      if (!api) {
        return;
      }
      const snapshot = await api.getConfig();
      this.draft = draftFromPublic(snapshot.config);
      this.passwordSet = snapshot.config.passwordSet;
      this.needsSetup = snapshot.needsSetup;
      this.password = '';
      if (!snapshot.needsSetup) {
        this.rememberCommitted();
        return;
      }
      const imported = await api.importEnv();
      if (imported) {
        this.draft = { ...imported, databasePassword: '' };
        this.password = imported.databasePassword;
        this.passwordSet = imported.databasePassword.length > 0;
      }
      this.rememberCommitted();
    },
    rememberCommitted(): void {
      this.committed = payloadOf(this.draft, this.password);
    },
    async saveOnExit(): Promise<void> {
      if (payloadOf(this.draft, this.password) === this.committed) {
        return;
      }
      await this.save();
    },
    async save(): Promise<void> {
      const api = desktop();
      if (!api) {
        return;
      }
      const savingId = ++this.savingId;
      this.saving = true;
      try {
        const snapshot = await api.saveConfig({
          ...this.draft,
          databasePassword: this.password,
        });
        if (savingId !== this.savingId) {
          return;
        }
        this.draft = draftFromPublic(snapshot.config);
        this.password = '';
        this.passwordSet = snapshot.config.passwordSet;
        this.needsSetup = false;
        this.rememberCommitted();
        notifyOk('Configuração gravada.');
      } catch (error) {
        if (savingId !== this.savingId) {
          return;
        }
        notifyError(ipcError(error));
      } finally {
        if (savingId === this.savingId) {
          this.saving = false;
        }
      }
    },
    async testConnection(): Promise<void> {
      const api = desktop();
      if (!api) {
        notifyError('Abra o aplicativo para testar a conexão.');
        return;
      }
      this.testing = true;
      try {
        const result = await api.testDatabase({
          ...this.draft,
          databasePassword: this.password,
        });
        if (result.ok) {
          notifyOk(result.message);
          return;
        }
        notifyError(result.message);
      } catch (error) {
        notifyError(ipcError(error));
      } finally {
        this.testing = false;
      }
    },
  },
});
