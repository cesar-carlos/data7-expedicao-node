import { Server as SocketIOServer, Socket } from 'socket.io';
import ExpedicaoPercursoEstagioDto from '../../dto/expedicao/expedicao.percurso.estagio.dto';
import { convertSocketMutationPayload } from '../socket.event.helpers';
import SocketCrudRegistrar from '../socket.crud.registrar';
import ExpedicaoPercursoEstagioRepository from './expedicao.percurso.estagio.repository';

export default class ExpedicaoPercursoEstagioEvent {
  private readonly repository = new ExpedicaoPercursoEstagioRepository();

  constructor(io: SocketIOServer, socket: Socket) {
    const registrar = new SocketCrudRegistrar(io, socket);

    registrar.query({
      eventSuffix: 'expedicao.percurso.estagio.select',
      execute: (where, pagination, orderBy) => this.repository.select(where, pagination, orderBy),
      map: (item) => item.toJson(),
    });

    registrar.mutation({
      eventSuffix: 'expedicao.percurso.estagio.insert',
      convert: (mutation) => this.convert(mutation),
      beforeExecute: async (items) => {
        for (const item of items) {
          item.CodPercursoEstagio = (await this.repository.sequence())?.Valor ?? 0;
        }
      },
      execute: async (items) => this.repository.insert(items),
      responseMap: (item) => item.toJson(),
    });

    registrar.mutation({
      eventSuffix: 'expedicao.percurso.estagio.update',
      convert: (mutation) => this.convert(mutation),
      execute: async (items) => this.repository.update(items),
      responseMap: (item) => item.toJson(),
    });

    registrar.mutation({
      eventSuffix: 'expedicao.percurso.estagio.delete',
      convert: (mutation) => this.convert(mutation),
      execute: async (items) => this.repository.delete(items),
      responseMap: (item) => item.toJson(),
    });
  }

  private convert(mutations: unknown[] | unknown): ExpedicaoPercursoEstagioDto[] {
    return convertSocketMutationPayload(
      mutations,
      (mutation) => ExpedicaoPercursoEstagioDto.fromObject(mutation),
      { eventName: 'expedicao.percurso.estagio.mutation' },
    );
  }
}
