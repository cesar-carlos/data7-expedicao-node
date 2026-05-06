import { Server as SocketIOServer, Socket } from 'socket.io';
import ExpedicaoArmazenarDto from '../../dto/expedicao/expedicao.armazenar.dto';
import { convertSocketMutationPayload } from '../socket.event.helpers';
import SocketCrudRegistrar from '../socket.crud.registrar';
import ArmazenarRepository from './armazenar.repository';

export default class ArmazenarEvent {
  private readonly repository = new ArmazenarRepository();

  constructor(io: SocketIOServer, socket: Socket) {
    const registrar = new SocketCrudRegistrar(io, socket);

    registrar.query({
      eventSuffix: 'armazenar.select',
      execute: (where, pagination, orderBy) => this.repository.select(where, pagination, orderBy),
      map: (item) => item.toJson(),
    });

    registrar.mutation({
      eventSuffix: 'armazenar.insert',
      convert: (mutation) => this.convert(mutation),
      beforeExecute: async (items) => {
        for (const item of items) {
          if (item.CodArmazenar <= 0) {
            item.CodArmazenar = (await this.repository.sequence())?.Valor ?? 0;
          }
        }
      },
      execute: async (items) => this.repository.insert(items),
      responseMap: (item) => item.toJson(),
      listenChannel: 'armazenar.insert.listen',
      listenPayload: (items) => ({ Mutation: items.map((item) => item.toJson()) }),
    });

    registrar.mutation({
      eventSuffix: 'armazenar.update',
      convert: (mutation) => this.convert(mutation),
      execute: async (items) => this.repository.update(items),
      responseMap: (item) => item.toJson(),
      listenChannel: 'armazenar.update.listen',
      listenPayload: (items) => ({ Mutation: items.map((item) => item.toJson()) }),
    });

    registrar.mutation({
      eventSuffix: 'armazenar.delete',
      convert: (mutation) => this.convert(mutation),
      execute: async (items) => this.repository.delete(items),
      responseMap: (item) => item.toJson(),
      listenChannel: 'armazenar.delete.listen',
      listenPayload: (items) => ({ Mutation: items.map((item) => item.toJson()) }),
    });
  }

  private convert(mutations: unknown[] | unknown): ExpedicaoArmazenarDto[] {
    return convertSocketMutationPayload(
      mutations,
      (mutation) => ExpedicaoArmazenarDto.fromObject(mutation),
      { eventName: 'armazenar.mutation' },
    );
  }
}
