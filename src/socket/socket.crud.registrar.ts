import { Server as SocketIOServer, Socket } from 'socket.io';
import { OrderBy, Pagination, Params } from '../contracts/local.base.params';
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
  execute: (items: TMutation[]) => Promise<void>;
  loadListen?: (items: TMutation[]) => Promise<TListen[]>;
  loadListenBeforeExecute?: boolean;
  responseMap: (item: TMutation) => Record<string, unknown>;
  listenChannel?: string;
  listenPayload?: (items: TListen[]) => Record<string, unknown>;
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
        },
        async ({ request, emitMutation, emitListen }) => {
          if (request.mutation.length === 0) {
            if (options.allowEmptyMutation === true) {
              emitMutation([]);
              return;
            }
            throw new Error(`Invalid mutation payload for ${options.eventSuffix}: expected at least one item`);
          }

          const items = options.convert(request.mutation);
          const listenBefore = options.loadListenBeforeExecute && options.loadListen
            ? await options.loadListen(items)
            : undefined;

          await options.beforeExecute?.(items);
          await options.execute(items);

          const listenItems = listenBefore ?? (options.loadListen ? await options.loadListen(items) : undefined);

          emitMutation(items.map((item) => options.responseMap(item)));

          if (options.listenChannel && listenItems) {
            if (!options.listenPayload) {
              throw new Error(`listenPayload is required when listenChannel is configured for ${options.eventSuffix}`);
            }

            emitListen(this.io, options.listenChannel, options.listenPayload(listenItems));
          }
        },
      );
    });
  }
}
