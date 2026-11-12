import { Server as SocketIOServer, Socket } from 'socket.io';

import ExpedicaoItemArmazenarDto from '../../dto/expedicao/expedicao.item.armazenar.dto';
import {
  convertSocketMutationPayload,
  mutationBasicListenPayload,
  normalizeExpedicaoItemSequenceKey,
} from '../socket.event.helpers';
import SocketCrudRegistrar from '../socket.crud.registrar';
import ItemArmazenarRepository from './item.armazenar.repository';

export default class ItemArmazenarEvent {
  private repository = new ItemArmazenarRepository();

  constructor(io: SocketIOServer, socket: Socket) {
    const registrar = new SocketCrudRegistrar(io, socket);

    registrar.query({
      eventSuffix: 'armazenar.item.consulta',
      execute: (where, pagination, orderBy) => this.repository.consulta(where, pagination, orderBy),
      map: (item) => item.toJson(),
    });

    registrar.query({
      eventSuffix: 'armazenar.item.select',
      execute: (where, pagination, orderBy) => this.repository.select(where, pagination, orderBy),
      map: (item) => item.toJson(),
    });

    registrar.mutation({
      eventSuffix: 'armazenar.item.insert',
      convert: (mutation) => this.convert(mutation),
      execute: async (items) => this.repository.insert(items),
      responseMap: (item) => item.toJson(),
      listenChannel: 'armazenar.item.insert.listen',
      listenPayload: (items, request) => mutationBasicListenPayload(items, request),
      allowEmptyMutation: true,
    });

    registrar.mutation({
      eventSuffix: 'armazenar.item.update',
      convert: (mutation) => this.convert(mutation),
      execute: async (items) => this.repository.update(items),
      responseMap: (item) => item.toJson(),
      listenChannel: 'armazenar.item.update.listen',
      listenPayload: (items, request) => mutationBasicListenPayload(items, request),
      allowEmptyMutation: true,
    });

    registrar.mutation({
      eventSuffix: 'armazenar.item.delete',
      convert: (mutation) => this.convert(mutation),
      execute: async (items) => this.repository.delete(items),
      responseMap: (item) => item.toJson(),
      listenChannel: 'armazenar.item.delete.listen',
      listenPayload: (items, request) => mutationBasicListenPayload(items, request),
      allowEmptyMutation: true,
    });
  }

  private convert(mutations: unknown[] | unknown): ExpedicaoItemArmazenarDto[] {
    return convertSocketMutationPayload(
      mutations,
      (mutation) =>
        ExpedicaoItemArmazenarDto.fromObject({
          ...mutation,
          Item: normalizeExpedicaoItemSequenceKey(mutation.Item),
        }),
      { eventName: 'armazenar.item.mutation', allowEmpty: true },
    );
  }
}
