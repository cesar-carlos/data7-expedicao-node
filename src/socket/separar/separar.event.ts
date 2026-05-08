import { Server as SocketIOServer, Socket } from 'socket.io';
import { Params } from '../../contracts/local.base.params';

import ExpedicaoSepararDto from '../../dto/expedicao/expedicao.separar.dto';
import ExpedicaoMutationBasicEvent from '../../model/expedicao.basic.mutation.event';
import ExpedicaoMutationListenEvent from '../../model/expedicao.mutation.listen.event';
import ExpedicaoSepararConsultaDto from '../../dto/expedicao/expedicao.separar.consulta.dto';
import ExpedicaoProgressoSeparacaoConsultaDto from '../../dto/expedicao/expedicao.progresso.separacao.consulta.dto';
import ExpedicaoItemImpressoConsultaDto from '../../dto/expedicao/expedicao.item.impresso.consulta.dto';
import ExpedicaoBasicSelectEvent from '../../model/expedicao.basic.query.event';
import SepararRepository from './separar.repository';
import { convertSocketMutationPayload, emitSocketError, getSocketPayloadOrEmitError } from '../socket.event.helpers';

export default class SepararEvent {
  private repository = new SepararRepository();

  constructor(io: SocketIOServer, socket: Socket) {
    const client = socket.id;

    socket.on(`${client} separar.consulta`, async (data) => {
      const payload = getSocketPayloadOrEmitError(socket, data, {
        defaultResponseIn: `${client} separar.consulta`,
      });
      if (!payload) return;

      const { session, responseIn, where, pagination, orderBy } = payload;

      try {
        const result: ExpedicaoSepararConsultaDto[] = await this.repository.consulta(
          where as Params[],
          pagination,
          orderBy,
        );
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

    socket.on(`${client} separar.progresso.consulta`, async (data) => {
      const payload = getSocketPayloadOrEmitError(socket, data, {
        defaultResponseIn: `${client} separar.progresso.consulta`,
      });
      if (!payload) return;

      const { session, responseIn, where, pagination, orderBy } = payload;

      try {
        const result: ExpedicaoProgressoSeparacaoConsultaDto[] = await this.repository.consultaProgressoSeparacao(
          where as Params[],
          pagination,
          orderBy,
        );

        const jsonData = result.map((item) => item.toObject());
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

    socket.on(`${client} separar.estoque.item.impresso.consulta`, async (data) => {
      const payload = getSocketPayloadOrEmitError(socket, data, {
        defaultResponseIn: `${client} separar.estoque.item.impresso.consulta`,
        defaultWhere: [],
      });
      if (!payload) return;

      const { session, responseIn, where, pagination, orderBy } = payload;

      try {
        const result: ExpedicaoItemImpressoConsultaDto[] = await this.repository.consultaSepararEstoqueItemImpresso(
          where as Params[],
          pagination,
          orderBy,
        );
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

    socket.on(`${client} separar.select`, async (data) => {
      const payload = getSocketPayloadOrEmitError(socket, data, {
        defaultResponseIn: `${client} separar.select`,
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

    socket.on(`${client} separar.insert`, async (data) => {
      const payload = getSocketPayloadOrEmitError(socket, data, {
        defaultResponseIn: `${client} separar.insert`,
      });
      if (!payload) return;

      const { session, responseIn, mutation } = payload;

      try {
        const itens = this.convert(mutation);
        for (const item of itens) {
          if (item.CodSepararEstoque <= 0) {
            const sequence = await this.repository.sequence();
            item.CodSepararEstoque = sequence?.Valor ?? 0;
          }
          await this.repository.insert([item]);
        }

        const separarConsulta: ExpedicaoSepararConsultaDto[] = [];
        for (const item of itens) {
          const result = await this.repository.consulta([
            Params.equals('CodEmpresa', item.CodEmpresa),
            Params.equals('CodSepararEstoque', item.CodSepararEstoque),
          ]);

          separarConsulta.push(...result);
        }

        const basicEvent = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: itens.map((item) => item.toJson()),
        });

        const listenEvent = new ExpedicaoMutationListenEvent({
          Mutation: separarConsulta.map((item) => item.toJson()),
        });

        socket.emit(responseIn, JSON.stringify(basicEvent.toJson()));
        io.emit('separar.insert.listen', JSON.stringify(listenEvent.toJson()));
      } catch (error) {
        emitSocketError(socket, responseIn, session, error);
      }
    });

    socket.on(`${client} separar.update`, async (data) => {
      const payload = getSocketPayloadOrEmitError(socket, data, {
        defaultResponseIn: `${client} separar.update`,
      });
      if (!payload) return;

      const { session, responseIn, mutation } = payload;

      try {
        const itens = this.convert(mutation);
        await this.repository.update(itens);

        const separarConsulta: ExpedicaoSepararConsultaDto[] = [];
        for (const item of itens) {
          const result = await this.repository.consulta([
            Params.equals('CodEmpresa', item.CodEmpresa),
            Params.equals('CodSepararEstoque', item.CodSepararEstoque),
          ]);

          separarConsulta.push(...result);
        }

        const basicEvent = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: itens.map((item) => item.toJson()),
        });

        const listenEvent = new ExpedicaoMutationListenEvent({
          Mutation: separarConsulta.map((item) => item.toJson()),
        });

        socket.emit(responseIn, JSON.stringify(basicEvent.toJson()));
        io.emit('separar.update.listen', JSON.stringify(listenEvent.toJson()));
      } catch (error) {
        emitSocketError(socket, responseIn, session, error);
      }
    });

    socket.on(`${client} separar.delete`, async (data) => {
      const payload = getSocketPayloadOrEmitError(socket, data, {
        defaultResponseIn: `${client} separar.delete`,
      });
      if (!payload) return;

      const { session, responseIn, mutation } = payload;

      try {
        const itens = this.convert(mutation);

        const separarConsulta: ExpedicaoSepararConsultaDto[] = [];
        for (const item of itens) {
          const result = await this.repository.consulta([
            Params.equals('CodEmpresa', item.CodEmpresa),
            Params.equals('CodSepararEstoque', item.CodSepararEstoque),
          ]);

          separarConsulta.push(...result);
        }

        await this.repository.delete(itens);

        const basicEvent = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: itens.map((item) => item.toJson()),
        });

        const listenEvent = new ExpedicaoMutationListenEvent({
          Mutation: separarConsulta.map((item) => item.toJson()),
        });

        socket.emit(responseIn, JSON.stringify(basicEvent.toJson()));
        io.emit('separar.delete.listen', JSON.stringify(listenEvent.toJson()));
      } catch (error) {
        emitSocketError(socket, responseIn, session, error);
      }
    });
  }

  private convert(mutations: any[] | any): ExpedicaoSepararDto[] {
    return convertSocketMutationPayload(
      mutations,
      (mutation) => ExpedicaoSepararDto.fromObject(mutation),
      { eventName: 'separar.mutation' },
    );
  }
}
