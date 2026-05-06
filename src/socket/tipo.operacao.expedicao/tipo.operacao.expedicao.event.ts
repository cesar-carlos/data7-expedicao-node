import { Server as SocketIOServer, Socket } from 'socket.io';
import ExpedicaoTipoOperacaoExpedicaoDto from '../../dto/expedicao/expedicao.tipo.operacao.expedicao.dto';
import { convertSocketMutationPayload } from '../socket.event.helpers';
import SocketCrudRegistrar from '../socket.crud.registrar';
import TipoOperacaoExpedicaoRepository from './tipo.operacao.expedicao.repository';

export default class TipoOperacaoExpedicaoEvent {
  private readonly repository = new TipoOperacaoExpedicaoRepository();

  constructor(io: SocketIOServer, socket: Socket) {
    const registrar = new SocketCrudRegistrar(io, socket);

    registrar.query({
      eventSuffix: 'tipo.operacao.expedicao.select',
      execute: (where, pagination, orderBy) => this.repository.select(where, pagination, orderBy),
      map: (item) => item.toJson(),
    });

    registrar.mutation({
      eventSuffix: 'tipo.operacao.expedicao.insert',
      convert: (mutation) => this.convert(mutation),
      beforeExecute: async (items) => {
        for (const item of items) {
          item.CodTipoOperacaoExpedicao = (await this.repository.sequence())?.Valor ?? 0;
        }
      },
      execute: async (items) => this.repository.insert(items),
      responseMap: (item) => item.toJson(),
      listenChannel: 'tipo.operacao.expedicao.insert.listen',
      listenPayload: (items) => ({ Mutation: items.map((item) => item.toJson()) }),
    });

    registrar.mutation({
      eventSuffix: 'tipo.operacao.expedicao.update',
      convert: (mutation) => this.convert(mutation),
      execute: async (items) => this.repository.update(items),
      responseMap: (item) => item.toJson(),
      listenChannel: 'tipo.operacao.expedicao.update.listen',
      listenPayload: (items) => ({ Mutation: items.map((item) => item.toJson()) }),
    });

    registrar.mutation({
      eventSuffix: 'tipo.operacao.expedicao.delete',
      convert: (mutation) => this.convert(mutation),
      execute: async (items) => this.repository.delete(items),
      responseMap: (item) => item.toJson(),
      listenChannel: 'tipo.operacao.expedicao.delete.listen',
      listenPayload: (items) => ({ Mutation: items.map((item) => item.toJson()) }),
    });
  }

  private convert(mutations: unknown[] | unknown): ExpedicaoTipoOperacaoExpedicaoDto[] {
    return convertSocketMutationPayload(
      mutations,
      (mutation) => ExpedicaoTipoOperacaoExpedicaoDto.fromObject(mutation),
      { eventName: 'tipo.operacao.expedicao.mutation' },
    );
  }
}
