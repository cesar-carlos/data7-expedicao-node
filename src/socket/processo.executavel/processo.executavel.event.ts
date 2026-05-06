import { Server as SocketIOServer, Socket } from 'socket.io';
import ProcessoExecutavelDto from '../../dto/common.data/processo.executavel.dto';
import { convertSocketMutationPayload } from '../socket.event.helpers';
import ProcessoExecutavelRepository from './processo.executavel.repository';
import SocketCrudRegistrar from '../socket.crud.registrar';

export default class ProcessoExecutavelEvent {
  private readonly repository = new ProcessoExecutavelRepository();

  constructor(io: SocketIOServer, socket: Socket) {
    const registrar = new SocketCrudRegistrar(io, socket);

    registrar.query({
      eventSuffix: 'processo.executavel.select',
      execute: (where, pagination, orderBy) => this.repository.select(where, pagination, orderBy),
      map: (item) => item.toJson(),
    });

    registrar.mutation({
      eventSuffix: 'processo.executavel.insert',
      convert: (mutation) => this.convert(mutation),
      beforeExecute: async (items) => {
        for (const item of items) {
          item.CodProcessoExecutavel = (await this.repository.sequence())?.Valor ?? 0;
        }
      },
      execute: async (items) => this.repository.insert(items),
      responseMap: (item) => item.toJson(),
      listenChannel: 'processo.executavel.insert.listen',
      listenPayload: (items) => ({ Mutation: items.map((item) => item.toJson()) }),
    });

    registrar.mutation({
      eventSuffix: 'processo.executavel.update',
      convert: (mutation) => this.convert(mutation),
      execute: async (items) => this.repository.update(items),
      responseMap: (item) => item.toJson(),
      listenChannel: 'processo.executavel.update.listen',
      listenPayload: (items) => ({ Mutation: items.map((item) => item.toJson()) }),
    });

    registrar.mutation({
      eventSuffix: 'processo.executavel.delete',
      convert: (mutation) => this.convert(mutation),
      execute: async (items) => this.repository.delete(items),
      responseMap: (item) => item.toJson(),
      listenChannel: 'processo.executavel.delete.listen',
      listenPayload: (items) => ({ Mutation: items.map((item) => item.toJson()) }),
    });
  }

  private convert(mutations: unknown[] | unknown): ProcessoExecutavelDto[] {
    return convertSocketMutationPayload(
      mutations,
      (mutation) => ProcessoExecutavelDto.fromObject(mutation),
      { eventName: 'processo.executavel.mutation' },
    );
  }
}
