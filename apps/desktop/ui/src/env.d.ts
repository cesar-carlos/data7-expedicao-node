/// <reference types="vite/client" />

import type { DesktopApi } from '@shared/ipc-contract';

declare global {
  interface Window {
    desktop?: DesktopApi;
  }
}

export {};
