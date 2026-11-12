import { Server as SocketIOServer, Socket } from 'socket.io';
import { pageLimitForGroups, Pagination, Params } from '../../contracts/local.base.params';

import ExpedicaoSepararDto from '../../dto/expedicao/expedicao.separar.dto';
import ExpedicaoMutationListenEvent from '../../model/expedicao.mutation.listen.event';
import ExpedicaoSepararConsultaDto from '../../dto/expedicao/expedicao.separar.consulta.dto';
import ExpedicaoProgressoSeparacaoConsultaDto from '../../dto/expedicao/expedicao.progresso.separacao.consulta.dto';
import ExpedicaoItemImpressoConsultaDto from '../../dto/expedicao/expedicao.item.impresso.consulta.dto';
import SepararRepository from './separar.repository';
import {
  convertSocketMutationPayload,
  requireSequenceValue,
  withSocketRequest,
} from '../socket.event.helpers';

export default class SepararEvent {
  private repository = new SepararRepository();

  constructor(io: SocketIOServer, socket: Socket) {
    const client = socket.id;

    socket.on(`${client} separar.consulta`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} separar.consulta`,
        eventName: 'separar.consulta',
        kind: 'query',
      }, async ({ request, emitQuery }) => {
        const result: ExpedicaoSepararConsultaDto[] = await this.repository.consulta(
          request.where as Params[],
          request.pagination,
          request.orderBy,
        );
        emitQuery(result.map((item) => item.toJson()));
      });
    });

    socket.on(`${client} separar.progresso.consulta`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} separar.progresso.consulta`,
        eventName: 'separar.progresso.consulta',
        kind: 'query',
      }, async ({ request, emitQuery }) => {
        const result: ExpedicaoProgressoSeparacaoConsultaDto[] = await this.repository.consultaProgressoSeparacao(
          request.where as Params[],
          request.pagination,
          request.orderBy,
        );
        emitQuery(result.map((item) => item.toObject()));
      });
    });

    socket.on(`${client} separar.estoque.item.impresso.consulta`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} separar.estoque.item.impresso.consulta`,
        eventName: 'separar.estoque.item.impresso.consulta',
        kind: 'query',
        defaultWhere: [],
      }, async ({ request, emitQuery }) => {
        const result: ExpedicaoItemImpressoConsultaDto[] = await this.repository.consultaSepararEstoqueItemImpresso(
          request.where as Params[],
          request.pagination,
          request.orderBy,
        );
        emitQuery(result.map((item) => item.toJson()));
      });
    });

    socket.on(`${client} separar.select`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} separar.select`,
        eventName: 'separar.select',
        kind: 'query',
      }, async ({ request, emitQuery }) => {
        const result = await this.repository.select(request.where as Params[], request.pagination, request.orderBy);
        emitQuery(result.map((item) => item.toJson()));
      });
    });

    socket.on(`${client} separar.insert`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} separar.insert`,
        eventName: 'separar.insert',
        kind: 'mutation',
      }, async ({ request, emitMutation, emitListen }) => {
        const itens = this.convert(request.mutation);
        for (const item of itens) {
          if (item.CodSepararEstoque <= 0) {
            item.CodSepararEstoque = requireSequenceValue(await this.repository.sequence(), 'SepararEstoque');
          }
        }
        await this.repository.insert(itens);

        const separarConsulta = await this.loadSepararConsulta(itens);
        emitMutation(itens.map((item) => item.toJson()));
        emitListen(
          io,
          'separar.insert.listen',
          new ExpedicaoMutationListenEvent({
            Mutation: separarConsulta.map((item) => item.toJson()),
          }).toJson(),
        );
      });
    });

    socket.on(`${client} separar.update`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} separar.update`,
        eventName: 'separar.update',
        kind: 'mutation',
      }, async ({ request, emitMutation, emitListen }) => {
        const itens = this.convert(request.mutation);
        await this.repository.update(itens);

        const separarConsulta = await this.loadSepararConsulta(itens);
        emitMutation(itens.map((item) => item.toJson()));
        emitListen(
          io,
          'separar.update.listen',
          new ExpedicaoMutationListenEvent({
            Mutation: separarConsulta.map((item) => item.toJson()),
          }).toJson(),
        );
      });
    });

    socket.on(`${client} separar.delete`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} separar.delete`,
        eventName: 'separar.delete',
        kind: 'mutation',
      }, async ({ request, emitMutation, emitListen }) => {
        const itens = this.convert(request.mutation);
        const separarConsulta = await this.loadSepararConsulta(itens);
        await this.repository.delete(itens);

        emitMutation(itens.map((item) => item.toJson()));
        emitListen(
          io,
          'separar.delete.listen',
          new ExpedicaoMutationListenEvent({
            Mutation: separarConsulta.map((item) => item.toJson()),
          }).toJson(),
        );
      });
    });
  }

  private loadSepararConsulta(itens: ExpedicaoSepararDto[]): Promise<ExpedicaoSepararConsultaDto[]> {
    const groups = Array.from(
      new Map(
        itens.map((item) => [
          `${item.CodEmpresa}:${item.CodSepararEstoque}`,
          [
            Params.equals('CodEmpresa', item.CodEmpresa),
            Params.equals('CodSepararEstoque', item.CodSepararEstoque),
          ],
        ]),
      ).values(),
    );
    return this.repository.consultaAny(groups, Pagination.create(pageLimitForGroups(groups.length, 2)));
  }

  private convert(mutations: any[] | any): ExpedicaoSepararDto[] {
    return convertSocketMutationPayload(
      mutations,
      (mutation) => ExpedicaoSepararDto.fromObject(mutation),
      { eventName: 'separar.mutation', requiredKeys: ['CodEmpresa', 'Origem', 'CodOrigem'] },
    );
  }
}
