import { Server as SocketIOServer, Socket } from 'socket.io';

import ExpedicaoCarrinhoPercursoAgrupamento from '../../dto/expedicao/expedicao.carrinho.percurso.agrupamento';
import {
  convertSocketMutationPayload,
  mutationBasicListenPayload,
  normalizeExpedicaoItemSequenceKey,
} from '../socket.event.helpers';
import SocketCrudRegistrar from '../socket.crud.registrar';
import CarrinhoPercursoAgrupamentoRepository from './carrinho.percurso.agrupamento.repository';

export default class CarrinhoPercursoAgrupamentoEvent {
  private repository = new CarrinhoPercursoAgrupamentoRepository();

  constructor(io: SocketIOServer, socket: Socket) {
    const registrar = new SocketCrudRegistrar(io, socket);

    registrar.query({
      eventSuffix: 'carrinho.percurso.agrupamento.consulta',
      execute: (where, pagination, orderBy) => this.repository.consulta(where, pagination, orderBy),
      map: (item) => item.toJson(),
    });

    registrar.query({
      eventSuffix: 'carrinho.percurso.agrupamento.select',
      execute: (where, pagination, orderBy) => this.repository.select(where, pagination, orderBy),
      map: (item) => item.toJson(),
    });

    registrar.mutation({
      eventSuffix: 'carrinho.percurso.agrupamento.insert',
      convert: (mutation) => this.convert(mutation),
      execute: async (items) => this.repository.insert(items),
      responseMap: (item) => item.toJson(),
      listenChannel: 'carrinho.percurso.agrupamento.insert.listen',
      listenPayload: (items, request) => mutationBasicListenPayload(items, request),
      allowEmptyMutation: true,
    });

    registrar.mutation({
      eventSuffix: 'carrinho.percurso.agrupamento.update',
      convert: (mutation) => this.convert(mutation),
      execute: async (items) => this.repository.update(items),
      responseMap: (item) => item.toJson(),
      listenChannel: 'carrinho.percurso.agrupamento.update.listen',
      listenPayload: (items, request) => mutationBasicListenPayload(items, request),
      allowEmptyMutation: true,
    });

    registrar.mutation({
      eventSuffix: 'carrinho.percurso.agrupamento.delete',
      convert: (mutation) => this.convert(mutation),
      execute: async (items) => this.repository.delete(items),
      responseMap: (item) => item.toJson(),
      listenChannel: 'carrinho.percurso.agrupamento.delete.listen',
      listenPayload: (items, request) => mutationBasicListenPayload(items, request),
      allowEmptyMutation: true,
    });
  }

  private convert(mutations: unknown[] | unknown): ExpedicaoCarrinhoPercursoAgrupamento[] {
    return convertSocketMutationPayload(
      mutations,
      (mutation) =>
        ExpedicaoCarrinhoPercursoAgrupamento.fromObject({
          ...mutation,
          Item: normalizeExpedicaoItemSequenceKey(mutation.Item),
        }),
      { eventName: 'carrinho.percurso.agrupamento.mutation', allowEmpty: true },
    );
  }
}
