<script setup lang="ts">
import { computed, ref } from 'vue';

import LogView from '../../shared/ui/LogView.vue';
import PageFrame from '../../shared/ui/PageFrame.vue';
import { confirmAction } from '../../shared/ui/confirm';
import { notifyError, notifyOk } from '../../shared/ui/notify';
import { useMonitorStore } from './monitor-store';

const store = useMonitorStore();
const query = ref('');
const follow = ref(true);

const term = computed(() => String(query.value ?? '').trim().toLowerCase());
const visible = computed(() => {
  if (!term.value) {
    return store.lines;
  }
  return store.lines.filter((line) => line.text.toLowerCase().includes(term.value));
});
const countText = computed(() => {
  const total = store.lines.length;
  if (!term.value) {
    return total === 1 ? '1 linha' : `${total} linhas`;
  }
  return `${visible.value.length} de ${total}`;
});
const emptyText = computed(() => (store.lines.length === 0 ? 'Nenhuma linha ainda.' : 'Nenhuma linha com esse texto.'));

async function copyLines(): Promise<void> {
  try {
    await store.copy(visible.value);
    notifyOk('Copiado.');
  } catch (error) {
    notifyError(error instanceof Error ? error.message : String(error));
  }
}

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
    <template #actions>
      <span class="log-count">{{ countText }}</span>
      <q-btn dense no-caps outline color="primary" label="Copiar" @click="copyLines()" />
      <q-btn dense no-caps outline color="primary" label="Limpar a vista" @click="clearView()" />
    </template>
    <div class="log-toolbar">
      <q-input v-model="query" class="log-search" dense outlined hide-bottom-space clearable placeholder="Buscar" aria-label="Buscar">
        <template #prepend>
          <q-icon name="search" />
        </template>
      </q-input>
      <q-toggle v-model="follow" color="primary" label="Seguir o fim" />
    </div>
    <LogView v-model:follow="follow" class="col" :lines="visible" :empty-text="emptyText" />
  </PageFrame>
</template>
