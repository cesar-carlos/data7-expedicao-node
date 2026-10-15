<script setup lang="ts">
import LogView from '../../shared/ui/LogView.vue';
import PageFrame from '../../shared/ui/PageFrame.vue';
import { confirmAction } from '../../shared/ui/confirm';
import { useMonitorStore } from './monitor-store';

const store = useMonitorStore();

async function clearView(): Promise<void> {
  const confirmed = await confirmAction({
    title: 'Limpar a vista',
    message: 'As linhas somem desta lista.',
    okLabel: 'Limpar',
  });
  if (!confirmed) {
    return;
  }
  await store.clearLive();
}
</script>

<template>
  <PageFrame>
    <LogView class="col" :lines="store.lines" />
    <div class="gap-inline row items-center space-stack">
      <q-btn dense no-caps outline color="primary" label="Copiar" @click="store.copy(store.lines)" />
      <q-btn dense no-caps outline color="primary" label="Limpar a vista" @click="clearView()" />
    </div>
  </PageFrame>
</template>
