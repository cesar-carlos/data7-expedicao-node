<script setup lang="ts">
import PageFrame from '../../shared/ui/PageFrame.vue';
import { useSettingsStore } from './settings-store';

const store = useSettingsStore();
</script>

<template>
  <PageFrame>
    <div class="form-column">
      <p v-if="store.needsSetup" class="setup-note">
        Os campos gravam ao sair. Se havia um .env da loja, os valores já vieram preenchidos.
      </p>
      <q-form class="panel" @submit.prevent="store.saveOnExit()">
        <slot />
      </q-form>
    </div>
  </PageFrame>
</template>
