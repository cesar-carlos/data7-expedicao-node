<script setup lang="ts">
import type { ServerState } from '@shared/ipc-contract';

import { statusLabel } from './status-label';

defineProps<{ state: ServerState }>();
</script>

<template>
  <span class="status-pill" :class="state">
    <span class="status-dot" />
    {{ statusLabel[state] }}
  </span>
</template>
