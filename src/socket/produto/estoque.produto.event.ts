import { Server as SocketIOServer, Socket } from 'socket.io';
import { Params } from '../../contracts/local.base.params';

import EstoqueProdutoRepository from './estoque.produto.repository';
import ExpedicaoMutationBasicEvent from '../../model/expedicao.basic.mutation.event';
import EstoqueProdutoDto from '../../dto/common.data/estoque.produto.dto';
import { convertSocketMutationPayload, withSocketRequest } from '../socket.event.helpers';

export default class EstoqueProdutoEvent {
  private repository = new EstoqueProdutoRepository();

  constructor(io: SocketIOServer, socket: Socket) {
    const client = socket.id;
    socket.on(`${client} estoque.produto.consulta`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} estoque.produto.consulta`,
        eventName: 'estoque.produto.consulta',
        kind: 'query',
      }, async ({ request, emitQuery }) => {
        const result = await this.repository.consulta(request.where as Params[], request.pagination, request.orderBy);
        emitQuery(result.map((item) => item.toJson()));
      });
    });

    socket.on(`${client} estoque.produto.select`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} estoque.produto.select`,
        eventName: 'estoque.produto.select',
        kind: 'query',
      }, async ({ request, emitQuery }) => {
        const result = await this.repository.select(request.where as Params[], request.pagination, request.orderBy);
        emitQuery(result.map((item) => item.toJson()));
      });
    });

    socket.on(`${client} estoque.produto.insert`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} estoque.produto.insert`,
        eventName: 'estoque.produto.insert',
        kind: 'mutation',
      }, async ({ request, emitMutation, emitListen }) => {
        const itens = this.convert(request.mutation);
        for (const item of itens) {
          const sequence = await this.repository.sequence();
          item.CodProduto = sequence?.Valor ?? 0;
          await this.repository.insert([item]);
        }

        const basicEvent = new ExpedicaoMutationBasicEvent({
          Session: request.session,
          ResponseIn: request.responseIn,
          Mutation: itens.map((item) => item.toJson()),
        });

        emitMutation(itens.map((item) => item.toJson()));
        emitListen(io, 'estoque.produto.insert.listen', basicEvent.toJson());
      });
    });

    socket.on(`${client} estoque.produto.update`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} estoque.produto.update`,
        eventName: 'estoque.produto.update',
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
        emitListen(io, 'estoque.produto.update.listen', basicEvent.toJson());
      });
    });

    socket.on(`${client} estoque.produto.delete`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} estoque.produto.delete`,
        eventName: 'estoque.produto.delete',
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
        emitListen(io, 'estoque.produto.delete.listen', basicEvent.toJson());
      });
    });
  }

  private convert(mutations: any[] | any): EstoqueProdutoDto[] {
    return convertSocketMutationPayload(
      mutations,
      (mutation) => EstoqueProdutoDto.fromObject(mutation),
      { eventName: 'estoque.produto.mutation' },
    );
  }
}
