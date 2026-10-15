import { execFile } from 'child_process';

import { app } from 'electron';

const RUN_KEY = 'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run';
const VALUE_NAME = 'Data7 Expedicao';

function runReg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    execFile('reg.exe', args, { windowsHide: true }, (error, _stdout, stderr) => {
      if (!error) {
        resolve();
        return;
      }
      const text = `${stderr ?? ''} ${error.message}`;
      if (args[0] === 'delete' && /unable to find|não pôde localizar|não foi possível encontrar/i.test(text)) {
        resolve();
        return;
      }
      reject(error);
    });
  });
}

/** Início automático de todos os usuários. A chave HKCU antiga é removida. */
export async function applyLoginItem(startWithWindows: boolean): Promise<void> {
  if (!app.isPackaged || process.platform !== 'win32') {
    return;
  }

  app.setLoginItemSettings({
    openAtLogin: false,
    path: process.execPath,
    args: ['--hidden'],
  });

  if (!startWithWindows) {
    await runReg(['delete', RUN_KEY, '/v', VALUE_NAME, '/f']);
    return;
  }

  const command = `"${process.execPath}" --hidden`;
  await runReg(['add', RUN_KEY, '/v', VALUE_NAME, '/t', 'REG_SZ', '/d', command, '/f']);
}
