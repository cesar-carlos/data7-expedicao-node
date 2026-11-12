import { Server as SocketIOServer, Socket } from 'socket.io';

import ExpedicaoSeparacaoUsuarioSetorDto from '../../dto/expedicao/expedicao.separacao.usuario.setor.dto';
import {
  convertSocketMutationPayload,
  normalizeExpedicaoItemSequenceKey,
} from '../socket.event.helpers';
import SocketCrudRegistrar from '../socket.crud.registrar';
import SeparacaoUsuarioSetorItemRepository from './separacao.usuario.setor.item.repository';

export default class SeparacaoUsuarioSetorItemEvent {
  private repository = new SeparacaoUsuarioSetorItemRepository();

  constructor(io: SocketIOServer, socket: Socket) {
    const registrar = new SocketCrudRegistrar(io, socket);

    registrar.query({
      eventSuffix: 'separar.usuario.setor.consulta',
      execute: (where, pagination, orderBy) => this.repository.consulta(where, pagination, orderBy),
      map: (item) => item.toJson(),
    });

    registrar.query({
      eventSuffix: 'separar.usuario.setor.select',
      execute: (where, pagination, orderBy) => this.repository.select(where, pagination, orderBy),
      map: (item) => item.toJson(),
    });

    registrar.mutation({
      eventSuffix: 'separar.usuario.setor.insert',
      convert: (mutation) => this.convert(mutation),
      execute: async (items) => this.repository.insert(items),
      responseMap: (item) => item.toJson(),
      listenChannel: 'separar.usuario.setor.insert.listen',
      listenPayload: (items) => ({ Mutation: items.map((item) => item.toJson()) }),
      allowEmptyMutation: true,
    });

    registrar.mutation({
      eventSuffix: 'separar.usuario.setor.update',
      convert: (mutation) => this.convert(mutation),
      execute: async (items) => this.repository.update(items),
      responseMap: (item) => item.toJson(),
      listenChannel: 'separar.usuario.setor.update.listen',
      listenPayload: (items) => ({ Mutation: items.map((item) => item.toJson()) }),
      allowEmptyMutation: true,
    });

    registrar.mutation({
      eventSuffix: 'separar.usuario.setor.delete',
      convert: (mutation) => this.convert(mutation),
      execute: async (items) => this.repository.delete(items),
      responseMap: (item) => item.toJson(),
      listenChannel: 'separar.usuario.setor.delete.listen',
      listenPayload: (items) => ({ Mutation: items.map((item) => item.toJson()) }),
      allowEmptyMutation: true,
    });
  }

  private convert(mutations: unknown[] | unknown): ExpedicaoSeparacaoUsuarioSetorDto[] {
    return convertSocketMutationPayload(
      mutations,
      (mutation) =>
        ExpedicaoSeparacaoUsuarioSetorDto.fromObject({
          ...mutation,
          Item: normalizeExpedicaoItemSequenceKey(mutation.Item),
        }),
      { eventName: 'separar.usuario.setor.mutation', allowEmpty: true },
    );
  }
}
