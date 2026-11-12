import { Server as SocketIOServer, Socket } from 'socket.io';

import EstoqueProdutoDto from '../../dto/common.data/estoque.produto.dto';
import {
  convertSocketMutationPayload,
  mutationBasicListenPayload,
  requireSequenceValue,
} from '../socket.event.helpers';
import SocketCrudRegistrar from '../socket.crud.registrar';
import EstoqueProdutoRepository from './estoque.produto.repository';

export default class EstoqueProdutoEvent {
  private repository = new EstoqueProdutoRepository();

  constructor(io: SocketIOServer, socket: Socket) {
    const registrar = new SocketCrudRegistrar(io, socket);

    registrar.query({
      eventSuffix: 'estoque.produto.consulta',
      execute: (where, pagination, orderBy) => this.repository.consulta(where, pagination, orderBy),
      map: (item) => item.toJson(),
    });

    registrar.query({
      eventSuffix: 'estoque.produto.select',
      execute: (where, pagination, orderBy) => this.repository.select(where, pagination, orderBy),
      map: (item) => item.toJson(),
    });

    registrar.mutation({
      eventSuffix: 'estoque.produto.insert',
      convert: (mutation) => this.convert(mutation),
      beforeExecute: async (items) => {
        for (const item of items) {
          if (item.CodProduto <= 0) {
            item.CodProduto = requireSequenceValue(await this.repository.sequence(), 'Produto');
          }
        }
      },
      execute: async (items) => this.repository.insert(items),
      responseMap: (item) => item.toJson(),
      listenChannel: 'estoque.produto.insert.listen',
      listenPayload: (items, request) => mutationBasicListenPayload(items, request),
    });

    registrar.mutation({
      eventSuffix: 'estoque.produto.update',
      convert: (mutation) => this.convert(mutation),
      execute: async (items) => this.repository.update(items),
      responseMap: (item) => item.toJson(),
      listenChannel: 'estoque.produto.update.listen',
      listenPayload: (items, request) => mutationBasicListenPayload(items, request),
    });

    registrar.mutation({
      eventSuffix: 'estoque.produto.delete',
      convert: (mutation) => this.convert(mutation),
      execute: async (items) => this.repository.delete(items),
      responseMap: (item) => item.toJson(),
      listenChannel: 'estoque.produto.delete.listen',
      listenPayload: (items, request) => mutationBasicListenPayload(items, request),
    });
  }

  private convert(mutations: unknown[] | unknown): EstoqueProdutoDto[] {
    return convertSocketMutationPayload(
      mutations,
      (mutation) => EstoqueProdutoDto.fromObject(mutation),
      { eventName: 'estoque.produto.mutation' },
    );
  }
}
