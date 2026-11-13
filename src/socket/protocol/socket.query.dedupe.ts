import type { Socket } from 'socket.io';

import type { OrderBy, Pagination } from '../../contracts/local.base.params';
import type { NormalizedSocketRequest } from './normalized.socket.request';

const inFlightBySocket = new WeakMap<Socket, Map<string, Promise<unknown>>>();

export function socketQueryDedupeKey(request: Pick<NormalizedSocketRequest, 'eventName' | 'where' | 'pagination' | 'orderBy'>): string {
  return JSON.stringify({
    event: request.eventName,
    where: request.where ?? null,
    pagination: paginationKey(request.pagination),
    orderBy: orderByKey(request.orderBy),
  });
}

export function getSocketQueryInFlight(socket: Socket, key: string): Promise<unknown> | undefined {
  return inFlightBySocket.get(socket)?.get(key);
}

export function setSocketQueryInFlight(socket: Socket, key: string, promise: Promise<unknown>): void {
  let queries = inFlightBySocket.get(socket);
  if (!queries) {
    queries = new Map();
    inFlightBySocket.set(socket, queries);
  }
  queries.set(key, promise);
}

export function clearSocketQueryInFlight(socket: Socket, key: string): void {
  inFlightBySocket.get(socket)?.delete(key);
}

function paginationKey(page: Pagination | undefined): { limit: number; offset: number; page: number } | null {
  if (!page) return null;
  return { limit: page.getLimit(), offset: page.getOffset(), page: page.getPage() };
}

function orderByKey(orderBy: OrderBy | undefined): { orderBy: string; direction: string } | null {
  if (!orderBy) return null;
  return { orderBy: orderBy.getOrderBy(), direction: orderBy.getOrderDirection() };
}
