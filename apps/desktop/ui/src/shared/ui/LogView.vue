<script setup lang="ts">
import type { LogLine } from '@shared/ipc-contract';
import { nextTick, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    lines: LogLine[];
    follow?: boolean;
    emptyText?: string;
  }>(),
  { emptyText: 'Nenhuma linha ainda.' },
);

const emit = defineEmits<{ 'update:follow': [value: boolean] }>();

interface ScrollInfo {
  verticalPosition: number;
  verticalSize: number;
  verticalContainerSize: number;
}

interface LogScroller {
  getScroll: () => ScrollInfo;
  setScrollPosition: (axis: 'vertical', offset: number, duration?: number) => void;
}

const area = ref<LogScroller | null>(null);
let ignoreScroll = false;

function clock(at: string): string {
  if (!at) {
    return '';
  }
  const date = new Date(at);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function nearBottom(scroll: ScrollInfo): boolean {
  return scroll.verticalSize - scroll.verticalPosition - scroll.verticalContainerSize < 80;
}

function scrollToEnd(scroller: LogScroller): void {
  ignoreScroll = true;
  const scroll = scroller.getScroll();
  scroller.setScrollPosition('vertical', scroll.verticalSize, 0);
  window.setTimeout(() => {
    ignoreScroll = false;
  }, 200);
}

function onScroll(info: ScrollInfo): void {
  if (typeof props.follow !== 'boolean' || ignoreScroll) {
    return;
  }
  const atEnd = nearBottom(info);
  if (atEnd !== props.follow) {
    emit('update:follow', atEnd);
  }
}

watch(
  () => [props.lines.length, props.follow] as const,
  async ([, follow]) => {
    await nextTick();
    const scroller = area.value;
    if (!scroller || follow === false) {
      return;
    }
    if (follow === true) {
      scrollToEnd(scroller);
      return;
    }
    const scroll = scroller.getScroll();
    if (nearBottom(scroll) || scroll.verticalPosition === 0) {
      scrollToEnd(scroller);
    }
  },
);
</script>

<template>
  <div class="log-shell">
    <div v-if="lines.length === 0" class="log-empty">{{ emptyText }}</div>
    <q-scroll-area v-else ref="area" class="log-scroll" @scroll="onScroll">
      <div v-for="line in lines" :key="line.id" class="log-line" :class="line.error ? 'err' : line.stream">
        <span v-if="clock(line.at)" class="log-time">{{ clock(line.at) }}</span>
        <span class="log-text">{{ line.text }}</span>
      </div>
    </q-scroll-area>
  </div>
</template>
