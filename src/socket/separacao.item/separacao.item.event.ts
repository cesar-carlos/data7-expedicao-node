import { Server as SocketIOServer, Socket } from 'socket.io';
import { Params } from '../../contracts/local.base.params';

import SepararItemRepository from '../separar.item/separar.item.repository';
import ExpedicaoMutationBasicEvent from '../../model/expedicao.basic.mutation.event';
import ExpedicaoItemSeparacaoConsultaDto from '../../dto/expedicao/expedicao.item.separacao.consulta.dto';
import ExpedicaoItemSepararConsultaDto from '../../dto/expedicao/expedicao.item.separar.consulta.dto';
import ExpedicaoItemSeparacaoDto from '../../dto/expedicao/expedicao.item.separacao.dto';
import ExpedicaoItemSituacaoModel from '../../model/expedicao.item.situacao.model';
import SeparacaoItemRepository from './separacao.item.repository';
import {
  convertSocketMutationPayload,
  mapWithConcurrency,
  normalizeExpedicaoItemSequenceKey,
  withSocketRequest,
} from '../socket.event.helpers';

type ProdutoSeparar = {
  CodEmpresa: number;
  CodSepararEstoque: number;
  CodProduto: number;
};

export default class SeparacaoItemEvent {
  private repository = new SeparacaoItemRepository();
  private separarItemRepository = new SepararItemRepository();

  constructor(io: SocketIOServer, socket: Socket) {
    const client = socket.id;

    socket.on(`${client} separacao.item.resumo.consulta`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} separacao.item.resumo.consulta`,
        eventName: 'separacao.item.resumo.consulta',
        kind: 'query',
      }, async ({ request, emitQuery }) => {
        const result = await this.repository.consultaResumo(request.where as Params[], request.pagination, request.orderBy);
        emitQuery(result.map((item) => item.toJson()));
      });
    });

    socket.on(`${client} separacao.item.consulta`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} separacao.item.consulta`,
        eventName: 'separacao.item.consulta',
        kind: 'query',
      }, async ({ request, emitQuery }) => {
        const result = await this.repository.consulta(request.where as Params[], request.pagination, request.orderBy);
        emitQuery(result.map((item) => item.toJson()));
      });
    });

    socket.on(`${client} separacao.item.select`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} separacao.item.select`,
        eventName: 'separacao.item.select',
        kind: 'query',
      }, async ({ request, emitQuery }) => {
        const result = await this.repository.select(request.where as Params[], request.pagination, request.orderBy);
        emitQuery(result.map((item) => item.toJson()));
      });
    });

    socket.on(`${client} separacao.item.insert`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} separacao.item.insert`,
        eventName: 'separacao.item.insert',
        kind: 'mutation',
      }, async ({ request, emitMutation, emitListen }) => {
        const itensMutation = this.convert(request.mutation);
        const inserteds = await this.repository.insert(itensMutation);
        const refresh = await this.buildRefreshPayload(inserteds);

        const responseEvent = this.createMutationEvent(request.session, request.responseIn, inserteds);
        const separacaoListenEvent = this.createMutationEvent(
          request.session,
          request.responseIn,
          refresh.itensSeparacaoConsulta,
        );
        const separarListenEvent = this.createMutationEvent(
          request.session,
          request.responseIn,
          refresh.itensSepararConsulta,
        );

        emitMutation(responseEvent.Mutation ?? inserteds.map((item) => item.toJson()));
        emitListen(io, 'separacao.item.insert.listen', separacaoListenEvent.toJson());
        emitListen(io, 'separar.item.consulta.update.listen', separarListenEvent.toJson());
      });
    });

    socket.on(`${client} separacao.item.update`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} separacao.item.update`,
        eventName: 'separacao.item.update',
        kind: 'mutation',
      }, async ({ request, emitMutation, emitListen }) => {
        const itensMutation = this.convert(request.mutation);
        await this.updateOneByOne(itensMutation);
        const refresh = await this.buildRefreshPayload(itensMutation);

        const responseEvent = this.createMutationEvent(request.session, request.responseIn, itensMutation);
        const separacaoListenEvent = this.createMutationEvent(
          request.session,
          request.responseIn,
          refresh.itensSeparacaoConsulta,
        );
        const separarListenEvent = this.createMutationEvent(
          request.session,
          request.responseIn,
          refresh.itensSepararConsulta,
        );

        emitMutation(responseEvent.Mutation ?? itensMutation.map((item) => item.toJson()));
        emitListen(io, 'separacao.item.update.listen', separacaoListenEvent.toJson());
        emitListen(io, 'separar.item.consulta.update.listen', separarListenEvent.toJson());
      });
    });

    socket.on(`${client} separacao.item.delete`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} separacao.item.delete`,
        eventName: 'separacao.item.delete',
        kind: 'mutation',
      }, async ({ request, emitMutation, emitListen }) => {
        const itensMutation = this.convert(request.mutation);
        const itensSeparacaoConsulta = await this.loadItensSeparacaoConsulta(itensMutation);
        await this.deleteOneByOne(itensMutation);
        const produtosSeparado = this.buildProdutosSeparado(itensMutation);
        const itensSepararConsulta = await this.refreshItensSepararConsulta(produtosSeparado);

        const responseEvent = this.createMutationEvent(request.session, request.responseIn, itensMutation);
        const separacaoListenEvent = this.createMutationEvent(
          request.session,
          request.responseIn,
          itensSeparacaoConsulta,
        );
        const separarListenEvent = this.createMutationEvent(
          request.session,
          request.responseIn,
          itensSepararConsulta,
        );

        emitMutation(responseEvent.Mutation ?? itensMutation.map((item) => item.toJson()));
        emitListen(io, 'separacao.item.delete.listen', separacaoListenEvent.toJson());
        emitListen(io, 'separar.item.consulta.update.listen', separarListenEvent.toJson());
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

  private async buildRefreshPayload(items: ExpedicaoItemSeparacaoDto[]): Promise<{
    itensSepararConsulta: ExpedicaoItemSepararConsultaDto[];
    itensSeparacaoConsulta: ExpedicaoItemSeparacaoConsultaDto[];
  }> {
    const produtosSeparado = this.buildProdutosSeparado(items);
    const [itensSepararConsulta, itensSeparacaoConsulta] = await Promise.all([
      this.refreshItensSepararConsulta(produtosSeparado),
      this.loadItensSeparacaoConsulta(items),
    ]);

    return {
      itensSepararConsulta,
      itensSeparacaoConsulta,
    };
  }

  private async updateOneByOne(items: ExpedicaoItemSeparacaoDto[]): Promise<void> {
    for (const item of items) {
      await this.repository.update([item]);
    }
  }

  private async deleteOneByOne(items: ExpedicaoItemSeparacaoDto[]): Promise<void> {
    for (const item of items) {
      await this.repository.delete([item]);
    }
  }

  private convert(mutations: any[] | any): ExpedicaoItemSeparacaoDto[] {
    return convertSocketMutationPayload(
      mutations,
      (mutation) =>
        ExpedicaoItemSeparacaoDto.fromObject({
          ...mutation,
          Item: normalizeExpedicaoItemSequenceKey(mutation.Item),
        }),
      {
        eventName: 'separacao.item.mutation',
        requiredKeys: ['CodEmpresa', 'CodSepararEstoque', 'CodCarrinhoPercurso', 'ItemCarrinhoPercurso', 'CodProduto'],
      },
    );
  }

  private buildProdutosSeparado(items: ExpedicaoItemSeparacaoDto[]): ProdutoSeparar[] {
    return Array.from(
      new Map(
        items.map((item) => [
          `${item.CodEmpresa}:${item.CodSepararEstoque}:${item.CodProduto}`,
          {
            CodEmpresa: item.CodEmpresa,
            CodSepararEstoque: item.CodSepararEstoque,
            CodProduto: item.CodProduto,
          },
        ]),
      ).values(),
    );
  }

  private async refreshItensSepararConsulta(produtos: ProdutoSeparar[]): Promise<ExpedicaoItemSepararConsultaDto[]> {
    const consultas = await mapWithConcurrency(
      produtos,
      async (produto) => {
        const params = this.buildProdutoSeparadoParams(produto);
        const [separados, separarItem] = await Promise.all([
          this.repository.select(params),
          this.separarItemRepository.select(params),
        ]);

        const quantidadeSeparada = separados.reduce((acc, cur) => {
          return cur.Situacao != ExpedicaoItemSituacaoModel.cancelado ? acc + cur.Quantidade : acc;
        }, 0);

        if (separarItem.length > 0) {
          const item = separarItem[0];
          item.QuantidadeSeparacao = quantidadeSeparada;
          await this.separarItemRepository.update([item]);
          return this.separarItemRepository.consulta(params);
        }

        return this.separarItemRepository.consulta(params);
      },
    );

    return consultas.flat();
  }

  private async loadItensSeparacaoConsulta(
    items: ExpedicaoItemSeparacaoDto[],
  ): Promise<ExpedicaoItemSeparacaoConsultaDto[]> {
    const queryParams = Array.from(
      new Map(
        items.map((item) => [
          `${item.CodEmpresa}:${item.CodSepararEstoque}:${item.Item}`,
          [
            Params.equals('CodEmpresa', item.CodEmpresa),
            Params.equals('CodSepararEstoque', item.CodSepararEstoque),
            Params.equals('Item', item.Item),
          ],
        ]),
      ).values(),
    );
    const consultas = await mapWithConcurrency(queryParams, (params) => this.repository.consulta(params));

    return consultas.flat();
  }

  private buildProdutoSeparadoParams(produto: ProdutoSeparar): Params[] {
    return [
      Params.equals('CodEmpresa', produto.CodEmpresa),
      Params.equals('CodSepararEstoque', produto.CodSepararEstoque),
      Params.equals('CodProduto', produto.CodProduto),
    ];
  }
}
