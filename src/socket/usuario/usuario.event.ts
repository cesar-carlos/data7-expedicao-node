import { Server as SocketIOServer, Socket } from 'socket.io';
import { Params } from '../../contracts/local.base.params';

import UsuarioDto from '../../dto/common.data/usuario';
import ExpedicaoMutationBasicEvent from '../../model/expedicao.basic.mutation.event';
import ExpedicaoBasicSelectEvent from '../../model/expedicao.basic.query.event';
import UsuarioConsultaDto from '../../dto/common.data/usuario.consulta.dto';
import UsuarioRepository from './usuario.repository';
import { convertSocketMutationPayload, emitSocketError, getSocketPayloadOrEmitError } from '../socket.event.helpers';

export default class UsuarioEvent {
  private repository = new UsuarioRepository();

  constructor(io: SocketIOServer, socket: Socket) {
    const client = socket.id;

    socket.on(`${client} usuario.consulta`, async (data) => {
      const payload = getSocketPayloadOrEmitError(socket, data, {
        defaultResponseIn: `${client} usuario.consulta`,
      });
      if (!payload) return;

      const { session, responseIn, where, pagination, orderBy } = payload;

      try {
        const result = await this.repository.consulta(where as Params[], pagination, orderBy);
        const jsonData = result.map((item) => item.toJson());

        const event = new ExpedicaoBasicSelectEvent({
          Session: session,
          ResponseIn: responseIn,
          Data: jsonData,
        });

        socket.emit(responseIn, JSON.stringify(event.toJson()));
      } catch (error) {
        emitSocketError(socket, responseIn, session, error);
      }
    });

    socket.on(`${client} usuario.select`, async (data) => {
      const payload = getSocketPayloadOrEmitError(socket, data, {
        defaultResponseIn: `${client} usuario.select`,
      });
      if (!payload) return;

      const { session, responseIn, where, pagination, orderBy } = payload;

      try {
        const result = await this.repository.select(where as Params[], pagination, orderBy);
        const jsonData = result.map((item) => item.toJson());

        const event = new ExpedicaoBasicSelectEvent({
          Session: session,
          ResponseIn: responseIn,
          Data: jsonData,
        });

        socket.emit(responseIn, JSON.stringify(event.toJson()));
      } catch (error) {
        emitSocketError(socket, responseIn, session, error);
      }
    });

    socket.on(`${client} usuario.insert`, async (data) => {
      const payload = getSocketPayloadOrEmitError(socket, data, {
        defaultResponseIn: `${client} usuario.insert`,
      });
      if (!payload) return;

      const { session, responseIn, mutation } = payload;

      try {
        const itens = this.convert(mutation);
        for (const item of itens) {
          const sequence = await this.repository.sequence();
          item.CodUsuario = sequence?.Valor ?? 0;
          await this.repository.insert([item]);
        }

        const usuarioConsulta: UsuarioConsultaDto[] = [];
        for (const item of itens) {
          const result = await this.repository.consulta([Params.equals('CodUsuario', item.CodUsuario)]);
          usuarioConsulta.push(...result);
        }

        const basicEvent = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: itens.map((item) => item.toJson()),
        });

        const basicEventUsuarioConsulta = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: usuarioConsulta.map((item) => item.toJson()),
        });

        socket.emit(responseIn, JSON.stringify(basicEvent.toJson()));
        io.emit('usuario.insert.listen', JSON.stringify(basicEventUsuarioConsulta.toJson()));
      } catch (error) {
        emitSocketError(socket, responseIn, session, error);
      }
    });

    socket.on(`${client} usuario.update`, async (data) => {
      const payload = getSocketPayloadOrEmitError(socket, data, {
        defaultResponseIn: `${client} usuario.update`,
      });
      if (!payload) return;

      const { session, responseIn, mutation } = payload;

      try {
        const itens = this.convert(mutation);
        await this.repository.update(itens);

        const usuarioConsulta: UsuarioConsultaDto[] = [];
        for (const item of itens) {
          const result = await this.repository.consulta([Params.equals('CodUsuario', item.CodUsuario)]);
          usuarioConsulta.push(...result);
        }

        const basicEvent = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: itens.map((item) => item.toJson()),
        });

        const basicEventUsuaroConsulta = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: usuarioConsulta.map((item) => item.toJson()),
        });

        socket.emit(responseIn, JSON.stringify(basicEvent.toJson()));
        io.emit('usuario.update.listen', JSON.stringify(basicEventUsuaroConsulta.toJson()));
      } catch (error) {
        emitSocketError(socket, responseIn, session, error);
      }
    });

    socket.on(`${client} usuario.delete`, async (data) => {
      const payload = getSocketPayloadOrEmitError(socket, data, {
        defaultResponseIn: `${client} usuario.delete`,
      });
      if (!payload) return;

      const { session, responseIn, mutation } = payload;

      try {
        const itens = this.convert(mutation);

        const usuarioConsulta: UsuarioConsultaDto[] = [];
        for (const item of itens) {
          const result = await this.repository.consulta([Params.equals('CodUsuario', item.CodUsuario)]);
          usuarioConsulta.push(...result);
        }

        await this.repository.delete(itens);

        const basicEvent = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: itens.map((item) => item.toJson()),
        });

        const basicEventUsuarioConsulta = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: usuarioConsulta.map((item) => item.toJson()),
        });

        socket.emit(responseIn, JSON.stringify(basicEvent.toJson()));
        io.emit('usuario.delete.listen', JSON.stringify(basicEventUsuarioConsulta.toJson()));
      } catch (error) {
        emitSocketError(socket, responseIn, session, error);
      }
    });
  }

  private convert(mutations: any[] | any): UsuarioDto[] {
    return convertSocketMutationPayload(
      mutations,
      (mutation) => UsuarioDto.fromObject(mutation),
      { eventName: 'usuario.mutation' },
    );
  }
}
