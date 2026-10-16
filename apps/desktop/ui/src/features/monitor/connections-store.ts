import type { SocketClientDetail, SocketMonitorSnapshot, SocketMonitorView } from '@shared/ipc-contract';
import { defineStore } from 'pinia';

import { desktop } from '../../shared/ipc/client';

interface TrafficTotals {
  at: number;
  inbound: number;
  outbound: number;
  bytesIn: number;
  bytesOut: number;
}

const emptyRates = () => ({
  eventsPerSec: 0,
  bytesInPerSec: 0,
  bytesOutPerSec: 0,
});

export const useConnectionsStore = defineStore('connections', {
  state: () => ({
    available: false,
    message: 'Aguardando o serviço.',
    snapshot: null as SocketMonitorSnapshot | null,
    selectedId: '',
    detail: null as SocketClientDetail | null,
    detailMessage: '',
    rates: emptyRates(),
    previous: null as TrafficTotals | null,
  }),
  actions: {
    async refresh(): Promise<void> {
      const api = desktop();
      if (!api) {
        this.available = false;
        this.message = 'O monitor abre no aplicativo desktop, com o serviço no ar.';
        this.snapshot = null;
        this.detail = null;
        this.rates = emptyRates();
        this.previous = null;
        return;
      }

      const view = await api.getSocketSnapshot();
      this.applySnapshot(view);
      if (!this.available || !this.snapshot) {
        this.detail = null;
        this.detailMessage = '';
        return;
      }

      if (this.selectedId && !this.snapshot.clients.some((client) => client.socketId === this.selectedId)) {
        this.selectedId = '';
        this.detail = null;
        this.detailMessage = 'Este cliente saiu.';
        return;
      }

      if (!this.selectedId) {
        this.detail = null;
        this.detailMessage = '';
        return;
      }

      const detail = await api.getSocketDetail(this.selectedId);
      if (!detail.available) {
        this.detail = null;
        this.detailMessage = detail.message;
        return;
      }
      if (!detail.client) {
        this.selectedId = '';
        this.detail = null;
        this.detailMessage = detail.message;
        return;
      }
      this.detail = detail.client;
      this.detailMessage = '';
    },
    applySnapshot(view: SocketMonitorView): void {
      this.available = view.available;
      this.message = view.message;
      this.snapshot = view.snapshot;
      if (!view.snapshot) {
        this.rates = emptyRates();
        this.previous = null;
        return;
      }

      const totals = trafficTotals(view.snapshot);
      const previous = this.previous;
      if (previous) {
        const elapsedSec = (totals.at - previous.at) / 1000;
        this.rates = {
          eventsPerSec: perSecond(totals.inbound + totals.outbound, previous.inbound + previous.outbound, elapsedSec),
          bytesInPerSec: perSecond(totals.bytesIn, previous.bytesIn, elapsedSec),
          bytesOutPerSec: perSecond(totals.bytesOut, previous.bytesOut, elapsedSec),
        };
      } else {
        this.rates = emptyRates();
      }
      this.previous = totals;
    },
  },
});

function trafficTotals(snapshot: SocketMonitorSnapshot): TrafficTotals {
  return snapshot.clients.reduce<TrafficTotals>(
    (totals, client) => ({
      at: Date.parse(snapshot.now) || Date.now(),
      inbound: totals.inbound + client.inCount,
      outbound: totals.outbound + client.outCount,
      bytesIn: totals.bytesIn + client.bytesIn,
      bytesOut: totals.bytesOut + client.bytesOut,
    }),
    { at: Date.parse(snapshot.now) || Date.now(), inbound: 0, outbound: 0, bytesIn: 0, bytesOut: 0 },
  );
}

function perSecond(current: number, previous: number, elapsedSec: number): number {
  if (!Number.isFinite(elapsedSec) || elapsedSec <= 0) {
    return 0;
  }
  return Math.max(0, (current - previous) / elapsedSec);
}
