<script setup lang="ts">
import { useSettingsStore } from './settings-store';

const store = useSettingsStore();
</script>

<template>
  <q-list class="option-list">
    <q-item tag="label">
      <q-item-section>
        <q-item-label>Iniciar com o Windows</q-item-label>
        <q-item-label caption>Abre o aplicativo no login de qualquer usuário desta máquina.</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-toggle v-model="store.draft.startWithWindows" color="primary" aria-label="Iniciar com o Windows" @update:model-value="store.save()" />
      </q-item-section>
    </q-item>
    <q-item tag="label">
      <q-item-section>
        <q-item-label>Fechar para a bandeja</q-item-label>
        <q-item-label caption>Fechar a janela deixa o servidor rodando na bandeja.</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-toggle v-model="store.draft.closeToTray" color="primary" aria-label="Fechar para a bandeja" @update:model-value="store.save()" />
      </q-item-section>
    </q-item>
    <q-item tag="label">
      <q-item-section>
        <q-item-label>Minimizar para a bandeja</q-item-label>
        <q-item-label caption>Minimizar esconde a janela e o servidor continua.</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-toggle v-model="store.draft.minimizeToTray" color="primary" aria-label="Minimizar para a bandeja" @update:model-value="store.save()" />
      </q-item-section>
    </q-item>
  </q-list>
</template>
