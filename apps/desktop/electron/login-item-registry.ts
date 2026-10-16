export const RUN_KEY = 'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run';
export const VALUE_NAME = 'Data7 Expedicao';

export type RunValueState = 'absent' | 'present' | 'denied';
export type LoginItemAction = 'none' | 'delete' | 'add';
export type RegistryFailure = 'not-found' | 'denied' | 'other';

export function loginItemAction(
  startWithWindows: boolean,
  state: RunValueState,
  currentData: string | undefined,
  desired: string,
): LoginItemAction {
  if (!startWithWindows) {
    return state === 'present' ? 'delete' : 'none';
  }
  if (state === 'present' && (currentData ?? '').trim() === desired.trim()) {
    return 'none';
  }
  return 'add';
}

export function registryFailure(text: string): RegistryFailure {
  if (/unable to find|não pôde localizar|não foi possível encontrar|não conseguiu localizar|não foi encontrado/i.test(text)) {
    return 'not-found';
  }
  if (/access is denied|acesso negado/i.test(text)) {
    return 'denied';
  }
  return 'other';
}

export function parseRegQueryData(stdout: string, valueName: string): string | undefined {
  for (const line of stdout.split(/\r?\n/)) {
    const match = /^\s+(.+?)\s+REG_\w+\s*(.*)$/.exec(line);
    if (match?.[1] === valueName) {
      return match[2].trim();
    }
  }
  return undefined;
}
