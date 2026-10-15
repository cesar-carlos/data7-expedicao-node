<script setup lang="ts">
import { asNumber } from '../../shared/ui/as-number';
import { useSettingsStore } from './settings-store';

const store = useSettingsStore();
</script>

<template>
  <div class="field-grid">
    <div class="span-6">
      <q-input
        :model-value="store.draft.serverPort"
        type="number"
        outlined
        dense
        hide-bottom-space
        label="Porta"
        @update:model-value="store.draft.serverPort = asNumber($event)"
        @blur="store.saveOnExit()"
      />
    </div>
  </div>
</template>
