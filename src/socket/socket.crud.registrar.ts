import { Server as SocketIOServer, Socket } from 'socket.io';
import { OrderBy, Pagination, Params } from '../contracts/local.base.params';
import { SocketClientError } from '../utils/repository.error';
import type { NormalizedSocketRequest } from './protocol/normalized.socket.request';
import SocketErrorCode from './protocol/socket.error.code';
import { withSocketRequest } from './socket.event.helpers';

type QueryHandlerOptions<TData> = {
  eventSuffix: string;
  defaultWhere?: Params[];
  execute: (params: Params[], pagination?: Pagination, orderBy?: OrderBy) => Promise<TData[] | TData>;
  map: (item: TData) => Record<string, unknown>;
};

type MutationHandlerOptions<TMutation, TListen = TMutation> = {
  eventSuffix: string;
  convert: (mutation: unknown[] | unknown) => TMutation[];
  beforeExecute?: (items: TMutation[]) => Promise<void>;
  execute: (items: TMutation[]) => Promise<void | TMutation[]>;
  loadListen?: (items: TMutation[]) => Promise<TListen[]>;
  loadListenBeforeExecute?: boolean;
  responseMap: (item: TMutation) => Record<string, unknown>;
  listenChannel?: string;
  listenPayload?: (items: TListen[], request: NormalizedSocketRequest) => Record<string, unknown>;
  /**
   * Quando true, envelope sem `Mutation` (normalizado para `[]`) responde `Mutation: []` sem chamar execute/listen.
   * Repositórios já tratam listas vazias como no-op em insert/update/delete.
   */
  allowEmptyMutation?: boolean;
};

export default class SocketCrudRegistrar {
  constructor(
    private readonly io: SocketIOServer,
    private readonly socket: Socket,
  ) {}

  public query<TData>(options: QueryHandlerOptions<TData>): void {
    const eventName = `${this.socket.id} ${options.eventSuffix}`;
    this.socket.on(eventName, async (data) => {
      await withSocketRequest(
        this.socket,
        data,
        {
          defaultResponseIn: eventName,
          defaultWhere: options.defaultWhere,
          eventName: options.eventSuffix,
          kind: 'query',
        },
        async ({ request, emitQuery }) => {
          const result = await options.execute(request.where as Params[], request.pagination, request.orderBy);
          const normalized = Array.isArray(result) ? result : [result];
          emitQuery(normalized.map((item) => options.map(item)));
        },
      );
    });
  }

  public mutation<TMutation, TListen = TMutation>(options: MutationHandlerOptions<TMutation, TListen>): void {
    const eventName = `${this.socket.id} ${options.eventSuffix}`;
    this.socket.on(eventName, async (data) => {
      await withSocketRequest(
        this.socket,
        data,
        {
          defaultResponseIn: eventName,
          eventName: options.eventSuffix,
          kind: 'mutation',
        },
        async ({ request, emitMutation, emitListen }) => {
          if (request.mutation.length === 0) {
            if (options.allowEmptyMutation === true) {
              emitMutation([]);
              return;
            }
            throw new SocketClientError(
              `Invalid mutation payload for ${options.eventSuffix}: expected at least one item`,
              SocketErrorCode.INVALID_PAYLOAD,
            );
          }

          const items = options.convert(request.mutation);
          const listenBefore = options.loadListenBeforeExecute && options.loadListen
            ? await options.loadListen(items)
            : undefined;

          await options.beforeExecute?.(items);
          const executed = await options.execute(items);
          const persisted = Array.isArray(executed) ? executed : items;

          const listenItems = listenBefore
            ?? (options.loadListen ? await options.loadListen(persisted) : (persisted as unknown as TListen[]));

          emitMutation(persisted.map((item) => options.responseMap(item)));

          if (options.listenChannel) {
            if (!options.listenPayload) {
              throw new Error(`listenPayload is required when listenChannel is configured for ${options.eventSuffix}`);
            }

            emitListen(this.io, options.listenChannel, options.listenPayload(listenItems, request));
          }
        },
      );
    });
  }
}
