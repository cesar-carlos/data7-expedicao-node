<script setup lang="ts">
import type { QTableColumn } from 'quasar';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

import type { SocketClientSummary, SocketDisconnectRecord, SocketTraceEntry } from '@shared/ipc-contract';
import PageFrame from '../../shared/ui/PageFrame.vue';
import { useConnectionsStore } from './connections-store';

/** Row turns amber above this RTT. Engine.IO pings every 25s; a healthy LAN hop stays well under it. */
const RTT_WARN_MS = 500;
/** No application event for this long turns the row amber. */
const STALE_EVENT_MS = 120_000;

const store = useConnectionsStore();
const detailOpen = ref(false);
let timer: ReturnType<typeof setInterval> | undefined;
let ticking = false;
let queued = false;

const clients = computed(() => store.snapshot?.clients ?? []);
const disconnects = computed(() => store.snapshot?.recentDisconnects ?? []);
const websocketCount = computed(() => clients.value.filter((client) => client.transport === 'websocket').length);
const pollingCount = computed(() => clients.value.filter((client) => client.transport === 'polling').length);
const trace = computed(() => orderedTrace(store.detail?.trace ?? []));

const columns: QTableColumn<SocketClientSummary>[] = [
  { name: 'socketId', label: 'Cliente', field: (row) => shortId(row.socketId), align: 'left' },
  { name: 'lastSession', label: 'Sessão', field: (row) => row.lastSession || '—', align: 'left' },
  { name: 'address', label: 'IP', field: 'address', align: 'left' },
  { name: 'transport', label: 'Transporte', field: (row) => transportLabel(row.transport), align: 'left' },
  { name: 'lastEvent', label: 'Último evento', field: (row) => eventLabel(row.socketId, row.lastEvent), align: 'left' },
  { name: 'lastDurationMs', label: 'Processamento', field: (row) => milliseconds(row.lastDurationMs), align: 'right' },
  { name: 'errorCount', label: 'Erros', field: 'errorCount', align: 'right' },
  { name: 'rttMs', label: 'RTT', field: (row) => milliseconds(row.rttMs), align: 'right' },
];

const updatedLabel = computed(() => (store.snapshot ? `Atualizado ${clock(store.snapshot.now)}` : ''));
const dialogTitle = computed(() => {
  const session = store.detail?.lastSession;
  if (session) {
    return session;
  }
  return store.selectedId ? shortId(store.selectedId) : 'Cliente';
});

onMounted(() => {
  void tick();
  timer = setInterval(() => {
    void tick();
  }, 1000);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});

async function openDetail(socketId: string): Promise<void> {
  detailOpen.value = true;
  if (store.selectedId !== socketId) {
    store.detail = null;
    store.detailMessage = '';
  }
  store.selectedId = socketId;
  await tick();
}

watch(detailOpen, (open) => {
  if (open) {
    return;
  }
  store.selectedId = '';
  store.detail = null;
  store.detailMessage = '';
});

async function tick(): Promise<void> {
  if (ticking) {
    queued = true;
    return;
  }
  ticking = true;
  try {
    do {
      queued = false;
      await store.refresh();
    } while (queued);
  } finally {
    ticking = false;
  }
}

function orderedTrace(entries: SocketTraceEntry[]): SocketTraceEntry[] {
  return [...entries].sort((left, right) => {
    if (left.at === right.at) {
      if (left.direction === right.direction) {
        return 0;
      }
      return left.direction === 'in' ? -1 : 1;
    }
    return left.at < right.at ? -1 : 1;
  });
}

function rowClass(row: SocketClientSummary): Record<string, boolean> {
  const tone = healthTone(row);
  return {
    'connection-row': true,
    'connection-selected': row.socketId === store.selectedId,
    'connection-warn': tone === 'warn',
    'connection-bad': tone === 'bad',
  };
}

function healthReason(row: SocketClientSummary): string {
  const notes: string[] = [];
  if (row.errorCount > 0) {
    notes.push(row.errorCount === 1 ? '1 erro' : `${row.errorCount} erros`);
  }
  if (row.writeBufferDepth > 0) {
    notes.push('Fila de envio');
  }
  if (row.rttMs != null && row.rttMs >= RTT_WARN_MS) {
    notes.push('RTT alto');
  }
  if (isStale(row)) {
    notes.push('Sem evento recente');
  }
  return notes.join(' · ');
}

function healthTone(row: SocketClientSummary): 'bad' | 'warn' | '' {
  if (row.errorCount > 0) {
    return 'bad';
  }
  if (healthReason(row)) {
    return 'warn';
  }
  return '';
}

function isStale(row: SocketClientSummary): boolean {
  const now = Date.parse(store.snapshot?.now ?? '');
  const mark = Date.parse(row.lastEventAt ?? row.connectedAt);
  if (!Number.isFinite(now) || !Number.isFinite(mark)) {
    return false;
  }
  return now - mark >= STALE_EVENT_MS;
}

function shortId(socketId: string): string {
  return socketId.length > 10 ? `${socketId.slice(0, 10)}…` : socketId;
}

function eventLabel(socketId: string, event: string): string {
  if (!event) {
    return '—';
  }
  const prefix = `${socketId} `;
  return event.startsWith(prefix) ? event.slice(prefix.length) : event;
}

function transportLabel(transport: string): string {
  if (transport === 'websocket') {
    return 'WebSocket';
  }
  if (transport === 'polling') {
    return 'Polling';
  }
  return transport || '—';
}

function clock(iso: string | null): string {
  if (!iso) {
    return '—';
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function milliseconds(value: number | null): string {
  if (value == null) {
    return '—';
  }
  return `${Math.round(value)} ms`;
}

function formatBytes(value: number): string {
  if (value < 1024) {
    return `${Math.round(value)} B`;
  }
  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function formatRate(value: number): string {
  if (value < 10) {
    return value.toFixed(1);
  }
  return Math.round(value).toString();
}

function formatSpan(ms: number): string {
  const seconds = Math.max(0, Math.round(ms / 1000));
  if (seconds < 60) {
    return `${seconds} s`;
  }
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes} min ${rest} s`;
}

function reasonLabel(reason: string): string {
  if (reason === 'ping timeout') {
    return 'Sem resposta do ping';
  }
  if (reason === 'transport close') {
    return 'Transporte fechou';
  }
  if (reason === 'transport error') {
    return 'Erro de transporte';
  }
  if (reason === 'client namespace disconnect') {
    return 'Cliente encerrou';
  }
  if (reason === 'server namespace disconnect') {
    return 'Servidor encerrou';
  }
  return reason;
}

function directionLabel(direction: SocketTraceEntry['direction']): string {
  return direction === 'in' ? 'Recebido' : 'Enviado';
}

function disconnectKey(record: SocketDisconnectRecord): string {
  return `${record.socketId}-${record.at}`;
}
</script>

<template>
  <PageFrame>
    <template #actions>
      <span v-if="updatedLabel" class="log-count">{{ updatedLabel }}</span>
    </template>

    <div class="connections-scroll">
    <div class="metric-strip">
      <div class="metric">
        <div class="metric-value">{{ clients.length }}</div>
        <div class="metric-label">Clientes</div>
      </div>
      <div class="metric">
        <div class="metric-value">{{ websocketCount }}</div>
        <div class="metric-label">WebSocket</div>
      </div>
      <div class="metric">
        <div class="metric-value">{{ pollingCount }}</div>
        <div class="metric-label">Polling</div>
      </div>
      <div class="metric">
        <div class="metric-value">{{ store.snapshot ? `${store.snapshot.eventLoopDelayMs.p99} ms` : '—' }}</div>
        <div class="metric-label">Atraso p99</div>
      </div>
      <div class="metric">
        <div class="metric-value">{{ formatRate(store.rates.eventsPerSec) }}</div>
        <div class="metric-label">Eventos/s</div>
      </div>
      <div class="metric">
        <div class="metric-value">{{ formatBytes(store.rates.bytesInPerSec) }}</div>
        <div class="metric-label">Entrada/s</div>
      </div>
      <div class="metric">
        <div class="metric-value">{{ formatBytes(store.rates.bytesOutPerSec) }}</div>
        <div class="metric-label">Saída/s</div>
      </div>
    </div>

    <div v-if="!store.available" class="panel">
      <p class="status-message">{{ store.message }}</p>
    </div>

    <template v-else>
      <q-table
        class="connections-table"
        flat
        bordered
        dense
        hide-pagination
        :rows="clients"
        :columns="columns"
        row-key="socketId"
        :pagination="{ rowsPerPage: 0 }"
        no-data-label="Nenhum coletor conectado."
      >
        <template #body="props">
          <q-tr
            :props="props"
            :class="rowClass(props.row)"
            :title="healthReason(props.row) || undefined"
            @click="openDetail(props.row.socketId)"
          >
            <q-td v-for="col in props.cols" :key="col.name" :props="props">
              <span :title="col.name === 'socketId' ? props.row.socketId : undefined">{{ col.value }}</span>
            </q-td>
          </q-tr>
        </template>
      </q-table>

      <div v-if="disconnects.length > 0" class="section-gap">
        <h2 class="section-title">Quedas recentes</h2>
        <ul class="disconnect-list">
          <li v-for="record in disconnects" :key="disconnectKey(record)">
            <span class="trace-time">{{ clock(record.at) }}</span>
            {{ shortId(record.socketId) }} · {{ reasonLabel(record.reason) }} · {{ formatSpan(record.connectedMs) }}
          </li>
        </ul>
      </div>
    </template>
    </div>

    <q-dialog v-model="detailOpen">
      <q-card class="trace-dialog">
        <div class="trace-dialog-head">
          <div class="trace-dialog-copy">
            <p class="trace-kicker">Cliente</p>
            <h2 class="trace-dialog-title">{{ dialogTitle }}</h2>
            <div v-if="store.detail" class="trace-identity">
              <span :title="store.detail.socketId">{{ shortId(store.detail.socketId) }}</span>
              <span>{{ store.detail.address || '—' }}</span>
              <span>{{ transportLabel(store.detail.transport) }}</span>
              <span>desde {{ clock(store.detail.connectedAt) }}</span>
            </div>
          </div>
          <q-btn flat round dense icon="close" aria-label="Fechar" @click="detailOpen = false" />
        </div>
        <div v-if="store.detail" class="trace-facts">
          <div class="trace-fact">
            <div class="trace-fact-value">{{ formatBytes(store.detail.bytesIn) }}</div>
            <div class="trace-fact-label">Recebido</div>
          </div>
          <div class="trace-fact">
            <div class="trace-fact-value">{{ formatBytes(store.detail.bytesOut) }}</div>
            <div class="trace-fact-label">Enviado</div>
          </div>
          <div class="trace-fact" :class="{ warn: store.detail.writeBufferDepth > 0 }">
            <div class="trace-fact-value">{{ store.detail.writeBufferDepth }}</div>
            <div class="trace-fact-label">Fila</div>
          </div>
          <div class="trace-fact">
            <div class="trace-fact-value">{{ milliseconds(store.detail.lastDurationMs) }}</div>
            <div class="trace-fact-label">Processamento</div>
          </div>
          <div class="trace-fact" :class="{ bad: store.detail.errorCount > 0 }">
            <div class="trace-fact-value">{{ store.detail.errorCount }}</div>
            <div class="trace-fact-label">Erros</div>
          </div>
          <div class="trace-fact" :class="{ warn: store.detail.rttMs != null && store.detail.rttMs >= RTT_WARN_MS }">
            <div class="trace-fact-value">{{ milliseconds(store.detail.rttMs) }}</div>
            <div class="trace-fact-label">RTT</div>
          </div>
        </div>
        <div class="trace-dialog-body">
          <div class="trace-section-head">
            <h3>Mensagens</h3>
            <p v-if="store.detail && trace.length > 0">O texto entra só nas mensagens de agora, enquanto este cliente está aberto.</p>
          </div>
          <p v-if="store.detailMessage" class="trace-empty">{{ store.detailMessage }}</p>
          <p v-else-if="!store.detail" class="trace-empty">Carregando a trilha.</p>
          <p v-else-if="trace.length === 0" class="trace-empty">Nenhuma mensagem deste cliente.</p>
          <ul v-else class="trace-list">
            <li v-for="(entry, index) in trace" :key="`${entry.at}-${index}`" class="trace-entry" :class="entry.direction">
              <div class="trace-entry-top">
                <span class="trace-pill" :class="entry.direction">{{ directionLabel(entry.direction) }}</span>
                <span class="trace-event">{{ eventLabel(store.selectedId, entry.event) }}</span>
                <span v-if="entry.slow" class="trace-flag slow">Lento</span>
                <span v-if="entry.error" class="trace-flag error">Erro</span>
                <span v-if="entry.broadcast" class="trace-flag broadcast">Todos</span>
                <span class="trace-entry-meta">
                  <template v-if="entry.durationMs != null">{{ milliseconds(entry.durationMs) }} · </template>{{ formatBytes(entry.bytes) }}
                </span>
                <span class="trace-time">{{ clock(entry.at) }}</span>
              </div>
              <pre v-if="entry.preview" class="trace-preview">{{ entry.preview }}</pre>
            </li>
          </ul>
        </div>
      </q-card>
    </q-dialog>
  </PageFrame>
</template>
