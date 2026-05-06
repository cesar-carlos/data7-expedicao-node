import { Server as SocketIOServer, Socket } from 'socket.io';
import { Params } from '../../contracts/local.base.params';

import ConferirItemRepository from './conferir.item.repository';
import ExpedicaoItemConferirDto from '../../dto/expedicao/expedicao.item.conferir.dto';
import ExpedicaoMutationBasicEvent from '../../model/expedicao.basic.mutation.event';
import {
  convertSocketMutationPayload,
  normalizeExpedicaoItemSequenceKey,
  withSocketRequest,
} from '../socket.event.helpers';

export default class ConferirItemEvent {
  private repository = new ConferirItemRepository();

  constructor(io: SocketIOServer, socket: Socket) {
    const client = socket.id;

    socket.on(`${client} conferir.item.consulta`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} conferir.item.consulta`,
        eventName: 'conferir.item.consulta',
        kind: 'query',
      }, async ({ request, emitQuery }) => {
        const result = await this.repository.consulta(request.where as Params[], request.pagination, request.orderBy);
        emitQuery(result.map((item) => item.toJson()));
      });
    });

    socket.on(`${client} conferir.item.unidade.medida.consulta`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} conferir.item.unidade.medida.consulta`,
        eventName: 'conferir.item.unidade.medida.consulta',
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

    socket.on(`${client} conferir.separacao.item.consulta`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} conferir.separacao.item.consulta`,
        eventName: 'conferir.separacao.item.consulta',
        kind: 'query',
      }, async ({ request, emitQuery }) => {
        const result = await this.repository.consultaConferirSeparacao(
          request.where as Params[],
          request.pagination,
          request.orderBy,
        );
        emitQuery(result.map((item) => item.toJson()));
      });
    });

    socket.on(`${client} conferir.item.select`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} conferir.item.select`,
        eventName: 'conferir.item.select',
        kind: 'query',
      }, async ({ request, emitQuery }) => {
        const result = await this.repository.select(request.where as Params[], request.pagination, request.orderBy);
        emitQuery(result.map((item) => item.toJson()));
      });
    });

    socket.on(`${client} conferir.item.insert`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} conferir.item.insert`,
        eventName: 'conferir.item.insert',
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
        emitListen(io, 'conferir.item.insert.listen', basicEvent.toJson());
      });
    });

    socket.on(`${client} conferir.item.update`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} conferir.item.update`,
        eventName: 'conferir.item.update',
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
        emitListen(io, 'conferir.item.update.listen', basicEvent.toJson());
      });
    });

    socket.on(`${client} conferir.item.delete`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} conferir.item.delete`,
        eventName: 'conferir.item.delete',
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
        emitListen(io, 'conferir.item.delete.listen', basicEvent.toJson());
      });
    });
  }

  private convert(mutations: any[] | any): ExpedicaoItemConferirDto[] {
    return convertSocketMutationPayload(
      mutations,
      (mutation) =>
        ExpedicaoItemConferirDto.fromObject({
          ...mutation,
          Item: normalizeExpedicaoItemSequenceKey(mutation.Item),
        }),
      {
        eventName: 'conferir.item.mutation',
        requiredKeys: ['CodEmpresa', 'CodConferir', 'CodProduto'],
        allowEmpty: true,
      },
    );
  }
}
