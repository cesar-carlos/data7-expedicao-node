import { Server as SocketIOServer, Socket } from 'socket.io';
import { Params } from '../../contracts/local.base.params';

import EstoqueConversaoUnidadeRepository from './estoque.conversao.unidade.repository';
import EstoqueConversaoUnidadeDto from '../../dto/common.data/estoque.conversao.unidade.dto';
import ExpedicaoMutationBasicEvent from '../../model/expedicao.basic.mutation.event';
import { convertSocketMutationPayload, withSocketRequest } from '../socket.event.helpers';

export default class EstoqueConversaoUnidadeEvent {
  private repository = new EstoqueConversaoUnidadeRepository();

  constructor(io: SocketIOServer, socket: Socket) {
    const client = socket.id;
    socket.on(`${client} produto.conversao.unidade.consulta`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} estoque.produto.conversao.unidade.consulta`,
        eventName: 'produto.conversao.unidade.consulta',
        kind: 'query',
      }, async ({ request, emitQuery }) => {
        const result = await this.repository.consulta(request.where as Params[], request.pagination, request.orderBy);
        emitQuery(result.map((item) => item.toJson()));
      });
    });

    socket.on(`${client} produto.conversao.unidade.select`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} estoque.produto.conversao.unidade.select`,
        eventName: 'produto.conversao.unidade.select',
        kind: 'query',
      }, async ({ request, emitQuery }) => {
        const result = await this.repository.select(request.where as Params[], request.pagination, request.orderBy);
        emitQuery(result.map((item) => item.toJson()));
      });
    });

    socket.on(`${client} produto.conversao.unidade.insert`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} estoque.produto.conversao.unidade.insert`,
        eventName: 'produto.conversao.unidade.insert',
        kind: 'mutation',
      }, async ({ request, emitMutation, emitListen }) => {
        const itens = this.convert(request.mutation);
        for (const el of itens) {
          const sequence = await this.repository.sequence();
          el.CodProduto = sequence?.Valor ?? 0;
          el.Item = await this.lestItem(el.CodProduto);
          await this.repository.insert([el]);
        }

        const basicEvent = new ExpedicaoMutationBasicEvent({
          Session: request.session,
          ResponseIn: request.responseIn,
          Mutation: itens.map((item) => item.toJson()),
        });

        emitMutation(itens.map((item) => item.toJson()));
        emitListen(io, 'produto.conversao.unidade.insert.listen', basicEvent.toJson());
      });
    });

    socket.on(`${client} produto.conversao.unidade.update`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} estoque.produto.conversao.unidade.update`,
        eventName: 'produto.conversao.unidade.update',
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
        emitListen(io, 'produto.conversao.unidade.update.listen', basicEvent.toJson());
      });
    });

    socket.on(`${client} produto.conversao.unidade.delete`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} estoque.produto.conversao.unidade.delete`,
        eventName: 'produto.conversao.unidade.delete',
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
        emitListen(io, 'produto.conversao.unidade.delete.listen', basicEvent.toJson());
      });
    });
  }

  private convert(mutations: any[] | any): EstoqueConversaoUnidadeDto[] {
    return convertSocketMutationPayload(
      mutations,
      (mutation) => EstoqueConversaoUnidadeDto.fromObject(mutation),
      { eventName: 'produto.conversao.unidade.mutation' },
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
