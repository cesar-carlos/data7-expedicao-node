import { Server as SocketIOServer, Socket } from 'socket.io';
import { Params } from '../../contracts/local.base.params';

import ItemArmazenarRepository from './item.armazenar.repository';
import ExpedicaoMutationBasicEvent from '../../model/expedicao.basic.mutation.event';
import ExpedicaoItemArmazenarDto from '../../dto/expedicao/expedicao.item.armazenar.dto';
import {
  convertSocketMutationPayload,
  normalizeExpedicaoItemSequenceKey,
  withSocketRequest,
} from '../socket.event.helpers';

export default class ItemArmazenarEvent {
  private repository = new ItemArmazenarRepository();

  constructor(io: SocketIOServer, socket: Socket) {
    const client = socket.id;

    socket.on(`${client} armazenar.item.consulta`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} armazenar.item.consulta`,
        eventName: 'armazenar.item.consulta',
        kind: 'query',
      }, async ({ request, emitQuery }) => {
        const result = await this.repository.consulta(request.where as Params[], request.pagination, request.orderBy);
        emitQuery(result.map((item) => item.toJson()));
      });
    });

    socket.on(`${client} armazenar.item.select`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} armazenar.item.select`,
        eventName: 'armazenar.item.select',
        kind: 'query',
      }, async ({ request, emitQuery }) => {
        const result = await this.repository.select(request.where as Params[], request.pagination, request.orderBy);
        emitQuery(result.map((item) => item.toJson()));
      });
    });

    socket.on(`${client} armazenar.item.insert`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} armazenar.item.insert`,
        eventName: 'armazenar.item.insert',
        kind: 'mutation',
      }, async ({ request, emitMutation, emitListen }) => {
        const itens = this.convert(request.mutation);
        if (itens.length === 0) {
          emitMutation([]);
          return;
        }
        const inserteds = await this.repository.insert(itens);

        const basicEvent = new ExpedicaoMutationBasicEvent({
          Session: request.session,
          ResponseIn: request.responseIn,
          Mutation: inserteds.map((item) => item.toJson()),
        });

        emitMutation(inserteds.map((item) => item.toJson()));
        emitListen(io, 'armazenar.item.insert.listen', basicEvent.toJson());
      });
    });

    socket.on(`${client} armazenar.item.update`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} armazenar.item.update`,
        eventName: 'armazenar.item.update',
        kind: 'mutation',
      }, async ({ request, emitMutation, emitListen }) => {
        const itens = this.convert(request.mutation);
        if (itens.length === 0) {
          emitMutation([]);
          return;
        }
        await this.repository.update(itens);

        const basicEvent = new ExpedicaoMutationBasicEvent({
          Session: request.session,
          ResponseIn: request.responseIn,
          Mutation: itens.map((item) => item.toJson()),
        });

        emitMutation(itens.map((item) => item.toJson()));
        emitListen(io, 'armazenar.item.update.listen', basicEvent.toJson());
      });
    });

    socket.on(`${client} armazenar.item.delete`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} armazenar.item.delete`,
        eventName: 'armazenar.item.delete',
        kind: 'mutation',
      }, async ({ request, emitMutation, emitListen }) => {
        const itens = this.convert(request.mutation);
        if (itens.length === 0) {
          emitMutation([]);
          return;
        }
        await this.repository.delete(itens);

        const basicEvent = new ExpedicaoMutationBasicEvent({
          Session: request.session,
          ResponseIn: request.responseIn,
          Mutation: itens.map((item) => item.toJson()),
        });

        emitMutation(itens.map((item) => item.toJson()));
        emitListen(io, 'armazenar.item.delete.listen', basicEvent.toJson());
      });
    });
  }

  private convert(mutations: any[] | any): ExpedicaoItemArmazenarDto[] {
    return convertSocketMutationPayload(
      mutations,
      (mutation) =>
        ExpedicaoItemArmazenarDto.fromObject({
          ...mutation,
          Item: normalizeExpedicaoItemSequenceKey(mutation.Item),
        }),
      { eventName: 'armazenar.item.mutation', allowEmpty: true },
    );
  }
}
