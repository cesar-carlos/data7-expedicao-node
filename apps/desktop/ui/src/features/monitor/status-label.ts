import type { ServerStatus } from '@shared/ipc-contract';

export const statusLabel: Record<ServerStatus['state'], string> = {
  stopped: 'Parado',
  starting: 'Iniciando',
  running: 'No ar',
  failed: 'Falha',
};
