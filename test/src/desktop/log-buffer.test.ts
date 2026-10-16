import { describe, expect, it } from 'vitest';

import { splitStoredErrorLine } from '../../../apps/desktop/electron/log-buffer';

describe('stored error lines', () => {
  it('moves the saved instant out of the text', () => {
    const stored = splitStoredErrorLine('2026-10-16T12:04:05.123Z a porta recusou');

    expect(stored.at).toBe('2026-10-16T12:04:05.123Z');
    expect(stored.text).toBe('a porta recusou');
  });

  it('keeps a line that has no instant', () => {
    expect(splitStoredErrorLine('falha sem hora')).toEqual({ at: '', text: 'falha sem hora' });
  });
});
