<script setup lang="ts">
import LogView from '../../shared/ui/LogView.vue';
import PageFrame from '../../shared/ui/PageFrame.vue';
import { confirmAction } from '../../shared/ui/confirm';
import { notifyError, notifyOk } from '../../shared/ui/notify';
import { useMonitorStore } from './monitor-store';

const store = useMonitorStore();

async function copyLines(): Promise<void> {
  try {
    await store.copy(store.errors);
    notifyOk('Copiado.');
  } catch (error) {
    notifyError(error instanceof Error ? error.message : String(error));
  }
}

async function clearView(): Promise<void> {
  const confirmed = await confirmAction({
    title: 'Limpar a vista',
    message: 'As falhas somem desta lista.',
    okLabel: 'Limpar',
  });
  if (!confirmed) {
    return;
  }
  await store.clearErrors();
}
</script>

<template>
  <PageFrame>
    <template #actions>
      <span class="log-count">{{ store.errors.length === 1 ? '1 linha' : `${store.errors.length} linhas` }}</span>
      <q-btn dense no-caps outline color="primary" label="Copiar" @click="copyLines()" />
      <q-btn dense no-caps outline color="primary" label="Exportar" @click="store.exportErrors()" />
      <q-btn dense no-caps outline color="primary" label="Limpar a vista" @click="clearView()" />
    </template>
    <LogView class="col" :lines="store.errors" />
  </PageFrame>
</template>
