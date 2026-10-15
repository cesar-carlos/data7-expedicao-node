<script setup lang="ts">
import { useSettingsStore } from './settings-store';

const store = useSettingsStore();
</script>

<template>
  <q-list bordered separator class="rounded-borders">
    <q-item tag="label">
      <q-item-section>
        <q-item-label>Iniciar com o Windows</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-toggle v-model="store.draft.startWithWindows" color="primary" @update:model-value="store.save()" />
      </q-item-section>
    </q-item>
    <q-item tag="label">
      <q-item-section>
        <q-item-label>Fechar para a bandeja</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-toggle v-model="store.draft.closeToTray" color="primary" @update:model-value="store.save()" />
      </q-item-section>
    </q-item>
    <q-item tag="label">
      <q-item-section>
        <q-item-label>Minimizar para a bandeja</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-toggle v-model="store.draft.minimizeToTray" color="primary" @update:model-value="store.save()" />
      </q-item-section>
    </q-item>
  </q-list>
</template>
