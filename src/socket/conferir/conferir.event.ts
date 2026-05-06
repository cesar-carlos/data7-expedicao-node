import { Server as SocketIOServer, Socket } from 'socket.io';
import { Params } from '../../contracts/local.base.params';

import ExpedicaoBasicErrorEvent from '../../model/expedicao.basic.error.event';
import ExpedicaoMutationBasicEvent from '../../model/expedicao.basic.mutation.event';
import ExpedicaoConferirConsultaDto from '../../dto/expedicao/expedicao.conferir.consulta.dto';
import ExpedicaoBasicSelectEvent from '../../model/expedicao.basic.query.event';
import ExpedicaoConferirDto from '../../dto/expedicao/expedicao.conferir.dto';
import ExpedicaoSituacaoModel from '../../model/expedicao.situacao.model';
import ConferirRepository from './conferir.repository';
import { convertSocketMutationPayload, emitSocketError, getSocketPayloadOrEmitError } from '../socket.event.helpers';

export default class ConferirEvent {
  private repository = new ConferirRepository();

  constructor(io: SocketIOServer, socket: Socket) {
    const client = socket.id;

    socket.on(`${client} conferir.consulta`, async (data) => {
      const payload = getSocketPayloadOrEmitError(socket, data, {
        defaultResponseIn: `${client} conferir.consulta`,
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

    socket.on(`${client} carrinho.conferir.consulta`, async (data) => {
      const payload = getSocketPayloadOrEmitError(socket, data, {
        defaultResponseIn: `${client} carrinho.conferir.consulta`,
      });
      if (!payload) return;

      const { session, responseIn, where, pagination, orderBy } = payload;

      try {
        const result = await this.repository.carrinhoConferirConsulta(where as Params[], pagination, orderBy);
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

    socket.on(`${client} conferir.select`, async (data) => {
      const payload = getSocketPayloadOrEmitError(socket, data, {
        defaultResponseIn: `${client} conferir.select`,
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

    socket.on(`${client} conferir.insert`, async (data) => {
      const payload = getSocketPayloadOrEmitError(socket, data, {
        defaultResponseIn: `${client} conferir.insert`,
      });
      if (!payload) return;

      const { session, responseIn, mutation } = payload;

      try {
        const itens = this.convert(mutation);

        //PROTEGE CONTRA DUPLICIDADE DE ORIGEM
        let duplicateOrigin = false;
        for (const item of itens) {
          const result = await this.repository.select([
            Params.equals('CodEmpresa', item.CodEmpresa),
            Params.equals('Origem', item.Origem),
            Params.equals('CodOrigem', item.CodOrigem),
            Params.notIn('Situacao', [ExpedicaoSituacaoModel.cancelada]),
          ]);

          if (result.length > 0) {
            duplicateOrigin = true;
            break;
          }
        }

        if (duplicateOrigin) {
          const basicEventErro = new ExpedicaoBasicErrorEvent({
            Session: session,
            ResponseIn: responseIn,
            Error: ['Origem duplicada, proibido inserir cancelado'],
          });

          socket.emit(responseIn, JSON.stringify(basicEventErro.toJson()));
          return;
        }

        for (const item of itens) {
          if (item.CodConferir <= 0) {
            const sequence = await this.repository.sequence();
            item.CodConferir = sequence?.Valor ?? 0;
          }
          await this.repository.insert([item]);
        }

        const conferirConsulta: ExpedicaoConferirConsultaDto[] = [];
        for (const item of itens) {
          const result = await this.repository.consulta([
            Params.equals('CodEmpresa', item.CodEmpresa),
            Params.equals('CodConferir', item.CodConferir),
          ]);

          conferirConsulta.push(...result);
        }

        const basicEvent = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: itens.map((item) => item.toJson()),
        });

        const basicEventConferirConsulta = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: conferirConsulta.map((item) => item.toJson()),
        });

        socket.emit(responseIn, JSON.stringify(basicEvent.toJson()));
        io.emit('conferir.insert.listen', JSON.stringify(basicEventConferirConsulta.toJson()));
      } catch (error) {
        emitSocketError(socket, responseIn, session, error);
      }
    });

    socket.on(`${client} conferir.update`, async (data) => {
      const payload = getSocketPayloadOrEmitError(socket, data, {
        defaultResponseIn: `${client} conferir.update`,
      });
      if (!payload) return;

      const { session, responseIn, mutation } = payload;

      try {
        const itens = this.convert(mutation);
        await this.repository.update(itens);

        const conferirConsulta: ExpedicaoConferirConsultaDto[] = [];
        for (const item of itens) {
          const result = await this.repository.consulta([
            Params.equals('CodEmpresa', item.CodEmpresa),
            Params.equals('CodConferir', item.CodConferir),
          ]);

          conferirConsulta.push(...result);
        }

        const basicEvent = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: itens.map((item) => item.toJson()),
        });

        const basicEventConferirConsulta = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: conferirConsulta.map((item) => item.toJson()),
        });

        socket.emit(responseIn, JSON.stringify(basicEvent.toJson()));
        io.emit('conferir.update.listen', JSON.stringify(basicEventConferirConsulta.toJson()));
      } catch (error) {
        emitSocketError(socket, responseIn, session, error);
      }
    });

    socket.on(`${client} conferir.delete`, async (data) => {
      const payload = getSocketPayloadOrEmitError(socket, data, {
        defaultResponseIn: `${client} conferir.delete`,
      });
      if (!payload) return;

      const { session, responseIn, mutation } = payload;

      try {
        const itens = this.convert(mutation);

        const conferirConsulta: ExpedicaoConferirConsultaDto[] = [];
        for (const item of itens) {
          const result = await this.repository.consulta([
            Params.equals('CodEmpresa', item.CodEmpresa),
            Params.equals('CodConferir', item.CodConferir),
          ]);

          conferirConsulta.push(...result);
        }

        await this.repository.delete(itens);

        const basicEvent = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: itens.map((item) => item.toJson()),
        });

        const basicEventConferirConsulta = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: conferirConsulta.map((item) => item.toJson()),
        });

        socket.emit(responseIn, JSON.stringify(basicEvent.toJson()));
        io.emit('conferir.delete.listen', JSON.stringify(basicEventConferirConsulta.toJson()));
      } catch (error) {
        emitSocketError(socket, responseIn, session, error);
      }
    });
  }

  private convert(mutations: any[] | any): ExpedicaoConferirDto[] {
    return convertSocketMutationPayload(
      mutations,
      (mutation) => ExpedicaoConferirDto.fromObject(mutation),
      { eventName: 'conferir.mutation', requiredKeys: ['CodEmpresa', 'Origem', 'CodOrigem'] },
    );
  }
}
