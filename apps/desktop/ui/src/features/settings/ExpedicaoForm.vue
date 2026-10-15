<script setup lang="ts">
import { asNumber } from '../../shared/ui/as-number';
import { useSettingsStore } from './settings-store';

const store = useSettingsStore();
</script>

<template>
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
  <q-list bordered separator class="rounded-borders space-stack">
    <q-item tag="label">
      <q-item-section>
        <q-item-label>Escuta periódica ligada</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-toggle v-model="store.draft.separarListenEnabled" color="primary" @update:model-value="store.saveOnExit()" />
      </q-item-section>
    </q-item>
    <q-item tag="label">
      <q-item-section>
        <q-item-label>Log de depuração da escuta</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-toggle v-model="store.draft.separarListenDebug" color="primary" @update:model-value="store.saveOnExit()" />
      </q-item-section>
    </q-item>
  </q-list>
</template>
