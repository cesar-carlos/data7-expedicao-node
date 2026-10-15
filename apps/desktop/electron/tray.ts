import fs from 'fs';
import path from 'path';

import { Menu, Tray } from 'electron';

import { appIcon } from './icons';

let tray: Tray | null = null;

export function createTray(actions: { open: () => void; restart: () => void; quit: () => void }): Tray {
  tray = new Tray(appIcon());
  tray.setToolTip('Data7 Expedição Servidor');
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: 'Abrir', click: actions.open },
      { label: 'Reiniciar serviço', click: actions.restart },
      { type: 'separator' },
      { label: 'Sair', click: actions.quit },
    ]),
  );
  tray.on('double-click', actions.open);
  return tray;
}

export function notifyStillRunning(userData: string): void {
  if (!tray) {
    return;
  }
  const flag = path.join(userData, 'tray-hint.json');
  if (fs.existsSync(flag)) {
    return;
  }
  fs.mkdirSync(userData, { recursive: true });
  fs.writeFileSync(flag, '{"shown":true}\n', 'utf8');
  tray.displayBalloon({
    title: 'Data7 Expedição Servidor',
    content: 'O servidor continua em execução. No Windows 11 o ícone pode ficar no menu oculto da bandeja.',
  });
}
