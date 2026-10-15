<script setup lang="ts">
import type { LogLine } from '@shared/ipc-contract';
import { nextTick, ref, watch } from 'vue';

const props = defineProps<{ lines: LogLine[] }>();

interface LogScroller {
  getScroll: () => {
    verticalPosition: number;
    verticalSize: number;
    verticalContainerSize: number;
  };
  setScrollPosition: (axis: 'vertical', offset: number, duration?: number) => void;
}

const area = ref<LogScroller | null>(null);

watch(
  () => props.lines.length,
  async () => {
    await nextTick();
    const scroller = area.value;
    if (!scroller) {
      return;
    }
    const scroll = scroller.getScroll();
    const nearBottom = scroll.verticalSize - scroll.verticalPosition - scroll.verticalContainerSize < 80;
    if (nearBottom || scroll.verticalPosition === 0) {
      scroller.setScrollPosition('vertical', scroll.verticalSize, 0);
    }
  },
);
</script>

<template>
  <q-scroll-area ref="area" class="log-area col">
    <div v-if="lines.length === 0" class="log-line">Nenhuma linha ainda.</div>
    <div v-for="line in lines" :key="line.id" class="log-line" :class="line.error ? 'err' : line.stream">{{ line.text }}</div>
  </q-scroll-area>
</template>
