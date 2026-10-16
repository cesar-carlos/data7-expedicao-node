<script setup lang="ts">
import { MAX_START_FAILURES } from '@shared/config-schema';
import { computed, onUnmounted, ref, watch } from 'vue';

import { confirmAction } from '../../shared/ui/confirm';
import StatusPill from '../monitor/StatusPill.vue';
import { useMonitorStore } from '../monitor/monitor-store';
import ServerForm from './ServerForm.vue';
import SettingsFrame from './SettingsFrame.vue';

const monitor = useMonitorStore();
const now = ref(Date.now());
let clockTimer: ReturnType<typeof setInterval> | undefined;

const canStart = computed(() => monitor.status.state !== 'running' && monitor.status.state !== 'starting');
const canStop = computed(() => monitor.status.state !== 'stopped');
const retrySeconds = computed(() => {
  const retryAt = monitor.status.retryAt;
  if (!retryAt) {
    return null;
  }
  return Math.max(0, Math.ceil((retryAt - now.value) / 1000));
});

watch(
  () => monitor.status.retryAt,
  (retryAt) => {
    if (clockTimer) {
      clearInterval(clockTimer);
      clockTimer = undefined;
    }
    if (!retryAt) {
      return;
    }
    now.value = Date.now();
    clockTimer = setInterval(() => {
      now.value = Date.now();
    }, 1000);
  },
  { immediate: true },
);

onUnmounted(() => {
  if (clockTimer) {
    clearInterval(clockTimer);
  }
});

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
    <div class="status-block">
      <StatusPill :state="monitor.status.state" />
      <p class="status-message">{{ monitor.status.message }}</p>
      <p v-if="monitor.status.port" class="status-meta">Porta {{ monitor.status.port }}</p>
      <p v-if="monitor.status.attempt > 0" class="status-meta">
        Tentativa {{ monitor.status.attempt }} de {{ MAX_START_FAILURES }}.
        <template v-if="retrySeconds">Nova tentativa em {{ retrySeconds }}s.</template>
      </p>
      <div v-if="monitor.status.restartRequired" class="restart-note">
        <p>A configuração mudou. Reinicie o serviço para aplicar.</p>
        <ul v-if="monitor.status.pendingChanges.length > 0" class="restart-list">
          <li v-for="change in monitor.status.pendingChanges" :key="change">{{ change }}</li>
        </ul>
      </div>
      <div class="row items-center gap-inline status-actions">
        <q-btn type="button" dense no-caps unelevated color="primary" label="Iniciar" :disable="!canStart" @click="monitor.start()" />
        <q-btn
          type="button"
          dense
          no-caps
          color="primary"
          label="Reiniciar"
          :unelevated="monitor.status.restartRequired"
          :outline="!monitor.status.restartRequired"
          :disable="!canStop"
          @click="monitor.restart()"
        />
        <q-btn type="button" dense no-caps outline color="negative" label="Parar" :disable="!canStop" @click="stopService()" />
      </div>
    </div>
    <div class="config-block">
      <h2 class="section-title">Porta da API</h2>
      <ServerForm />
    </div>
  </SettingsFrame>
</template>
