import { Server as SocketIOServer, Socket } from 'socket.io';
import { Params } from '../../contracts/local.base.params';

import ExpedicaoMutationBasicEvent from '../../model/expedicao.basic.mutation.event';
import ExpedicaoTipoOperacaoArmazenagemDto from '../../dto/expedicao/expedicao.tipo.operacao.armazenagem.dto';
import TipoOperacaoArmazenagemRepository from './tipo.operacao.armazenagem.repository';
import { convertSocketMutationPayload, withSocketRequest } from '../socket.event.helpers';

export default class TipoOperacaoArmazenagemEvent {
  private repository = new TipoOperacaoArmazenagemRepository();

  constructor(io: SocketIOServer, socket: Socket) {
    const client = socket.id;

    socket.on(`${client} tipo.operacao.armazenagem.select`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} tipo.operacao.armazenagem.select`,
        eventName: 'tipo.operacao.armazenagem.select',
        kind: 'query',
      }, async ({ request, emitQuery }) => {
        const result = await this.repository.select(request.where as Params[], request.pagination, request.orderBy);
        emitQuery(result.map((item) => item.toJson()));
      });
    });

    socket.on(`${client} tipo.operacao.armazenagem.insert`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} tipo.operacao.armazenagem.insert`,
        eventName: 'tipo.operacao.armazenagem.insert',
        kind: 'mutation',
      }, async ({ request, emitMutation, emitListen }) => {
        const itens = this.convert(request.mutation);
        for (const item of itens) {
          const sequence = await this.repository.sequence();
          item.CodTipoOperacaoArmazenagem = sequence?.Valor ?? 0;
          await this.repository.insert([item]);
        }

        const basicEvent = new ExpedicaoMutationBasicEvent({
          Session: request.session,
          ResponseIn: request.responseIn,
          Mutation: itens.map((item) => item.toJson()),
        });

        emitMutation(itens.map((item) => item.toJson()));
        emitListen(io, 'tipo.operacao.armazenagem.insert.listen', basicEvent.toJson());
      });
    });

    socket.on(`${client} tipo.operacao.armazenagem.update`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} tipo.operacao.armazenagem.update`,
        eventName: 'tipo.operacao.armazenagem.update',
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
        emitListen(io, 'tipo.operacao.armazenagem.update.listen', basicEvent.toJson());
      });
    });

    socket.on(`${client} tipo.operacao.armazenagem.delete`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} tipo.operacao.armazenagem.delete`,
        eventName: 'tipo.operacao.armazenagem.delete',
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
        emitListen(io, 'tipo.operacao.armazenagem.delete.listen', basicEvent.toJson());
      });
    });
  }

  private convert(mutations: any[] | any): ExpedicaoTipoOperacaoArmazenagemDto[] {
    return convertSocketMutationPayload(
      mutations,
      (mutation) => ExpedicaoTipoOperacaoArmazenagemDto.fromObject(mutation),
      { eventName: 'tipo.operacao.armazenagem.mutation' },
    );
  }
}
