import { Server as SocketIOServer, Socket } from 'socket.io';
import ExpedicaoTipoOperacaoArmazenagemDto from '../../dto/expedicao/expedicao.tipo.operacao.armazenagem.dto';
import { convertSocketMutationPayload } from '../socket.event.helpers';
import SocketCrudRegistrar from '../socket.crud.registrar';
import TipoOperacaoArmazenagemRepository from './tipo.operacao.armazenagem.repository';

export default class TipoOperacaoArmazenagemEvent {
  private readonly repository = new TipoOperacaoArmazenagemRepository();

  constructor(io: SocketIOServer, socket: Socket) {
    const registrar = new SocketCrudRegistrar(io, socket);

    registrar.query({
      eventSuffix: 'tipo.operacao.armazenagem.select',
      execute: (where, pagination, orderBy) => this.repository.select(where, pagination, orderBy),
      map: (item) => item.toJson(),
    });

    registrar.mutation({
      eventSuffix: 'tipo.operacao.armazenagem.insert',
      convert: (mutation) => this.convert(mutation),
      beforeExecute: async (items) => {
        for (const item of items) {
          item.CodTipoOperacaoArmazenagem = (await this.repository.sequence())?.Valor ?? 0;
        }
      },
      execute: async (items) => this.repository.insert(items),
      responseMap: (item) => item.toJson(),
      listenChannel: 'tipo.operacao.armazenagem.insert.listen',
      listenPayload: (items) => ({ Mutation: items.map((item) => item.toJson()) }),
    });

    registrar.mutation({
      eventSuffix: 'tipo.operacao.armazenagem.update',
      convert: (mutation) => this.convert(mutation),
      execute: async (items) => this.repository.update(items),
      responseMap: (item) => item.toJson(),
      listenChannel: 'tipo.operacao.armazenagem.update.listen',
      listenPayload: (items) => ({ Mutation: items.map((item) => item.toJson()) }),
    });

    registrar.mutation({
      eventSuffix: 'tipo.operacao.armazenagem.delete',
      convert: (mutation) => this.convert(mutation),
      execute: async (items) => this.repository.delete(items),
      responseMap: (item) => item.toJson(),
      listenChannel: 'tipo.operacao.armazenagem.delete.listen',
      listenPayload: (items) => ({ Mutation: items.map((item) => item.toJson()) }),
    });
  }

  private convert(mutations: unknown[] | unknown): ExpedicaoTipoOperacaoArmazenagemDto[] {
    return convertSocketMutationPayload(
      mutations,
      (mutation) => ExpedicaoTipoOperacaoArmazenagemDto.fromObject(mutation),
      { eventName: 'tipo.operacao.armazenagem.mutation' },
    );
  }
}
