<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const title = computed(() => String(route.meta.title ?? ''));
const lead = computed(() => String(route.meta.lead ?? ''));

function pageStyle(offset: number): { minHeight: string; height: string } {
  const height = `calc(100vh - ${offset}px)`;
  return { minHeight: height, height };
}
</script>

<template>
  <q-page class="column pad-page" :style-fn="pageStyle">
    <div class="page-head">
      <div class="page-copy">
        <h1 class="page-title">{{ title }}</h1>
        <p v-if="lead" class="page-lead">{{ lead }}</p>
      </div>
      <div v-if="$slots.actions" class="page-actions">
        <slot name="actions" />
      </div>
    </div>
    <div class="column col page-body">
      <slot />
    </div>
  </q-page>
</template>
