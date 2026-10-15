<script setup lang="ts">
import { computed } from 'vue';

import { confirmAction } from '../../shared/ui/confirm';
import { statusColor, statusLabel } from '../monitor/status-label';
import { useMonitorStore } from '../monitor/monitor-store';
import ServerForm from './ServerForm.vue';
import SettingsFrame from './SettingsFrame.vue';

const monitor = useMonitorStore();

const canStart = computed(() => monitor.status.state !== 'running' && monitor.status.state !== 'starting');
const canStop = computed(() => monitor.status.state !== 'stopped');

async function stopService(): Promise<void> {
  const confirmed = await confirmAction({
    title: 'Parar o serviço',
    message: 'A API deixa de atender até você iniciar de novo.',
    okLabel: 'Parar',
  });
  if (!confirmed) {
    return;
  }
  await monitor.stop();
}
</script>

<template>
  <SettingsFrame>
    <ServerForm />
    <div class="gap-inline row items-center space-stack">
      <q-badge :color="statusColor[monitor.status.state]">{{ statusLabel[monitor.status.state] }}</q-badge>
      <span>{{ monitor.status.message }}</span>
      <span v-if="monitor.status.port" class="text-grey-7">porta {{ monitor.status.port }}</span>
    </div>
    <q-banner v-if="monitor.status.restartRequired" rounded class="bg-orange-1 text-dark space-below">
      A configuração mudou. Reinicie o serviço para aplicar.
    </q-banner>
    <div class="gap-inline row items-center space-stack">
      <q-btn dense no-caps unelevated color="primary" label="Iniciar" :disable="!canStart" @click="monitor.start()" />
      <q-btn dense no-caps outline color="primary" label="Parar" :disable="!canStop" @click="stopService()" />
      <q-btn dense no-caps outline color="primary" label="Reiniciar" :disable="!canStop" @click="monitor.restart()" />
    </div>
  </SettingsFrame>
</template>
