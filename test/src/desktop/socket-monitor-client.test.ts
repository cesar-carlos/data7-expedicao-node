import { describe, expect, it } from 'vitest';

import {
  monitorDetailUrl,
  monitorSnapshotUrl,
  readSocketDetail,
  readSocketSnapshot,
} from '../../../apps/desktop/electron/socket-monitor-client';

describe('desktop socket monitor client', () => {
  it('builds localhost urls', () => {
    expect(monitorSnapshotUrl(3001)).toBe('http://127.0.0.1:3001/internal/sockets');
    expect(monitorDetailUrl(3001, 'abc/1')).toBe('http://127.0.0.1:3001/internal/sockets/abc%2F1');
  });

  it('does not call the network when the service is stopped', async () => {
    let called = false;
    const view = await readSocketSnapshot(0, async () => {
      called = true;
      throw new Error('não deveria consultar');
    });

    expect(called).toBe(false);
    expect(view.available).toBe(false);
    expect(view.snapshot).toBeNull();
    expect(view.message).toMatch(/parado/i);
  });

  it('returns an empty view when the port does not respond', async () => {
    const view = await readSocketSnapshot(9, async () => {
      throw new Error('connect ECONNREFUSED');
    });
    const detail = await readSocketDetail(9, 's1', async () => {
      throw new Error('connect ECONNREFUSED');
    });

    expect(view.available).toBe(false);
    expect(view.snapshot).toBeNull();
    expect(detail.client).toBeNull();
  });

  it('rejects a payload that is not the monitor snapshot', async () => {
    const view = await readSocketSnapshot(9, async () => new Response('nope', { status: 200 }));
    expect(view.available).toBe(false);
    expect(view.message).toMatch(/inválida/i);
  });
});
