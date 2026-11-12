import { Server as SocketIOServer, Socket } from 'socket.io';
import { Params } from '../../contracts/local.base.params';

import EstoqueConversaoUnidadeDto from '../../dto/common.data/estoque.conversao.unidade.dto';
import { SocketClientError } from '../../utils/repository.error';
import {
  convertSocketMutationPayload,
  mutationBasicListenPayload,
} from '../socket.event.helpers';
import SocketCrudRegistrar from '../socket.crud.registrar';
import EstoqueConversaoUnidadeRepository from './estoque.conversao.unidade.repository';

export default class EstoqueConversaoUnidadeEvent {
  private repository = new EstoqueConversaoUnidadeRepository();

  constructor(io: SocketIOServer, socket: Socket) {
    const registrar = new SocketCrudRegistrar(io, socket);

    registrar.query({
      eventSuffix: 'produto.conversao.unidade.consulta',
      execute: (where, pagination, orderBy) => this.repository.consulta(where, pagination, orderBy),
      map: (item) => item.toJson(),
    });

    registrar.query({
      eventSuffix: 'produto.conversao.unidade.select',
      execute: (where, pagination, orderBy) => this.repository.select(where, pagination, orderBy),
      map: (item) => item.toJson(),
    });

    registrar.mutation({
      eventSuffix: 'produto.conversao.unidade.insert',
      convert: (mutation) => this.convert(mutation),
      beforeExecute: async (items) => {
        for (const el of items) {
          if (!(el.CodProduto > 0)) {
            throw new SocketClientError('produto.conversao.unidade.insert exige CodProduto.');
          }
          if (!el.Item || String(el.Item).trim().length === 0) {
            el.Item = await this.lestItem(el.CodProduto);
          }
        }
      },
      execute: async (items) => {
        for (const el of items) {
          await this.repository.insert([el]);
        }
      },
      responseMap: (item) => item.toJson(),
      listenChannel: 'produto.conversao.unidade.insert.listen',
      listenPayload: (items, request) => mutationBasicListenPayload(items, request),
    });

    registrar.mutation({
      eventSuffix: 'produto.conversao.unidade.update',
      convert: (mutation) => this.convert(mutation),
      execute: async (items) => this.repository.update(items),
      responseMap: (item) => item.toJson(),
      listenChannel: 'produto.conversao.unidade.update.listen',
      listenPayload: (items, request) => mutationBasicListenPayload(items, request),
    });

    registrar.mutation({
      eventSuffix: 'produto.conversao.unidade.delete',
      convert: (mutation) => this.convert(mutation),
      execute: async (items) => this.repository.delete(items),
      responseMap: (item) => item.toJson(),
      listenChannel: 'produto.conversao.unidade.delete.listen',
      listenPayload: (items, request) => mutationBasicListenPayload(items, request),
    });
  }

  private convert(mutations: unknown[] | unknown): EstoqueConversaoUnidadeDto[] {
    return convertSocketMutationPayload(
      mutations,
      (mutation) => EstoqueConversaoUnidadeDto.fromObject(mutation),
      { eventName: 'produto.conversao.unidade.mutation', requiredKeys: ['CodProduto'] },
    );
  }

  private async lestItem(codProduto: number): Promise<string> {
    const itens = await this.repository.select([Params.equals('CodProduto', codProduto)]);
    if (itens.length == 0) return '001';
    const list = itens.map((item) => item.Item);
    const max = Math.max(...list.map((item) => Number(item)));
    return String(max + 1).padStart(3, '0');
  }
}
