import { describe, expect, it, vi } from 'vitest';
import type { Socket } from 'socket.io';
import { EventEmitter } from 'events';

import {
  cancelSocketSqlRequests,
  enterSocketSqlScope,
  leaveSocketSqlScope,
  runWithSqlScope,
  trackSqlRequest,
} from '../../../src/infra/sql.request.scope';

describe('sql.request.scope', () => {
  it.each([false, true])('should cancel a late request in a disconnected scope (cancel throws: %s)', async (throws) => {
    const socket = {} as Socket;
    const scope = enterSocketSqlScope(socket);
    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    const cancel = vi.fn(() => { if (throws) throw new Error('already finished'); });
    const pending = runWithSqlScope(scope, async () => {
      await gate;
      trackSqlRequest({ cancel });
    });
    cancelSocketSqlRequests(socket);
    release();
    await expect(pending).resolves.toBeUndefined();
    expect(cancel).toHaveBeenCalledTimes(1);
    cancelSocketSqlRequests(socket);
    expect(cancel).toHaveBeenCalledTimes(1);
    leaveSocketSqlScope(socket, scope);
  });

  it('should continue cancelling other requests and scopes when a cancel throws', async () => {
    const socket = {} as Socket;
    const first = enterSocketSqlScope(socket);
    const second = enterSocketSqlScope(socket);
    const broken = vi.fn(() => { throw new Error('already completed'); });
    const sameScope = vi.fn();
    const otherScope = vi.fn();
    await runWithSqlScope(first, async () => {
      trackSqlRequest({ cancel: broken });
      trackSqlRequest({ cancel: sameScope });
    });
    await runWithSqlScope(second, async () => trackSqlRequest({ cancel: otherScope }));
    expect(() => cancelSocketSqlRequests(socket)).not.toThrow();
    cancelSocketSqlRequests(socket);
    for (const cancel of [broken, sameScope, otherScope]) expect(cancel).toHaveBeenCalledTimes(1);
    leaveSocketSqlScope(socket, first);
    leaveSocketSqlScope(socket, second);
  });

  it('should isolate concurrent asynchronous scopes belonging to different sockets', async () => {
    const a = {} as Socket;
    const b = {} as Socket;
    const scopeA = enterSocketSqlScope(a);
    const scopeB = enterSocketSqlScope(b);
    const cancelA = vi.fn();
    const cancelB = vi.fn();
    await Promise.all([
      runWithSqlScope(scopeA, async () => { await Promise.resolve(); trackSqlRequest({ cancel: cancelA }); }),
      runWithSqlScope(scopeB, async () => { await Promise.resolve(); trackSqlRequest({ cancel: cancelB }); }),
    ]);
    cancelSocketSqlRequests(a);
    expect(cancelA).toHaveBeenCalledTimes(1);
    expect(cancelB).not.toHaveBeenCalled();
    cancelSocketSqlRequests(b);
    expect(cancelB).toHaveBeenCalledTimes(1);
    expect(cancelA).toHaveBeenCalledTimes(1);
    leaveSocketSqlScope(a, scopeA);
    leaveSocketSqlScope(b, scopeB);
  });

  it.each(['done', 'error'])('should release a request after its %s event', async (event) => {
    const socket = {} as Socket;
    const scope = enterSocketSqlScope(socket);
    const request = Object.assign(new EventEmitter(), { cancel: vi.fn() });
    await runWithSqlScope(scope, async () => trackSqlRequest(request));
    request.emit(event);
    cancelSocketSqlRequests(socket);
    expect(request.cancel).not.toHaveBeenCalled();
    leaveSocketSqlScope(socket, scope);
  });

  it('should ignore scopes that already left the handler', async () => {
    const socket = {} as Socket;
    const scope = enterSocketSqlScope(socket);
    const cancel = vi.fn();
    await runWithSqlScope(scope, async () => trackSqlRequest({ cancel }));
    leaveSocketSqlScope(socket, scope);
    expect(() => cancelSocketSqlRequests(socket)).not.toThrow();
    expect(cancel).not.toHaveBeenCalled();
  });

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
