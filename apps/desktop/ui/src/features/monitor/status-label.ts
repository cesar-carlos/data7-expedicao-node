import type { ServerStatus } from '@shared/ipc-contract';

export const statusLabel: Record<ServerStatus['state'], string> = {
  stopped: 'Parado',
  starting: 'Iniciando',
  running: 'No ar',
  failed: 'Falha',
};

export const statusColor: Record<ServerStatus['state'], string> = {
  stopped: 'grey-7',
  starting: 'warning',
  running: 'positive',
  failed: 'negative',
};
