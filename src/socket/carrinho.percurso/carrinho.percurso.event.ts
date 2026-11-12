import { Server as SocketIOServer, Socket } from 'socket.io';

import ExpedicaoCarrinhoPercursoDto from '../../dto/expedicao/expedicao.carrinho.percurso.dto';
import {
  convertSocketMutationPayload,
  mutationBasicListenPayload,
  requireSequenceValue,
} from '../socket.event.helpers';
import SocketCrudRegistrar from '../socket.crud.registrar';
import CarrinhoPercursoRepository from './carrinho.percurso.repository';

export default class CarrinhoPercursoEvent {
  private repository = new CarrinhoPercursoRepository();

  constructor(io: SocketIOServer, socket: Socket) {
    const registrar = new SocketCrudRegistrar(io, socket);

    registrar.query({
      eventSuffix: 'carrinho.percurso.consulta',
      execute: (where, pagination, orderBy) => this.repository.consulta(where, pagination, orderBy),
      map: (item) => item.toJson(),
    });

    registrar.query({
      eventSuffix: 'carrinho.percurso.select',
      execute: (where, pagination, orderBy) => this.repository.select(where, pagination, orderBy),
      map: (item) => item.toJson(),
    });

    registrar.mutation({
      eventSuffix: 'carrinho.percurso.insert',
      convert: (mutation) => this.convert(mutation),
      beforeExecute: async (items) => {
        for (const item of items) {
          if (item.CodCarrinhoPercurso <= 0) {
            item.CodCarrinhoPercurso = requireSequenceValue(
              await this.repository.sequence(),
              'CarrinhoPercurso',
            );
          }
        }
      },
      execute: async (items) => {
        for (const item of items) {
          await this.repository.insert([item]);
        }
      },
      responseMap: (item) => item.toJson(),
      listenChannel: 'carrinho.percurso.insert.listen',
      listenPayload: (items, request) => mutationBasicListenPayload(items, request),
      allowEmptyMutation: true,
    });

    registrar.mutation({
      eventSuffix: 'carrinho.percurso.update',
      convert: (mutation) => this.convert(mutation),
      execute: async (items) => this.repository.update(items),
      responseMap: (item) => item.toJson(),
      listenChannel: 'carrinho.percurso.update.listen',
      listenPayload: (items, request) => mutationBasicListenPayload(items, request),
      allowEmptyMutation: true,
    });

    registrar.mutation({
      eventSuffix: 'carrinho.percurso.delete',
      convert: (mutation) => this.convert(mutation),
      execute: async (items) => this.repository.delete(items),
      responseMap: (item) => item.toJson(),
      listenChannel: 'carrinho.percurso.delete.listen',
      listenPayload: (items, request) => mutationBasicListenPayload(items, request),
      allowEmptyMutation: true,
    });
  }

  private convert(mutations: unknown[] | unknown): ExpedicaoCarrinhoPercursoDto[] {
    return convertSocketMutationPayload(
      mutations,
      (mutation) => ExpedicaoCarrinhoPercursoDto.fromObject(mutation),
      { eventName: 'carrinho.percurso.mutation', allowEmpty: true },
    );
  }
}
