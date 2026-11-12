import { AsyncLocalStorage } from 'async_hooks';
import type { Socket } from 'socket.io';

type CancellableSqlRequest = {
  cancel: () => void;
};

type TrackableSqlRequest = CancellableSqlRequest & {
  once?: (event: string, listener: (...args: unknown[]) => void) => void;
};

type SqlRequestScope = {
  cancelled: boolean;
  requests: Set<CancellableSqlRequest>;
};

const sqlScopeAls = new AsyncLocalStorage<SqlRequestScope>();
const scopesBySocket = new WeakMap<Socket, Set<SqlRequestScope>>();

export function enterSocketSqlScope(socket: Socket): SqlRequestScope {
  const scope: SqlRequestScope = { cancelled: false, requests: new Set() };
  let scopes = scopesBySocket.get(socket);
  if (!scopes) {
    scopes = new Set();
    scopesBySocket.set(socket, scopes);
  }
  scopes.add(scope);
  return scope;
}

export function leaveSocketSqlScope(socket: Socket, scope: SqlRequestScope): void {
  scopesBySocket.get(socket)?.delete(scope);
}

export async function runWithSqlScope<T>(scope: SqlRequestScope, fn: () => Promise<T>): Promise<T> {
  return sqlScopeAls.run(scope, fn);
}

export function trackSqlRequest(request: CancellableSqlRequest): void {
  const scope = sqlScopeAls.getStore();
  if (!scope) return;
  if (scope.cancelled) {
    try {
      request.cancel();
    } catch {
      // The driver may already have finished the request.
    }
    return;
  }
  scope.requests.add(request);
  attachUntrack(request, () => {
    scope.requests.delete(request);
  });
}

export function cancelSocketSqlRequests(socket: Socket): void {
  const scopes = scopesBySocket.get(socket);
  if (!scopes || scopes.size === 0) return;

  for (const scope of scopes) {
    scope.cancelled = true;
    for (const request of scope.requests) {
      try {
        request.cancel();
      } catch {
        // Best-effort: a finished request can throw on cancel.
      }
    }
    scope.requests.clear();
  }
  scopes.clear();
}

function attachUntrack(request: CancellableSqlRequest, untrack: () => void): void {
  const emitter = request as TrackableSqlRequest;
  if (typeof emitter.once !== 'function') {
    return;
  }
  emitter.once('done', untrack);
  emitter.once('error', untrack);
}
