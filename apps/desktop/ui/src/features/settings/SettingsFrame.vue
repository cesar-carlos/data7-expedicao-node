<script setup lang="ts">
import PageFrame from '../../shared/ui/PageFrame.vue';
import { useSettingsStore } from './settings-store';

const store = useSettingsStore();
</script>

<template>
  <PageFrame>
    <q-form @submit.prevent="store.saveOnExit()">
      <q-linear-progress v-if="store.saving" indeterminate color="primary" class="save-progress" />
      <q-banner v-if="store.needsSetup" rounded class="bg-blue-1 text-dark space-below">
        Os campos gravam ao sair. Se havia um .env da loja, os valores já vieram preenchidos.
      </q-banner>
      <slot />
    </q-form>
  </PageFrame>
</template>
