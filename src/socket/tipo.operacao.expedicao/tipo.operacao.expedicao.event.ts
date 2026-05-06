import { Server as SocketIOServer, Socket } from 'socket.io';
import { Params } from '../../contracts/local.base.params';

import ExpedicaoMutationBasicEvent from '../../model/expedicao.basic.mutation.event';
import ExpedicaoTipoOperacaoExpedicaoDto from '../../dto/expedicao/expedicao.tipo.operacao.expedicao.dto';
import TipoOperacaoExpedicaoRepository from './tipo.operacao.expedicao.repository';
import { convertSocketMutationPayload, withSocketRequest } from '../socket.event.helpers';

export default class TipoOperacaoExpedicaoEvent {
  private repository = new TipoOperacaoExpedicaoRepository();

  constructor(io: SocketIOServer, socket: Socket) {
    const client = socket.id;

    socket.on(`${client} tipo.operacao.expedicao.select`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} tipo.operacao.expedicao.select`,
        eventName: 'tipo.operacao.expedicao.select',
        kind: 'query',
      }, async ({ request, emitQuery }) => {
        const result = await this.repository.select(request.where as Params[], request.pagination, request.orderBy);
        emitQuery(result.map((item) => item.toJson()));
      });
    });

    socket.on(`${client} tipo.operacao.expedicao.insert`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} tipo.operacao.expedicao.insert`,
        eventName: 'tipo.operacao.expedicao.insert',
        kind: 'mutation',
      }, async ({ request, emitMutation, emitListen }) => {
        const itens = this.convert(request.mutation);
        for (const item of itens) {
          const sequence = await this.repository.sequence();
          item.CodTipoOperacaoExpedicao = sequence?.Valor ?? 0;
          await this.repository.insert([item]);
        }

        const basicEvent = new ExpedicaoMutationBasicEvent({
          Session: request.session,
          ResponseIn: request.responseIn,
          Mutation: itens.map((item) => item.toJson()),
        });

        emitMutation(itens.map((item) => item.toJson()));
        emitListen(io, 'tipo.operacao.expedicao.insert.listen', basicEvent.toJson());
      });
    });

    socket.on(`${client} tipo.operacao.expedicao.update`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} tipo.operacao.expedicao.update`,
        eventName: 'tipo.operacao.expedicao.update',
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
        emitListen(io, 'tipo.operacao.expedicao.update.listen', basicEvent.toJson());
      });
    });

    socket.on(`${client} tipo.operacao.expedicao.delete`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} tipo.operacao.expedicao.delete`,
        eventName: 'tipo.operacao.expedicao.delete',
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
        emitListen(io, 'tipo.operacao.expedicao.delete.listen', basicEvent.toJson());
      });
    });
  }

  private convert(mutations: any[] | any): ExpedicaoTipoOperacaoExpedicaoDto[] {
    return convertSocketMutationPayload(
      mutations,
      (mutation) => ExpedicaoTipoOperacaoExpedicaoDto.fromObject(mutation),
      { eventName: 'tipo.operacao.expedicao.mutation' },
    );
  }
}
