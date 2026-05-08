import { Server as SocketIOServer, Socket } from 'socket.io';
import { Params } from '../../contracts/local.base.params';

import CarrinhoPercursoRepository from './carrinho.percurso.repository';
import ExpedicaoCarrinhoPercursoDto from '../../dto/expedicao/expedicao.carrinho.percurso.dto';
import ExpedicaoMutationBasicEvent from '../../model/expedicao.basic.mutation.event';
import { convertSocketMutationPayload, withSocketRequest } from '../socket.event.helpers';

export default class CarrinhoPercursoEvent {
  private repository = new CarrinhoPercursoRepository();

  constructor(io: SocketIOServer, socket: Socket) {
    const client = socket.id;

    socket.on(`${client} carrinho.percurso.consulta`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} carrinho.percurso.consulta`,
        eventName: 'carrinho.percurso.consulta',
        kind: 'query',
      }, async ({ request, emitQuery }) => {
        const result = await this.repository.consulta(request.where as Params[], request.pagination, request.orderBy);
        emitQuery(result.map((item) => item.toJson()));
      });
    });

    socket.on(`${client} carrinho.percurso.select`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} carrinho.percurso.select`,
        eventName: 'carrinho.percurso.select',
        kind: 'query',
      }, async ({ request, emitQuery }) => {
        const result = await this.repository.select(request.where as Params[], request.pagination, request.orderBy);
        emitQuery(result.map((item) => item.toJson()));
      });
    });

    socket.on(`${client} carrinho.percurso.insert`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} carrinho.percurso.insert`,
        eventName: 'carrinho.percurso.insert',
        kind: 'mutation',
      }, async ({ request, emitMutation, emitListen }) => {
        const itens = this.convert(request.mutation);
        if (itens.length === 0) {
          emitMutation([]);
          return;
        }
        const carrinhoPercursos: ExpedicaoCarrinhoPercursoDto[] = [];
        for (const item of itens) {
          const sequence = await this.repository.sequence();
          item.CodCarrinhoPercurso = sequence?.Valor ?? 0;
          await this.repository.insert([item]);
          carrinhoPercursos.push(item);
        }

        const basicEvent = new ExpedicaoMutationBasicEvent({
          Session: request.session,
          ResponseIn: request.responseIn,
          Mutation: carrinhoPercursos.map((item) => item.toJson()),
        });

        emitMutation(carrinhoPercursos.map((item) => item.toJson()));
        emitListen(io, 'carrinho.percurso.insert.listen', basicEvent.toJson());
      });
    });

    socket.on(`${client} carrinho.percurso.update`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} carrinho.percurso.update`,
        eventName: 'carrinho.percurso.update',
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
        emitListen(io, 'carrinho.percurso.update.listen', basicEvent.toJson());
      });
    });

    socket.on(`${client} carrinho.percurso.delete`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} carrinho.percurso.delete`,
        eventName: 'carrinho.percurso.delete',
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
        emitListen(io, 'carrinho.percurso.delete.listen', basicEvent.toJson());
      });
    });
  }

  private convert(mutations: any[] | any): ExpedicaoCarrinhoPercursoDto[] {
    return convertSocketMutationPayload(
      mutations,
      (mutation) => ExpedicaoCarrinhoPercursoDto.fromObject(mutation),
      { eventName: 'carrinho.percurso.mutation', allowEmpty: true },
    );
  }
}
