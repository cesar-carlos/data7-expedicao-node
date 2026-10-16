<script setup lang="ts">
import type { QTableColumn } from 'quasar';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

import type { SocketClientSummary, SocketDisconnectRecord, SocketTraceEntry } from '@shared/ipc-contract';
import PageFrame from '../../shared/ui/PageFrame.vue';
import { notifyError, notifyOk } from '../../shared/ui/notify';
import { useConnectionsStore } from './connections-store';
import {
  PREVIEW_FOLDED_LINES,
  TRACE_HISTORY_LIMIT,
  WATCHED_PREVIEW_KB,
  foldTracePreview,
  formatTracePreview,
  matchesTraceFilter,
  traceClipboardText,
  traceTailKey,
  type TraceFilter,
} from './trace-text';

/** Row turns amber above this RTT. Engine.IO pings every 25s; a healthy LAN hop stays well under it. */
const RTT_WARN_MS = 500;
/** No application event for this long turns the row amber. */
const STALE_EVENT_MS = 120_000;

const store = useConnectionsStore();
const detailOpen = ref(false);
const traceBody = ref<HTMLElement | null>(null);
const followTail = ref(true);
const unseenTail = ref(false);
const directionFilter = ref<TraceFilter['direction']>('all');
const onlyErrors = ref(false);
const onlySlow = ref(false);
const eventQuery = ref<string | null>('');
const clientQuery = ref<string | null>('');
const expandedPreview = ref<Record<string, boolean>>({});
let ignoreTraceScroll = false;
let tailMark = '';
let filterTouch = false;
let timer: ReturnType<typeof setInterval> | undefined;
let ticking = false;
let queued = false;

const clients = computed(() => store.snapshot?.clients ?? []);
const visibleClients = computed(() => {
  const query = (clientQuery.value ?? '').trim().toLowerCase();
  if (!query) {
    return clients.value;
  }
  return clients.value.filter((row) => clientSearchText(row).includes(query));
});
const clientFilterActive = computed(() => (clientQuery.value ?? '').trim().length > 0);
const tableEmptyLabel = computed(() =>
  clients.value.length === 0 ? 'Nenhum coletor conectado.' : 'Nenhum coletor com esse texto.',
);
const disconnects = computed(() => store.snapshot?.recentDisconnects ?? []);
const websocketCount = computed(() => clients.value.filter((client) => client.transport === 'websocket').length);
const pollingCount = computed(() => clients.value.filter((client) => client.transport === 'polling').length);
const trace = computed(() => orderedTrace(store.detail?.trace ?? []));
const traceFilter = computed<TraceFilter>(() => ({
  direction: directionFilter.value,
  errors: onlyErrors.value,
  slow: onlySlow.value,
  query: eventQuery.value ?? '',
}));
const visibleTrace = computed(() =>
  trace.value.filter((entry) =>
    matchesTraceFilter(
      { ...entry, event: eventLabel(store.selectedId, entry.event), preview: entry.preview },
      traceFilter.value,
    ),
  ),
);
const traceFilterActive = computed(
  () => directionFilter.value !== 'all' || onlyErrors.value || onlySlow.value || (eventQuery.value ?? '').trim().length > 0,
);
const traceCaption = computed(() => {
  const limit = `Últimas ${TRACE_HISTORY_LIMIT} mensagens. O texto do cliente aberto guarda até ${WATCHED_PREVIEW_KB} KB e só entra enquanto ele está aberto.`;
  if (!traceFilterActive.value || trace.value.length === 0) {
    return limit;
  }
  return `${visibleTrace.value.length} de ${trace.value.length}. ${limit}`;
});

const columns: QTableColumn<SocketClientSummary>[] = [
  { name: 'socketId', label: 'Cliente', field: (row) => shortId(row.socketId), align: 'left' },
  { name: 'lastSession', label: 'Sessão', field: (row) => row.lastSession || '—', align: 'left' },
  { name: 'address', label: 'IP', field: 'address', align: 'left' },
  { name: 'transport', label: 'Transporte', field: (row) => transportLabel(row.transport), align: 'left' },
  { name: 'lastEvent', label: 'Último evento', field: (row) => eventLabel(row.socketId, row.lastEvent), align: 'left' },
  { name: 'lastDurationMs', label: 'Processamento', field: (row) => milliseconds(row.lastDurationMs), align: 'right' },
  { name: 'errorCount', label: 'Erros', field: 'errorCount', align: 'right' },
  { name: 'rttMs', label: 'RTT', field: (row) => milliseconds(row.rttMs), align: 'right' },
  { name: 'health', label: 'Situação', field: (row) => healthReason(row) || '—', align: 'left' },
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
  resetTraceTools();
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
  resetTraceTools();
  store.selectedId = '';
  store.detail = null;
  store.detailMessage = '';
});

function atBottom(element: HTMLElement): boolean {
  return element.scrollHeight - element.scrollTop - element.clientHeight <= 2;
}

function onTraceScroll(): void {
  const element = traceBody.value;
  if (!element || ignoreTraceScroll) {
    return;
  }
  followTail.value = atBottom(element);
  if (followTail.value) {
    unseenTail.value = false;
    tailMark = traceTailKey(visibleTrace.value);
  }
}

function resetTraceTools(): void {
  followTail.value = true;
  unseenTail.value = false;
  directionFilter.value = 'all';
  onlyErrors.value = false;
  onlySlow.value = false;
  eventQuery.value = '';
  expandedPreview.value = {};
  tailMark = '';
  filterTouch = false;
}

function toggleDirection(direction: 'in' | 'out'): void {
  filterTouch = true;
  directionFilter.value = directionFilter.value === direction ? 'all' : direction;
}

function toggleErrors(): void {
  filterTouch = true;
  onlyErrors.value = !onlyErrors.value;
}

function toggleSlow(): void {
  filterTouch = true;
  onlySlow.value = !onlySlow.value;
}

function resumeTail(): void {
  followTail.value = true;
  unseenTail.value = false;
  tailMark = traceTailKey(visibleTrace.value);
  void followTrace();
}

async function copyTraceEntry(entry: SocketTraceEntry): Promise<void> {
  try {
    await navigator.clipboard.writeText(
      traceClipboardText({
        direction: directionLabel(entry.direction),
        event: eventLabel(store.selectedId, entry.event),
        at: clock(entry.at),
        preview: entry.preview,
      }),
    );
    notifyOk('Copiado.');
  } catch (error) {
    notifyError(error instanceof Error ? error.message : String(error));
  }
}

function scrollTraceToEnd(): void {
  const element = traceBody.value;
  if (!element) {
    return;
  }
  ignoreTraceScroll = true;
  element.scrollTop = element.scrollHeight;
  requestAnimationFrame(() => {
    const current = traceBody.value;
    if (current) {
      current.scrollTop = current.scrollHeight;
    }
    requestAnimationFrame(() => {
      ignoreTraceScroll = false;
    });
  });
}

async function followTrace(): Promise<void> {
  await nextTick();
  if (!followTail.value) {
    return;
  }
  scrollTraceToEnd();
}

watch(eventQuery, () => {
  filterTouch = true;
});

watch(visibleTrace, (entries) => {
  const mark = traceTailKey(entries);
  const fromFilter = filterTouch;
  filterTouch = false;
  if (!fromFilter && !followTail.value && mark !== tailMark && mark !== '') {
    unseenTail.value = true;
  }
  if (followTail.value || fromFilter) {
    unseenTail.value = false;
    tailMark = mark;
  }
  void followTrace();
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

function previewIdentity(entry: SocketTraceEntry, index: number): string {
  return `${entry.at}|${entry.direction}|${entry.event}|${index}`;
}

function shownPreview(entry: SocketTraceEntry, index: number): { text: string; expandable: boolean; expanded: boolean; hiddenLines: number } {
  const formatted = formatTracePreview(entry.preview);
  const expanded = expandedPreview.value[previewIdentity(entry, index)] === true;
  const folded = foldTracePreview(formatted, expanded);
  return {
    text: folded.text,
    expandable: formatted.split('\n').length > PREVIEW_FOLDED_LINES,
    expanded,
    hiddenLines: folded.hiddenLines,
  };
}

function togglePreview(entry: SocketTraceEntry, index: number): void {
  const key = previewIdentity(entry, index);
  expandedPreview.value = { ...expandedPreview.value, [key]: expandedPreview.value[key] !== true };
}

function clientSearchText(row: SocketClientSummary): string {
  return [row.lastSession, row.address, row.socketId, transportLabel(row.transport), eventLabel(row.socketId, row.lastEvent), healthReason(row)]
    .join(' ')
    .toLowerCase();
}

function healthTextClass(row: SocketClientSummary, column: string): string {
  if (column !== 'health') {
    return '';
  }
  const tone = healthTone(row);
  return tone ? `health-${tone}` : '';
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
      <div class="connections-toolbar">
        <q-input
          v-model="clientQuery"
          class="log-search"
          dense
          outlined
          hide-bottom-space
          clearable
          placeholder="Sessão, IP ou evento"
          aria-label="Buscar coletor"
        />
        <span v-if="clientFilterActive" class="log-count">{{ visibleClients.length }} de {{ clients.length }}</span>
      </div>
      <q-table
        class="connections-table"
        flat
        bordered
        dense
        hide-pagination
        :rows="visibleClients"
        :columns="columns"
        row-key="socketId"
        :pagination="{ rowsPerPage: 0 }"
        :no-data-label="tableEmptyLabel"
      >
        <template #body="props">
          <q-tr
            :props="props"
            :class="rowClass(props.row)"
            :title="healthReason(props.row) || undefined"
            @click="openDetail(props.row.socketId)"
          >
            <q-td v-for="col in props.cols" :key="col.name" :props="props" :class="{ 'health-cell': col.name === 'health' }">
              <span :class="healthTextClass(props.row, col.name)" :title="col.name === 'socketId' ? props.row.socketId : undefined">{{ col.value }}</span>
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

    <q-dialog v-model="detailOpen" @show="followTrace">
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
        <div class="trace-tools">
          <div class="trace-section-head">
            <h3>Mensagens</h3>
            <p v-if="store.detail">{{ traceCaption }}</p>
          </div>
          <div class="trace-filters">
            <q-btn dense no-caps unelevated :outline="directionFilter !== 'in'" color="primary" label="Recebido" @click="toggleDirection('in')" />
            <q-btn dense no-caps unelevated :outline="directionFilter !== 'out'" color="primary" label="Enviado" @click="toggleDirection('out')" />
            <q-btn dense no-caps unelevated :outline="!onlyErrors" color="primary" label="Erro" @click="toggleErrors()" />
            <q-btn dense no-caps unelevated :outline="!onlySlow" color="primary" label="Lento" @click="toggleSlow()" />
            <q-input
              v-model="eventQuery"
              class="trace-event-search"
              dense
              outlined
              hide-bottom-space
              clearable
              placeholder="Evento ou texto"
              aria-label="Filtrar por evento ou texto"
            />
          </div>
        </div>
        <div class="trace-scroll">
          <div ref="traceBody" class="trace-dialog-body" @scroll="onTraceScroll">
            <p v-if="store.detailMessage" class="trace-empty">{{ store.detailMessage }}</p>
            <p v-else-if="!store.detail" class="trace-empty">Carregando a trilha.</p>
            <p v-else-if="trace.length === 0" class="trace-empty">Nenhuma mensagem deste cliente.</p>
            <p v-else-if="visibleTrace.length === 0" class="trace-empty">Nenhuma mensagem com esse filtro.</p>
            <ul v-else class="trace-list">
              <li v-for="(entry, index) in visibleTrace" :key="`${entry.at}-${entry.direction}-${index}`" class="trace-entry" :class="entry.direction">
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
                  <q-btn flat round dense icon="content_copy" aria-label="Copiar mensagem" @click="copyTraceEntry(entry)" />
                </div>
                <pre v-if="entry.preview" class="trace-preview">{{ shownPreview(entry, index).text }}</pre>
                <button
                  v-if="entry.preview && shownPreview(entry, index).expandable"
                  type="button"
                  class="trace-fold"
                  @click="togglePreview(entry, index)"
                >
                  {{ shownPreview(entry, index).expanded ? 'Recolher' : `Expandir (+${shownPreview(entry, index).hiddenLines} linhas)` }}
                </button>
              </li>
            </ul>
          </div>
          <button v-if="unseenTail" type="button" class="trace-jump" @click="resumeTail">Novas mensagens</button>
        </div>
      </q-card>
    </q-dialog>
  </PageFrame>
</template>
