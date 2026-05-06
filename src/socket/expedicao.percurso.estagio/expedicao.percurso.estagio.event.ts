import { Server as SocketIOServer, Socket } from 'socket.io';
import { Params } from '../../contracts/local.base.params';

import ExpedicaoPercursoEstagioDto from '../../dto/expedicao/expedicao.percurso.estagio.dto';
import ExpedicaoPercursoEstagioRepository from './expedicao.percurso.estagio.repository';
import { convertSocketMutationPayload, withSocketRequest } from '../socket.event.helpers';

export default class ExpedicaoPercursoEstagioEvent {
  private repository = new ExpedicaoPercursoEstagioRepository();

  constructor(io: SocketIOServer, socket: Socket) {
    const client = socket.id;

    socket.on(`${client} expedicao.percurso.estagio.select`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} expedicao.percurso.estagio.select`,
        eventName: 'expedicao.percurso.estagio.select',
        kind: 'query',
      }, async ({ request, emitQuery }) => {
        const result = await this.repository.select(request.where as Params[], request.pagination, request.orderBy);
        emitQuery(result.map((item) => item.toJson()));
      });
    });

    socket.on(`${client} expedicao.percurso.estagio.insert`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} expedicao.percurso.estagio.insert`,
        eventName: 'expedicao.percurso.estagio.insert',
        kind: 'mutation',
      }, async ({ request, emitMutation }) => {
        const itens = this.convert(request.mutation);
        for (const item of itens) {
          const sequence = await this.repository.sequence();
          item.CodPercursoEstagio = sequence?.Valor ?? 0;
          await this.repository.insert([item]);
        }

        emitMutation(itens.map((item) => item.toJson()));
      });
    });

    socket.on(`${client} expedicao.percurso.estagio.update`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} expedicao.percurso.estagio.update`,
        eventName: 'expedicao.percurso.estagio.update',
        kind: 'mutation',
      }, async ({ request, emitMutation }) => {
        const itens = this.convert(request.mutation);
        await this.repository.update(itens);

        emitMutation(itens.map((item) => item.toJson()));
      });
    });

    socket.on(`${client} expedicao.percurso.estagio.delete`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} expedicao.percurso.estagio.delete`,
        eventName: 'expedicao.percurso.estagio.delete',
        kind: 'mutation',
      }, async ({ request, emitMutation }) => {
        const itens = this.convert(request.mutation);
        await this.repository.delete(itens);

        emitMutation(itens.map((item) => item.toJson()));
      });
    });
  }

  private convert(mutations: any[] | any): ExpedicaoPercursoEstagioDto[] {
    return convertSocketMutationPayload(
      mutations,
      (mutation) => ExpedicaoPercursoEstagioDto.fromObject(mutation),
      { eventName: 'expedicao.percurso.estagio.mutation' },
    );
  }
}
