import { Server as SocketIOServer, Socket } from 'socket.io';
import { Params } from '../../contracts/local.base.params';

import SepararItemRepository from './separar.item.repository';
import ExpedicaoItemSepararDto from '../../dto/expedicao/expedicao.item.separar.dto';
import ExpedicaoMutationListenEvent from '../../model/expedicao.mutation.listen.event';
import {
  convertSocketMutationPayload,
  normalizeExpedicaoItemSequenceKey,
  withSocketRequest,
} from '../socket.event.helpers';

export default class SepararItemEvent {
  private repository = new SepararItemRepository();

  constructor(io: SocketIOServer, socket: Socket) {
    const client = socket.id;

    socket.on(`${client} separar.item.consulta`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} separar.item.consulta`,
        eventName: 'separar.item.consulta',
        kind: 'query',
      }, async ({ request, emitQuery }) => {
        const result = await this.repository.consulta(request.where as Params[], request.pagination, request.orderBy);
        // Units stay on separar.item.unidade.medida.consulta. Nesting them
        // here inflates the JSON and blocks the socket queue on large lists.
        emitQuery(result.map((item) => item.toJson()));
      });
    });

    socket.on(`${client} separar.item.unidade.medida.consulta`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} separar.item.unidade.medida.consulta`,
        eventName: 'separar.item.unidade.medida.consulta',
        kind: 'query',
      }, async ({ request, emitQuery }) => {
        const result = await this.repository.consultaUnidadeMedida(
          request.where as Params[],
          request.pagination,
          request.orderBy,
        );
        emitQuery(result.map((item) => item.toJson()));
      });
    });

    socket.on(`${client} separar.item.select`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} separar.item.select`,
        eventName: 'separar.item.select',
        kind: 'query',
      }, async ({ request, emitQuery }) => {
        const result = await this.repository.select(request.where as Params[], request.pagination, request.orderBy);
        emitQuery(result.map((item) => item.toJson()));
      });
    });

    socket.on(`${client} separar.item.insert`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} separar.item.insert`,
        eventName: 'separar.item.insert',
        kind: 'mutation',
      }, async ({ request, emitMutation, emitListen }) => {
        const itens = this.convert(request.mutation);
        if (itens.length === 0) {
          emitMutation([]);
          return;
        }
        const inserteds = await this.repository.insert(itens);

        const itensJson = inserteds.map((item) => item.toJson());
        const listenEvent = new ExpedicaoMutationListenEvent({
          Mutation: itensJson,
        });

        emitMutation(itensJson);
        emitListen(io, 'separar.item.insert.listen', listenEvent.toJson());
      });
    });

    socket.on(`${client} separar.item.update`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} separar.item.update`,
        eventName: 'separar.item.update',
        kind: 'mutation',
      }, async ({ request, emitMutation, emitListen }) => {
        const itens = this.convert(request.mutation);
        if (itens.length === 0) {
          emitMutation([]);
          return;
        }
        await this.repository.update(itens);

        const itensJson = itens.map((item) => item.toJson());
        const listenEvent = new ExpedicaoMutationListenEvent({
          Mutation: itensJson,
        });

        emitMutation(itensJson);
        emitListen(io, 'separar.item.update.listen', listenEvent.toJson());
      });
    });

    socket.on(`${client} separar.item.delete`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} separar.item.delete`,
        eventName: 'separar.item.delete',
        kind: 'mutation',
      }, async ({ request, emitMutation, emitListen }) => {
        const itens = this.convert(request.mutation);
        if (itens.length === 0) {
          emitMutation([]);
          return;
        }
        await this.repository.delete(itens);

        const itensJson = itens.map((item) => item.toJson());
        const listenEvent = new ExpedicaoMutationListenEvent({
          Mutation: itensJson,
        });

        emitMutation(itensJson);
        emitListen(io, 'separar.item.delete.listen', listenEvent.toJson());
      });
    });
  }

  private convert(mutations: any[] | any): ExpedicaoItemSepararDto[] {
    return convertSocketMutationPayload(
      mutations,
      (mutation) =>
        ExpedicaoItemSepararDto.fromObject({
          ...mutation,
          Item: normalizeExpedicaoItemSequenceKey(mutation.Item),
        }),
      {
        eventName: 'separar.item.mutation',
        requiredKeys: ['CodEmpresa', 'CodSepararEstoque', 'CodProduto'],
        allowEmpty: true,
      },
    );
  }
}
