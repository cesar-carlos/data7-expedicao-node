import { Server as SocketIOServer, Socket } from 'socket.io';
import { pageLimitForGroups, Pagination, Params } from '../../contracts/local.base.params';

import SepararItemRepository from '../separar.item/separar.item.repository';
import ExpedicaoMutationBasicEvent from '../../model/expedicao.basic.mutation.event';
import ExpedicaoItemSeparacaoConsultaDto from '../../dto/expedicao/expedicao.item.separacao.consulta.dto';
import ExpedicaoItemSepararConsultaDto from '../../dto/expedicao/expedicao.item.separar.consulta.dto';
import ExpedicaoItemSeparacaoDto from '../../dto/expedicao/expedicao.item.separacao.dto';
import SeparacaoItemRepository from './separacao.item.repository';
import {
  convertSocketMutationPayload,
  mapWithConcurrency,
  normalizeExpedicaoItemSequenceKey,
  withSocketRequest,
} from '../socket.event.helpers';
import { homogeneousEquals, mapConsultaInChunks, refreshWhere } from '../common/mutation.refresh.where';

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
        if (itensMutation.length === 0) {
          emitMutation([]);
          return;
        }

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
        if (itensMutation.length === 0) {
          emitMutation([]);
          return;
        }

        await this.repository.update(itensMutation);
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
        if (itensMutation.length === 0) {
          emitMutation([]);
          return;
        }

        const itensSeparacaoConsulta = await this.loadItensSeparacaoConsulta(itensMutation);
        await this.repository.delete(itensMutation);
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
        allowEmpty: true,
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
    if (produtos.length === 0) return [];

    await mapWithConcurrency(produtos, async (produto) => {
      const params = this.buildProdutoSeparadoParams(produto);
      const [quantidadeSeparada, separarItem] = await Promise.all([
        this.repository.sumQuantidadeAtiva(produto),
        this.separarItemRepository.select(params, Pagination.create(5)),
      ]);

      if (separarItem.length === 0) return;
      const item = separarItem[0];
      if (item.QuantidadeSeparacao === quantidadeSeparada) return;
      item.QuantidadeSeparacao = quantidadeSeparada;
      await this.separarItemRepository.update([item]);
    });

    const documento = homogeneousEquals(produtos, ['CodEmpresa', 'CodSepararEstoque']);
    if (documento) {
      return mapConsultaInChunks(
        (params, pagination) => this.separarItemRepository.consulta(params, pagination),
        documento,
        'CodProduto',
        [...new Set(produtos.map((produto) => produto.CodProduto))],
        20,
      );
    }

    return this.separarItemRepository.consultaAny(
      produtos.map((produto) => this.buildProdutoSeparadoParams(produto)),
      Pagination.create(pageLimitForGroups(produtos.length, 20)),
    );
  }

  private async loadItensSeparacaoConsulta(
    items: ExpedicaoItemSeparacaoDto[],
  ): Promise<ExpedicaoItemSeparacaoConsultaDto[]> {
    const where = refreshWhere(
      items,
      ['CodEmpresa', 'CodSepararEstoque', 'CodCarrinhoPercurso', 'ItemCarrinhoPercurso'],
      ['CodEmpresa', 'CodSepararEstoque', 'Item'],
    );
    if (where.mode === 'single') {
      return this.repository.consulta(where.params, Pagination.create(pageLimitForGroups(items.length)));
    }
    if (where.groups.length === 0) return [];
    return this.repository.consultaAny(where.groups, Pagination.create(pageLimitForGroups(where.groups.length)));
  }

  private buildProdutoSeparadoParams(produto: ProdutoSeparar): Params[] {
    return [
      Params.equals('CodEmpresa', produto.CodEmpresa),
      Params.equals('CodSepararEstoque', produto.CodSepararEstoque),
      Params.equals('CodProduto', produto.CodProduto),
    ];
  }
}
