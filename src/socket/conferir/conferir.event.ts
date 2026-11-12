import { Server as SocketIOServer, Socket } from 'socket.io';
import { pageLimitForGroups, Pagination, Params } from '../../contracts/local.base.params';

import ExpedicaoMutationBasicEvent from '../../model/expedicao.basic.mutation.event';
import ExpedicaoConferirConsultaDto from '../../dto/expedicao/expedicao.conferir.consulta.dto';
import ExpedicaoConferirDto from '../../dto/expedicao/expedicao.conferir.dto';
import ExpedicaoSituacaoModel from '../../model/expedicao.situacao.model';
import ConferirRepository from './conferir.repository';
import {
  convertSocketMutationPayload,
  requireSequenceValue,
  withSocketRequest,
} from '../socket.event.helpers';
import { conferirDuplicateOriginError } from '../../utils/repository.error';

export default class ConferirEvent {
  private repository = new ConferirRepository();

  constructor(io: SocketIOServer, socket: Socket) {
    const client = socket.id;

    socket.on(`${client} conferir.consulta`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} conferir.consulta`,
        eventName: 'conferir.consulta',
        kind: 'query',
      }, async ({ request, emitQuery }) => {
        const result = await this.repository.consulta(request.where as Params[], request.pagination, request.orderBy);
        emitQuery(result.map((item) => item.toJson()));
      });
    });

    socket.on(`${client} carrinho.conferir.consulta`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} carrinho.conferir.consulta`,
        eventName: 'carrinho.conferir.consulta',
        kind: 'query',
      }, async ({ request, emitQuery }) => {
        const result = await this.repository.carrinhoConferirConsulta(
          request.where as Params[],
          request.pagination,
          request.orderBy,
        );
        emitQuery(result.map((item) => item.toJson()));
      });
    });

    socket.on(`${client} conferir.select`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} conferir.select`,
        eventName: 'conferir.select',
        kind: 'query',
      }, async ({ request, emitQuery }) => {
        const result = await this.repository.select(request.where as Params[], request.pagination, request.orderBy);
        emitQuery(result.map((item) => item.toJson()));
      });
    });

    socket.on(`${client} conferir.insert`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} conferir.insert`,
        eventName: 'conferir.insert',
        kind: 'mutation',
      }, async ({ request, emitMutation, emitListen }) => {
        const itens = this.convert(request.mutation);
        await this.assertUniqueOrigin(itens);
        for (const item of itens) {
          if (item.CodConferir <= 0) {
            item.CodConferir = requireSequenceValue(await this.repository.sequence(), 'ConferirEstoque');
          }
        }
        await this.repository.insert(itens);

        const conferirConsulta = await this.loadConferirConsulta(itens);
        emitMutation(itens.map((item) => item.toJson()));
        emitListen(
          io,
          'conferir.insert.listen',
          this.createMutationEvent(request.session, request.responseIn, conferirConsulta).toJson(),
        );
      });
    });

    socket.on(`${client} conferir.update`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} conferir.update`,
        eventName: 'conferir.update',
        kind: 'mutation',
      }, async ({ request, emitMutation, emitListen }) => {
        const itens = this.convert(request.mutation);
        await this.repository.update(itens);

        const conferirConsulta = await this.loadConferirConsulta(itens);
        emitMutation(itens.map((item) => item.toJson()));
        emitListen(
          io,
          'conferir.update.listen',
          this.createMutationEvent(request.session, request.responseIn, conferirConsulta).toJson(),
        );
      });
    });

    socket.on(`${client} conferir.delete`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} conferir.delete`,
        eventName: 'conferir.delete',
        kind: 'mutation',
      }, async ({ request, emitMutation, emitListen }) => {
        const itens = this.convert(request.mutation);
        const conferirConsulta = await this.loadConferirConsulta(itens);
        await this.repository.delete(itens);

        emitMutation(itens.map((item) => item.toJson()));
        emitListen(
          io,
          'conferir.delete.listen',
          this.createMutationEvent(request.session, request.responseIn, conferirConsulta).toJson(),
        );
      });
    });
  }

  private createMutationEvent(
    session: string,
    responseIn: string,
    items: Array<{ toJson(): unknown }>,
  ): ExpedicaoMutationBasicEvent {
    return new ExpedicaoMutationBasicEvent({
      Session: session,
      ResponseIn: responseIn,
      Mutation: items.map((item) => item.toJson()),
    });
  }

  private async assertUniqueOrigin(itens: ExpedicaoConferirDto[]): Promise<void> {
    for (const item of itens) {
      const result = await this.repository.select([
        Params.equals('CodEmpresa', item.CodEmpresa),
        Params.equals('Origem', item.Origem),
        Params.equals('CodOrigem', item.CodOrigem),
        Params.notIn('Situacao', [ExpedicaoSituacaoModel.cancelada]),
      ]);

      if (result.length > 0) {
        throw conferirDuplicateOriginError();
      }
    }
  }

  private loadConferirConsulta(itens: ExpedicaoConferirDto[]): Promise<ExpedicaoConferirConsultaDto[]> {
    const groups = Array.from(
      new Map(
        itens.map((item) => [
          `${item.CodEmpresa}:${item.CodConferir}`,
          [Params.equals('CodEmpresa', item.CodEmpresa), Params.equals('CodConferir', item.CodConferir)],
        ]),
      ).values(),
    );
    return this.repository.consultaAny(groups, Pagination.create(pageLimitForGroups(groups.length, 2)));
  }

  private convert(mutations: any[] | any): ExpedicaoConferirDto[] {
    return convertSocketMutationPayload(
      mutations,
      (mutation) => ExpedicaoConferirDto.fromObject(mutation),
      { eventName: 'conferir.mutation', requiredKeys: ['CodEmpresa', 'Origem', 'CodOrigem'] },
    );
  }
}
