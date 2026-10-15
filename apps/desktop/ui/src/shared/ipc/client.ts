import type { DesktopApi } from '@shared/ipc-contract';

export function desktop(): DesktopApi | null {
  return window.desktop ?? null;
}

export function ipcError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/^Error invoking remote method '[^']+': /, '');
}
