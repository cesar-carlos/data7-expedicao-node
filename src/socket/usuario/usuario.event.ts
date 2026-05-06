import { Server as SocketIOServer, Socket } from 'socket.io';
import { Params } from '../../contracts/local.base.params';
import UsuarioDto from '../../dto/common.data/usuario';
import UsuarioConsultaDto from '../../dto/common.data/usuario.consulta.dto';
import { convertSocketMutationPayload } from '../socket.event.helpers';
import SocketCrudRegistrar from '../socket.crud.registrar';
import UsuarioRepository from './usuario.repository';

export default class UsuarioEvent {
  private readonly repository = new UsuarioRepository();

  constructor(io: SocketIOServer, socket: Socket) {
    const registrar = new SocketCrudRegistrar(io, socket);

    registrar.query({
      eventSuffix: 'usuario.consulta',
      execute: (where, pagination, orderBy) => this.repository.consulta(where, pagination, orderBy),
      map: (item) => item.toJson(),
    });

    registrar.query({
      eventSuffix: 'usuario.select',
      execute: (where, pagination, orderBy) => this.repository.select(where, pagination, orderBy),
      map: (item) => item.toJson(),
    });

    registrar.mutation({
      eventSuffix: 'usuario.insert',
      convert: (mutation) => this.convert(mutation),
      beforeExecute: async (items) => {
        for (const item of items) {
          item.CodUsuario = (await this.repository.sequence())?.Valor ?? 0;
        }
      },
      execute: async (items) => this.repository.insert(items),
      loadListen: async (items) => this.loadConsulta(items),
      responseMap: (item) => item.toJson(),
      listenChannel: 'usuario.insert.listen',
      listenPayload: (items) => ({ Mutation: items.map((item) => item.toJson()) }),
    });

    registrar.mutation({
      eventSuffix: 'usuario.update',
      convert: (mutation) => this.convert(mutation),
      execute: async (items) => this.repository.update(items),
      loadListen: async (items) => this.loadConsulta(items),
      responseMap: (item) => item.toJson(),
      listenChannel: 'usuario.update.listen',
      listenPayload: (items) => ({ Mutation: items.map((item) => item.toJson()) }),
    });

    registrar.mutation({
      eventSuffix: 'usuario.delete',
      convert: (mutation) => this.convert(mutation),
      execute: async (items) => this.repository.delete(items),
      loadListen: async (items) => this.loadConsulta(items),
      loadListenBeforeExecute: true,
      responseMap: (item) => item.toJson(),
      listenChannel: 'usuario.delete.listen',
      listenPayload: (items) => ({ Mutation: items.map((item) => item.toJson()) }),
    });
  }

  private async loadConsulta(items: UsuarioDto[]): Promise<UsuarioConsultaDto[]> {
    const results = await Promise.all(
      items.map((item) => this.repository.consulta([Params.equals('CodUsuario', item.CodUsuario)])),
    );

    return results.flat();
  }

  private convert(mutations: unknown[] | unknown): UsuarioDto[] {
    return convertSocketMutationPayload(
      mutations,
      (mutation) => UsuarioDto.fromObject(mutation),
      { eventName: 'usuario.mutation' },
    );
  }
}
