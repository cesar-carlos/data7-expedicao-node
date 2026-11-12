import { describe, expect, it, vi } from 'vitest';
import type { Socket } from 'socket.io';

import {
  cancelSocketSqlRequests,
  enterSocketSqlScope,
  leaveSocketSqlScope,
  runWithSqlScope,
  trackSqlRequest,
} from '../../../src/infra/sql.request.scope';

describe('sql.request.scope', () => {
  it('should cancel in-flight requests when the socket disconnects', async () => {
    const socket = {} as Socket;
    const cancel = vi.fn();
    const scope = enterSocketSqlScope(socket);

    await runWithSqlScope(scope, async () => {
      trackSqlRequest({ cancel });
    });

    cancelSocketSqlRequests(socket);
    expect(cancel).toHaveBeenCalledTimes(1);

    leaveSocketSqlScope(socket, scope);
  });

  it('should ignore trackSqlRequest outside a socket scope', () => {
    const cancel = vi.fn();
    trackSqlRequest({ cancel });
    expect(cancel).not.toHaveBeenCalled();
  });

  it('should stop tracking a request after it finishes so disconnect does not cancel it', async () => {
    const socket = {} as Socket;
    const cancel = vi.fn();
    const doneListeners: Array<(...args: unknown[]) => void> = [];
    const scope = enterSocketSqlScope(socket);

    await runWithSqlScope(scope, async () => {
      trackSqlRequest({
        cancel,
        once(event: string, listener: (...args: unknown[]) => void) {
          if (event === 'done') {
            doneListeners.push(listener);
          }
        },
      });
    });

    for (const listener of doneListeners) {
      listener();
    }

    cancelSocketSqlRequests(socket);
    expect(cancel).not.toHaveBeenCalled();
    leaveSocketSqlScope(socket, scope);
  });
});
