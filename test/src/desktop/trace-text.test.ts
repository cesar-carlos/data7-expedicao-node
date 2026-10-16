import { describe, expect, it } from 'vitest';

import {
  foldTracePreview,
  formatTracePreview,
  matchesTraceFilter,
  traceClipboardText,
  traceTailKey,
} from '../../../apps/desktop/ui/src/features/monitor/trace-text';

describe('trace text', () => {
  it('indents a complete JSON payload and leaves a cut payload on one piece', () => {
    expect(formatTracePreview('{"Item":"A","Qtde":1}')).toBe('{\n  "Item": "A",\n  "Qtde": 1\n}');
    expect(formatTracePreview('{"Item":"A"')).toBe('{"Item":"A"');
    expect(formatTracePreview('texto livre')).toBe('texto livre');
  });

  it('filters by direction, error, slow flag and event name', () => {
    const received = { direction: 'in' as const, event: 'separacao.item.consulta', error: false, slow: true };
    const sent = { direction: 'out' as const, event: 'separacao.item.retorno', error: true, slow: false };

    expect(matchesTraceFilter(received, { direction: 'in', errors: false, slow: false, query: '' })).toBe(true);
    expect(matchesTraceFilter(sent, { direction: 'in', errors: false, slow: false, query: '' })).toBe(false);
    expect(matchesTraceFilter(received, { direction: 'all', errors: false, slow: true, query: 'item' })).toBe(true);
    expect(matchesTraceFilter(received, { direction: 'all', errors: true, slow: false, query: '' })).toBe(false);
    expect(matchesTraceFilter(sent, { direction: 'all', errors: true, slow: false, query: 'retorno' })).toBe(true);
    expect(
      matchesTraceFilter(
        { ...received, preview: '{"CodigoProduto":"2876"}' },
        { direction: 'all', errors: false, slow: false, query: '2876' },
      ),
    ).toBe(true);
    expect(
      matchesTraceFilter(received, { direction: 'all', errors: false, slow: false, query: '2876' }),
    ).toBe(false);
  });

  it('folds a long payload and keeps a short one intact', () => {
    const lines = Array.from({ length: 10 }, (_item, index) => `linha ${index + 1}`).join('\n');
    expect(foldTracePreview(lines, false)).toEqual({
      text: Array.from({ length: 8 }, (_item, index) => `linha ${index + 1}`).join('\n'),
      hiddenLines: 2,
    });
    expect(foldTracePreview(lines, true)).toEqual({ text: lines, hiddenLines: 0 });
    expect(foldTracePreview('só uma linha', false)).toEqual({ text: 'só uma linha', hiddenLines: 0 });
  });

  it('copies the direction, event, time and formatted text', () => {
    expect(
      traceClipboardText({
        direction: 'Recebido',
        event: 'separacao.item.consulta',
        at: '10:59:30',
        preview: '{"Ok":true}',
      }),
    ).toBe('Recebido · separacao.item.consulta · 10:59:30\n{\n  "Ok": true\n}');
  });

  it('changes the tail key when a new message arrives', () => {
    const first = [{ at: '2026-10-16T10:00:00.000Z', direction: 'in', event: 'a', preview: '{}' }];
    const second = [...first, { at: '2026-10-16T10:00:01.000Z', direction: 'out', event: 'b', preview: '{}' }];
    expect(traceTailKey(first)).not.toBe(traceTailKey(second));
    expect(traceTailKey([])).toBe('');
  });
});
