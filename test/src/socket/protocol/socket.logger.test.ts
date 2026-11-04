import { afterEach, describe, expect, it } from 'vitest';

import { formatSocketLogLine, getSlowEventThresholdMs } from '../../../../src/socket/protocol/socket.logger';

describe('socket logger', () => {
  const previous = process.env.SOCKET_SLOW_EVENT_MS;

  afterEach(() => {
    if (previous === undefined) {
      delete process.env.SOCKET_SLOW_EVENT_MS;
    } else {
      process.env.SOCKET_SLOW_EVENT_MS = previous;
    }
  });

  it('should warn only after two seconds unless configured', () => {
    delete process.env.SOCKET_SLOW_EVENT_MS;
    expect(getSlowEventThresholdMs()).toBe(2000);

    process.env.SOCKET_SLOW_EVENT_MS = '250';
    expect(getSlowEventThresholdMs()).toBe(250);
  });

  it('should write a slow event as a single line', () => {
    const line = formatSocketLogLine('Slow socket event', {
      event: 'separar.item.consulta',
      durationMs: 27000,
      rows: 40,
      listenRows: 2,
      status: 'ok',
    });

    expect(line).toBe(
      '[socket] Slow socket event event=separar.item.consulta durationMs=27000 rows=40 listenRows=2 status=ok',
    );
    expect(line.includes('\n')).toBe(false);
  });
});
