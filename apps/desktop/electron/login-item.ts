import { execFile } from 'child_process';

import { app } from 'electron';

import {
  RUN_KEY,
  VALUE_NAME,
  loginItemAction,
  parseRegQueryData,
  registryFailure,
  textFromRegistryBytes,
  type RunValueState,
} from './login-item-registry';

const ADMIN_REQUIRED = 'O início com o Windows para todos os usuários precisa de administrador.';

type RegOutcome =
  | { ok: true; stdout: string }
  | { ok: false; kind: ReturnType<typeof registryFailure>; error: Error };

function asBytes(chunk: string | Buffer | undefined): Uint8Array {
  if (!chunk) {
    return new Uint8Array();
  }
  return typeof chunk === 'string' ? Buffer.from(chunk) : chunk;
}

function runReg(args: string[]): Promise<RegOutcome> {
  return new Promise((resolve) => {
    execFile('reg.exe', args, { windowsHide: true, encoding: 'buffer' }, (error, stdout, stderr) => {
      const stdoutText = textFromRegistryBytes(asBytes(stdout));
      const stderrText = textFromRegistryBytes(asBytes(stderr));
      if (!error) {
        resolve({ ok: true, stdout: stdoutText });
        return;
      }
      const failure = error instanceof Error ? error : new Error(String(error));
      const kind = registryFailure(`${stderrText}\n${stdoutText}`);
      resolve({ ok: false, kind, error: failure });
    });
  });
}

async function readRunValue(): Promise<{ state: RunValueState; data?: string }> {
  const queried = await runReg(['query', RUN_KEY, '/v', VALUE_NAME]);
  if (queried.ok) {
    return { state: 'present', data: parseRegQueryData(queried.stdout, VALUE_NAME) };
  }
  if (queried.kind === 'not-found') {
    return { state: 'absent' };
  }
  if (queried.kind === 'denied') {
    return { state: 'denied' };
  }
  throw queried.error;
}

async function requireRegistryWrite(outcome: RegOutcome): Promise<void> {
  if (outcome.ok || outcome.kind === 'not-found') {
    return;
  }
  if (outcome.kind === 'denied') {
    throw new Error(ADMIN_REQUIRED);
  }
  throw outcome.error;
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

  const desired = `"${process.execPath}" --hidden`;
  const current = await readRunValue();
  const action = loginItemAction(startWithWindows, current.state, current.data, desired);
  if (action === 'none') {
    return;
  }
  if (action === 'delete') {
    await requireRegistryWrite(await runReg(['delete', RUN_KEY, '/v', VALUE_NAME, '/f']));
    return;
  }
  await requireRegistryWrite(await runReg(['add', RUN_KEY, '/v', VALUE_NAME, '/t', 'REG_SZ', '/d', desired, '/f']));
}
