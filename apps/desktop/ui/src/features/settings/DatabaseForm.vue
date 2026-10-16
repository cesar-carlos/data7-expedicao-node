<script setup lang="ts">
import { ref } from 'vue';

import { asNumber } from '../../shared/ui/as-number';
import { useSettingsStore } from './settings-store';

const store = useSettingsStore();
const showPassword = ref(false);
</script>

<template>
  <h2 class="section-title">Endereço</h2>
  <div class="field-grid">
    <div class="span-6">
      <q-input v-model="store.draft.databaseHost" outlined dense hide-bottom-space label="Host" @blur="store.saveOnExit()" />
    </div>
    <div class="span-6">
      <q-input
        :model-value="store.draft.databasePort"
        type="number"
        outlined
        dense
        hide-bottom-space
        label="Porta"
        @update:model-value="store.draft.databasePort = asNumber($event)"
        @blur="store.saveOnExit()"
      />
    </div>
    <div class="span-12">
      <q-input v-model="store.draft.databaseName" outlined dense hide-bottom-space label="Banco" @blur="store.saveOnExit()" />
    </div>
  </div>
  <h2 class="section-title section-gap">Acesso</h2>
  <div class="field-grid">
    <div class="span-6">
      <q-input v-model="store.draft.databaseUser" outlined dense hide-bottom-space label="Usuário" @blur="store.saveOnExit()" />
    </div>
    <div class="span-6">
      <q-input
        v-model="store.password"
        :type="showPassword ? 'text' : 'password'"
        outlined
        dense
        hide-bottom-space
        label="Senha"
        autocomplete="new-password"
        :placeholder="store.passwordSet ? 'Já gravada — preencha só para trocar' : ''"
        @blur="store.saveOnExit()"
      >
        <template #append>
          <q-icon :name="showPassword ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="showPassword = !showPassword" />
        </template>
      </q-input>
    </div>
  </div>
  <div class="section-gap">
    <q-btn
      type="button"
      dense
      no-caps
      outline
      color="primary"
      label="Testar conexão"
      :loading="store.testing"
      @click="store.testConnection()"
    />
    <p v-if="store.probe" class="probe-result" :class="store.probe.ok ? 'ok' : 'fail'">{{ store.probe.message }}</p>
  </div>
</template>
