<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import brandIcon from '../assets/icon.png';
import StatusPill from '../features/monitor/StatusPill.vue';
import { useMonitorStore } from '../features/monitor/monitor-store';
import { useSettingsStore } from '../features/settings/settings-store';
import { notifyError } from '../shared/ui/notify';

const monitor = useMonitorStore();
const settings = useSettingsStore();
const drawer = ref(true);

const groups = [
  {
    label: 'Configuração',
    pages: [
      { name: 'server', label: 'Serviço', icon: 'settings_ethernet' },
      { name: 'database', label: 'SQL Server', icon: 'storage' },
      { name: 'expedicao', label: 'Expedição', icon: 'inventory_2' },
      { name: 'window', label: 'Janela', icon: 'web_asset' },
    ],
  },
  {
    label: 'Acompanhamento',
    pages: [
      { name: 'connections', label: 'Conexões', icon: 'hub' },
      { name: 'console', label: 'Console', icon: 'terminal' },
      { name: 'errors', label: 'Erros', icon: 'error_outline' },
    ],
  },
];

const errorCount = computed(() => monitor.errors.length);

onMounted(() => {
  void monitor.open().catch((error: unknown) => {
    monitor.status = {
      ...monitor.status,
      state: 'failed',
      message: error instanceof Error ? error.message : String(error),
    };
  });
  void settings.load().catch((error: unknown) => {
    notifyError(error instanceof Error ? error.message : String(error));
  });
});
</script>

<template>
  <q-layout view="hHh lpR fff">
    <q-header class="bg-white text-dark shell-header">
      <q-toolbar class="bar">
        <q-avatar rounded size="28px">
          <img :src="brandIcon" alt="" />
        </q-avatar>
        <q-toolbar-title class="brand-title">Data7 Expedição Servidor</q-toolbar-title>
        <q-space />
        <span v-if="monitor.status.restartRequired" class="restart-chip" :title="monitor.status.pendingChanges.join('\n')">
          Reinicie para aplicar
        </span>
        <StatusPill :state="monitor.status.state" />
      </q-toolbar>
      <q-linear-progress v-if="settings.saving" indeterminate color="primary" size="2px" class="absolute-bottom" />
    </q-header>

    <q-drawer v-model="drawer" class="nav-drawer" behavior="desktop" bordered :width="240">
      <q-list>
        <template v-for="group in groups" :key="group.label">
          <q-item-label header class="nav-group">{{ group.label }}</q-item-label>
          <q-item
            v-for="page in group.pages"
            :key="page.name"
            clickable
            v-ripple
            exact
            :to="{ name: page.name }"
            active-class="nav-active"
          >
            <q-item-section avatar>
              <q-icon :name="page.icon" />
            </q-item-section>
            <q-item-section>{{ page.label }}</q-item-section>
            <q-item-section v-if="page.name === 'errors' && errorCount > 0" side>
              <q-badge color="negative">{{ errorCount > 99 ? '99+' : errorCount }}</q-badge>
            </q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
