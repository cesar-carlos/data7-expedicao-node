/** Matches the in-memory ring in the socket monitor. */
export const TRACE_HISTORY_LIMIT = 50;
/** Matches PREVIEW_CHARS for the client open in the monitor. */
export const WATCHED_PREVIEW_KB = 16;
export const PREVIEW_FOLDED_LINES = 8;

export interface TraceFilter {
  direction: 'all' | 'in' | 'out';
  errors: boolean;
  slow: boolean;
  query: string;
}

export function formatTracePreview(preview: string): string {
  const text = preview.trim();
  if (!text.startsWith('{') && !text.startsWith('[')) {
    return preview;
  }
  try {
    return JSON.stringify(JSON.parse(text) as unknown, null, 2);
  } catch {
    return preview;
  }
}

export function matchesTraceFilter(
  entry: { direction: 'in' | 'out'; event: string; error: boolean; slow: boolean; preview?: string },
  filter: TraceFilter,
): boolean {
  if (filter.direction !== 'all' && entry.direction !== filter.direction) {
    return false;
  }
  if (filter.errors && !entry.error) {
    return false;
  }
  if (filter.slow && !entry.slow) {
    return false;
  }
  const query = filter.query.trim().toLowerCase();
  if (!query) {
    return true;
  }
  const haystack = `${entry.event}\n${entry.preview ?? ''}`.toLowerCase();
  return haystack.includes(query);
}

export function foldTracePreview(text: string, expanded: boolean): { text: string; hiddenLines: number } {
  const lines = text.split('\n');
  const extra = lines.length - PREVIEW_FOLDED_LINES;
  if (expanded || extra <= 0) {
    return { text, hiddenLines: 0 };
  }
  return { text: lines.slice(0, PREVIEW_FOLDED_LINES).join('\n'), hiddenLines: extra };
}

export function traceClipboardText(input: { direction: string; event: string; at: string; preview: string }): string {
  const head = [input.direction, input.event, input.at].filter((part) => part.length > 0).join(' · ');
  const body = formatTracePreview(input.preview).trim();
  return body ? `${head}\n${body}` : head;
}

export function traceTailKey(entries: Array<{ at: string; direction: string; event: string; preview: string }>): string {
  const last = entries[entries.length - 1];
  if (!last) {
    return '';
  }
  return `${entries.length}:${last.at}:${last.direction}:${last.event}:${last.preview.length}`;
}
