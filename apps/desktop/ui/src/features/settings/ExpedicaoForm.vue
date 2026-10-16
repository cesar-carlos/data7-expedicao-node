<script setup lang="ts">
import { asNumber } from '../../shared/ui/as-number';
import { useSettingsStore } from './settings-store';

const store = useSettingsStore();
</script>

<template>
  <h2 class="section-title">Intervalos</h2>
  <div class="field-grid">
    <div class="span-4">
      <q-input
        :model-value="store.draft.separarListenIntervalMs"
        type="number"
        outlined
        dense
        hide-bottom-space
        label="Intervalo da escuta (ms)"
        @update:model-value="store.draft.separarListenIntervalMs = asNumber($event)"
        @blur="store.saveOnExit()"
      />
    </div>
    <div class="span-4">
      <q-input
        :model-value="store.draft.separarListenLimit"
        type="number"
        outlined
        dense
        hide-bottom-space
        label="Limite da escuta"
        @update:model-value="store.draft.separarListenLimit = asNumber($event)"
        @blur="store.saveOnExit()"
      />
    </div>
    <div class="span-4">
      <q-input
        :model-value="store.draft.sqlHeartbeatIntervalMs"
        type="number"
        outlined
        dense
        hide-bottom-space
        label="Intervalo do SQL (ms)"
        @update:model-value="store.draft.sqlHeartbeatIntervalMs = asNumber($event)"
        @blur="store.saveOnExit()"
      />
    </div>
  </div>
  <h2 class="section-title section-gap">Opções</h2>
  <q-list class="option-list">
    <q-item tag="label">
      <q-item-section>
        <q-item-label>Escuta periódica ligada</q-item-label>
        <q-item-label caption>Consulta a separação e avisa quem está conectado.</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-toggle v-model="store.draft.separarListenEnabled" color="primary" aria-label="Escuta periódica ligada" @update:model-value="store.saveOnExit()" />
      </q-item-section>
    </q-item>
    <q-item tag="label">
      <q-item-section>
        <q-item-label>Log de depuração da escuta</q-item-label>
        <q-item-label caption>Escreve no console o que a escuta encontrou.</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-toggle v-model="store.draft.separarListenDebug" color="primary" aria-label="Log de depuração da escuta" @update:model-value="store.saveOnExit()" />
      </q-item-section>
    </q-item>
  </q-list>
</template>
