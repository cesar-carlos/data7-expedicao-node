import { describe, expect, it } from 'vitest';

import {
  loginItemAction,
  parseRegQueryData,
  registryFailure,
  textFromRegistryBytes,
} from '../../../apps/desktop/electron/login-item-registry';

const desired = '"C:\\Program Files\\Data7 Expedicao\\Data7Expedicao.exe" --hidden';

describe('login item registry', () => {
  it('does not delete the all-users startup value when it is already absent', () => {
    expect(loginItemAction(false, 'absent', undefined, desired)).toBe('none');
    expect(loginItemAction(false, 'denied', undefined, desired)).toBe('none');
  });

  it('deletes the all-users startup value only when it is present and startup is off', () => {
    expect(loginItemAction(false, 'present', desired, desired)).toBe('delete');
  });

  it('skips the registry write when the startup command is already correct', () => {
    expect(loginItemAction(true, 'present', desired, desired)).toBe('none');
  });

  it('writes the startup command when it is missing or different', () => {
    expect(loginItemAction(true, 'absent', undefined, desired)).toBe('add');
    expect(loginItemAction(true, 'present', '"C:\\old.exe" --hidden', desired)).toBe('add');
  });

  it('recognizes a missing value and access denied from reg.exe', () => {
    expect(registryFailure('ERRO: O sistema não conseguiu localizar a chave ou o valor do Registro especificado.')).toBe('not-found');
    expect(registryFailure('ERROR: The system was unable to find the specified registry key or value.')).toBe('not-found');
    expect(registryFailure('ERRO: Acesso negado.')).toBe('denied');
    expect(registryFailure('ERROR: Access is denied.')).toBe('denied');
  });

  it('reads the Portuguese not-found message reg.exe writes in code page 850', () => {
    const bytes = Buffer.from(
      '4552524f3a204f2073697374656d61206ec66f2070936465206c6f63616c697a6172206120636861766520646f20526567697374726f206f752076616c6f722065737065636966696361646f2e0d0a',
      'hex',
    );

    const text = textFromRegistryBytes(bytes);

    expect(text).toContain('não pôde localizar');
    expect(registryFailure(text)).toBe('not-found');
  });

  it('reads the startup command from reg query output', () => {
    const stdout = [
      'HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run',
      `    Data7 Expedicao    REG_SZ    ${desired}`,
      '',
    ].join('\r\n');

    expect(parseRegQueryData(stdout, 'Data7 Expedicao')).toBe(desired);
    expect(parseRegQueryData('chave sem o valor\r\n', 'Data7 Expedicao')).toBeUndefined();
  });
});
