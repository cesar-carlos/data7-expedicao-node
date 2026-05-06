import { Server as SocketIOServer, Socket } from 'socket.io';
import ExpedicaoCancelamentoDto from '../../dto/expedicao/expedicao.cancelamento.dto';
import { convertSocketMutationPayload } from '../socket.event.helpers';
import SocketCrudRegistrar from '../socket.crud.registrar';
import CancelamentoRepository from './cancelamento.repository';

export default class CancelamentoEvent {
  private readonly repository = new CancelamentoRepository();

  constructor(io: SocketIOServer, socket: Socket) {
    const registrar = new SocketCrudRegistrar(io, socket);

    registrar.query({
      eventSuffix: 'expedicao.cancelamento.select',
      execute: (where, pagination, orderBy) => this.repository.select(where, pagination, orderBy),
      map: (item) => item.toJson(),
    });

    registrar.mutation({
      eventSuffix: 'expedicao.cancelamento.insert',
      convert: (mutation) => this.convert(mutation),
      beforeExecute: async (items) => {
        for (const item of items) {
          if (item.CodCancelamento <= 0) {
            item.CodCancelamento = (await this.repository.sequence())?.Valor ?? 0;
          }
        }
      },
      execute: async (items) => this.repository.insert(items),
      responseMap: (item) => item.toJson(),
      listenChannel: 'expedicao.cancelamento.insert.listen',
      listenPayload: (items) => ({ Mutation: items.map((item) => item.toJson()) }),
    });

    registrar.mutation({
      eventSuffix: 'expedicao.cancelamento.update',
      convert: (mutation) => this.convert(mutation),
      execute: async (items) => this.repository.update(items),
      responseMap: (item) => item.toJson(),
      listenChannel: 'expedicao.cancelamento.update.listen',
      listenPayload: (items) => ({ Mutation: items.map((item) => item.toJson()) }),
    });

    registrar.mutation({
      eventSuffix: 'expedicao.cancelamento.delete',
      convert: (mutation) => this.convert(mutation),
      execute: async (items) => this.repository.delete(items),
      responseMap: (item) => item.toJson(),
      listenChannel: 'expedicao.cancelamento.delete.listen',
      listenPayload: (items) => ({ Mutation: items.map((item) => item.toJson()) }),
    });
  }

  private convert(mutations: unknown[] | unknown): ExpedicaoCancelamentoDto[] {
    return convertSocketMutationPayload(
      mutations,
      (mutation) => ExpedicaoCancelamentoDto.fromObject(mutation),
      { eventName: 'expedicao.cancelamento.mutation' },
    );
  }
}
