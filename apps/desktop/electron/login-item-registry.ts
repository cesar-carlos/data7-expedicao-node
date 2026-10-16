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

/** Code page 850, the OEM page reg.exe uses on a Portuguese Windows console. */
const CP850_FROM_80 = [
  0x00c7, 0x00fc, 0x00e9, 0x00e2, 0x00e4, 0x00e0, 0x00e5, 0x00e7, 0x00ea, 0x00eb, 0x00e8, 0x00ef, 0x00ee, 0x00ec, 0x00c4, 0x00c5,
  0x00c9, 0x00e6, 0x00c6, 0x00f4, 0x00f6, 0x00f2, 0x00fb, 0x00f9, 0x00ff, 0x00d6, 0x00dc, 0x00f8, 0x00a3, 0x00d8, 0x00d7, 0x0192,
  0x00e1, 0x00ed, 0x00f3, 0x00fa, 0x00f1, 0x00d1, 0x00aa, 0x00ba, 0x00bf, 0x00ae, 0x00ac, 0x00bd, 0x00bc, 0x00a1, 0x00ab, 0x00bb,
  0x2591, 0x2592, 0x2593, 0x2502, 0x2524, 0x00c1, 0x00c2, 0x00c0, 0x00a9, 0x2563, 0x2551, 0x2557, 0x255d, 0x00a2, 0x00a5, 0x2510,
  0x2514, 0x2534, 0x252c, 0x251c, 0x2500, 0x253c, 0x00e3, 0x00c3, 0x255a, 0x2554, 0x2569, 0x2566, 0x2560, 0x2550, 0x256c, 0x00a4,
  0x00f0, 0x00d0, 0x00ca, 0x00cb, 0x00c8, 0x0131, 0x00cd, 0x00ce, 0x00cf, 0x2518, 0x250c, 0x2588, 0x2584, 0x00a6, 0x00cc, 0x2580,
  0x00d3, 0x00df, 0x00d4, 0x00d2, 0x00f5, 0x00d5, 0x00b5, 0x00fe, 0x00de, 0x00da, 0x00db, 0x00d9, 0x00fd, 0x00dd, 0x00af, 0x00b4,
  0x00ad, 0x00b1, 0x2017, 0x00be, 0x00b6, 0x00a7, 0x00f7, 0x00b8, 0x00b0, 0x00a8, 0x00b7, 0x00b9, 0x00b3, 0x00b2, 0x25a0, 0x00a0,
] as const;

export function decodeOem850(bytes: Uint8Array): string {
  let text = '';
  for (const byte of bytes) {
    text += byte < 0x80 ? String.fromCharCode(byte) : String.fromCharCode(CP850_FROM_80[byte - 0x80] ?? byte);
  }
  return text;
}

/** reg.exe writes the console OEM page. UTF-8 decoding then shows replacement characters. */
export function textFromRegistryBytes(bytes: Uint8Array): string {
  const utf8 = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  if (!utf8.includes('\uFFFD')) {
    return utf8;
  }
  return decodeOem850(bytes);
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
