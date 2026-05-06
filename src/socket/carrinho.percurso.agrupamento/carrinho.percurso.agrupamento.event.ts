import { Server as SocketIOServer, Socket } from 'socket.io';
import { Params } from '../../contracts/local.base.params';

import ExpedicaoMutationBasicEvent from '../../model/expedicao.basic.mutation.event';
import CarrinhoPercursoAgrupamentoRepository from './carrinho.percurso.agrupamento.repository';
import ExpedicaoCarrinhoPercursoAgrupamento from '../../dto/expedicao/expedicao.carrinho.percurso.agrupamento';
import {
  convertSocketMutationPayload,
  normalizeExpedicaoItemSequenceKey,
  withSocketRequest,
} from '../socket.event.helpers';

export default class CarrinhoPercursoAgrupamentoEvent {
  private repository = new CarrinhoPercursoAgrupamentoRepository();

  constructor(io: SocketIOServer, socket: Socket) {
    const client = socket.id;

    socket.on(`${client} carrinho.percurso.agrupamento.consulta`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} carrinho.percurso.agrupamento.consulta`,
        eventName: 'carrinho.percurso.agrupamento.consulta',
        kind: 'query',
      }, async ({ request, emitQuery }) => {
        const result = await this.repository.consulta(request.where as Params[], request.pagination, request.orderBy);
        emitQuery(result.map((item) => item.toJson()));
      });
    });

    socket.on(`${client} carrinho.percurso.agrupamento.select`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} carrinho.percurso.agrupamento.select`,
        eventName: 'carrinho.percurso.agrupamento.select',
        kind: 'query',
      }, async ({ request, emitQuery }) => {
        const result = await this.repository.select(request.where as Params[], request.pagination, request.orderBy);
        emitQuery(result.map((item) => item.toJson()));
      });
    });

    socket.on(`${client} carrinho.percurso.agrupamento.insert`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} carrinho.percurso.agrupamento.insert`,
        eventName: 'carrinho.percurso.agrupamento.insert',
        kind: 'mutation',
      }, async ({ request, emitMutation, emitListen }) => {
        const itens = this.convert(request.mutation);
        const inserteds = await this.repository.insert(itens);

        const basicEvent = new ExpedicaoMutationBasicEvent({
          Session: request.session,
          ResponseIn: request.responseIn,
          Mutation: inserteds.map((item) => item.toJson()),
        });

        emitMutation(inserteds.map((item) => item.toJson()));
        emitListen(io, 'carrinho.percurso.agrupamento.insert.listen', basicEvent.toJson());
      });
    });

    socket.on(`${client} carrinho.percurso.agrupamento.update`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} carrinho.percurso.agrupamento.update`,
        eventName: 'carrinho.percurso.agrupamento.update',
        kind: 'mutation',
      }, async ({ request, emitMutation, emitListen }) => {
        const itens = this.convert(request.mutation);
        await this.repository.update(itens);

        const basicEvent = new ExpedicaoMutationBasicEvent({
          Session: request.session,
          ResponseIn: request.responseIn,
          Mutation: itens.map((item) => item.toJson()),
        });

        emitMutation(itens.map((item) => item.toJson()));
        emitListen(io, 'carrinho.percurso.agrupamento.update.listen', basicEvent.toJson());
      });
    });

    socket.on(`${client} carrinho.percurso.agrupamento.delete`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} carrinho.percurso.agrupamento.delete`,
        eventName: 'carrinho.percurso.agrupamento.delete',
        kind: 'mutation',
      }, async ({ request, emitMutation, emitListen }) => {
        const itens = this.convert(request.mutation);
        await this.repository.delete(itens);

        const basicEvent = new ExpedicaoMutationBasicEvent({
          Session: request.session,
          ResponseIn: request.responseIn,
          Mutation: itens.map((item) => item.toJson()),
        });

        emitMutation(itens.map((item) => item.toJson()));
        emitListen(io, 'carrinho.percurso.agrupamento.delete.listen', basicEvent.toJson());
      });
    });
  }

  private convert(mutations: any[] | any): ExpedicaoCarrinhoPercursoAgrupamento[] {
    return convertSocketMutationPayload(
      mutations,
      (mutation) =>
        ExpedicaoCarrinhoPercursoAgrupamento.fromObject({
          ...mutation,
          Item: normalizeExpedicaoItemSequenceKey(mutation.Item),
        }),
      { eventName: 'carrinho.percurso.agrupamento.mutation' },
    );
  }
}
