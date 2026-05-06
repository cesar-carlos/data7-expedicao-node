import { Server as SocketIOServer, Socket } from 'socket.io';
import { Params } from '../../contracts/local.base.params';

import SeparacaoUsuarioSetorItemRepository from './separacao.usuario.setor.item.repository';
import ExpedicaoSeparacaoUsuarioSetorDto from '../../dto/expedicao/expedicao.separacao.usuario.setor.dto';
import ExpedicaoMutationListenEvent from '../../model/expedicao.mutation.listen.event';
import ExpedicaoMutationBasicEvent from '../../model/expedicao.basic.mutation.event';
import { convertSocketMutationPayload, withSocketRequest } from '../socket.event.helpers';

export default class SeparacaoUsuarioSetorItemEvent {
  private repository = new SeparacaoUsuarioSetorItemRepository();

  constructor(io: SocketIOServer, socket: Socket) {
    const client = socket.id;

    socket.on(`${client} separar.usuario.setor.consulta`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} separar.usuario.setor.consulta`,
        eventName: 'separar.usuario.setor.consulta',
        kind: 'query',
      }, async ({ request, emitQuery }) => {
        const result = await this.repository.consulta(request.where as Params[], request.pagination, request.orderBy);
        emitQuery(result.map((item: any) => item.toJson()));
      });
    });

    socket.on(`${client} separar.usuario.setor.select`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} separar.usuario.setor.select`,
        eventName: 'separar.usuario.setor.select',
        kind: 'query',
      }, async ({ request, emitQuery }) => {
        const result = await this.repository.select(request.where as Params[], request.pagination, request.orderBy);
        emitQuery(result.map((item: any) => item.toJson()));
      });
    });

    socket.on(`${client} separar.usuario.setor.insert`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} separar.usuario.setor.insert`,
        eventName: 'separar.usuario.setor.insert',
        kind: 'mutation',
      }, async ({ request, emitMutation, emitListen }) => {
        const itens = this.convert(request.mutation);
        await this.repository.insert(itens);

        const itensJson = itens.map((item: any) => item.toJson());
        const basicEvent = new ExpedicaoMutationBasicEvent({
          Session: request.session,
          ResponseIn: request.responseIn,
          Mutation: itensJson,
        });

        const listenEvent = new ExpedicaoMutationListenEvent({
          Mutation: itensJson,
        });

        emitMutation(basicEvent.Mutation ?? itensJson);
        emitListen(io, 'separar.usuario.setor.insert.listen', listenEvent.toJson());
      });
    });

    socket.on(`${client} separar.usuario.setor.update`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} separar.usuario.setor.update`,
        eventName: 'separar.usuario.setor.update',
        kind: 'mutation',
      }, async ({ request, emitMutation, emitListen }) => {
        const itens = this.convert(request.mutation);
        await this.repository.update(itens);

        const itensJson = itens.map((item: any) => item.toJson());
        const basicEvent = new ExpedicaoMutationBasicEvent({
          Session: request.session,
          ResponseIn: request.responseIn,
          Mutation: itensJson,
        });

        const listenEvent = new ExpedicaoMutationListenEvent({
          Mutation: itensJson,
        });

        emitMutation(basicEvent.Mutation ?? itensJson);
        emitListen(io, 'separar.usuario.setor.update.listen', listenEvent.toJson());
      });
    });

    socket.on(`${client} separar.usuario.setor.delete`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} separar.usuario.setor.delete`,
        eventName: 'separar.usuario.setor.delete',
        kind: 'mutation',
      }, async ({ request, emitMutation, emitListen }) => {
        const itens = this.convert(request.mutation);
        await this.repository.delete(itens);

        const itensJson = itens.map((item: any) => item.toJson());
        const basicEvent = new ExpedicaoMutationBasicEvent({
          Session: request.session,
          ResponseIn: request.responseIn,
          Mutation: itensJson,
        });

        const listenEvent = new ExpedicaoMutationListenEvent({
          Mutation: itensJson,
        });

        emitMutation(basicEvent.Mutation ?? itensJson);
        emitListen(io, 'separar.usuario.setor.delete.listen', listenEvent.toJson());
      });
    });
  }

  private convert(mutations: any[] | any): ExpedicaoSeparacaoUsuarioSetorDto[] {
    return convertSocketMutationPayload(
      mutations,
      (mutation) => ExpedicaoSeparacaoUsuarioSetorDto.fromObject(mutation),
      { eventName: 'separar.usuario.setor.mutation' },
    );
  }
}
