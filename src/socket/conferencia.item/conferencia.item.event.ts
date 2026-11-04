import { Server as SocketIOServer, Socket } from 'socket.io';
import { pageLimitForGroups, Pagination, Params } from '../../contracts/local.base.params';

import ConferenciaItemRepository from './conferencia.item.repository';
import ExpedicaoMutationBasicEvent from '../../model/expedicao.basic.mutation.event';
import ExpedicaoItemConferenciaConsultaDto from '../../dto/expedicao/expedicao.item.conferencia.consulta.dto';
import CarrinhoPercursoEstagioRepository from '../carrinho.percurso.estagio/carrinho.percurso.estagio.repository';
import ExpedicaoItemConferirConsultaDto from '../../dto/expedicao/expedicao.item.conferir.consulta.dto';
import ExpedicaoItemConferenciaDto from '../../dto/expedicao/expedicao.item.conferencia.dto';
import ExpedicaoItemConferirDto from '../../dto/expedicao/expedicao.item.conferir.dto';
import ConferirItemRepository from '../conferir.item/conferir.item.repository';
import {
  convertSocketMutationPayload,
  mapWithConcurrency,
  normalizeExpedicaoItemSequenceKey,
  withSocketRequest,
} from '../socket.event.helpers';
import { assembleConferenciaConsultaRows } from './conferencia.item.refresh';

type ProdutoConferir = {
  CodEmpresa: number;
  CodConferir: number;
  CodCarrinho: number;
  CodProduto: number;
};

type CarrinhoPercursoEstagioParams = {
  CodEmpresa: number;
  CodCarrinhoPercurso: number;
  ItemCarrinhoPercurso: string;
};

export default class ConferenciaItemEvent {
  private repository = new ConferenciaItemRepository();
  private conferirItemRepository = new ConferirItemRepository();
  private carrinhoPercursoEstagioRepository = new CarrinhoPercursoEstagioRepository();

  constructor(io: SocketIOServer, socket: Socket) {
    const client = socket.id;

    socket.on(`${client} conferencia.item.consulta`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} conferencia.item.consulta`,
        eventName: 'conferencia.item.consulta',
        kind: 'query',
      }, async ({ request, emitQuery }) => {
        const result = await this.repository.consulta(request.where as Params[], request.pagination, request.orderBy);
        emitQuery(result.map((item) => item.toJson()));
      });
    });

    socket.on(`${client} conferencia.item.select`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} conferencia.item.select`,
        eventName: 'conferencia.item.select',
        kind: 'query',
      }, async ({ request, emitQuery }) => {
        const result = await this.repository.select(request.where as Params[], request.pagination, request.orderBy);
        emitQuery(result.map((item) => item.toJson()));
      });
    });

    socket.on(`${client} conferencia.item.insert`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} conferencia.item.insert`,
        eventName: 'conferencia.item.insert',
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
        const conferenciaListenEvent = this.createMutationEvent(
          request.session,
          request.responseIn,
          refresh.itensConferenciaConsulta,
        );
        const conferirListenEvent = this.createMutationEvent(
          request.session,
          request.responseIn,
          refresh.itensConferirConsulta,
        );

        emitMutation(responseEvent.Mutation ?? inserteds.map((item) => item.toJson()));
        emitListen(io, 'conferencia.item.insert.listen', conferenciaListenEvent.toJson());
        emitListen(io, 'conferir.item.update.listen', conferirListenEvent.toJson());
      });
    });

    socket.on(`${client} conferencia.item.update`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} conferencia.item.update`,
        eventName: 'conferencia.item.update',
        kind: 'mutation',
      }, async ({ request, emitMutation, emitListen }) => {
        const itensMutation = this.convert(request.mutation);
        if (itensMutation.length === 0) {
          emitMutation([]);
          return;
        }
        await this.repository.update(itensMutation);
        const refresh = await this.buildRefreshPayload(itensMutation);

        const responseEvent = this.createMutationEvent(
          request.session,
          request.responseIn,
          refresh.itensConferenciaConsulta,
        );
        const conferirListenEvent = this.createMutationEvent(
          request.session,
          request.responseIn,
          refresh.itensConferirConsulta,
        );

        emitMutation(responseEvent.Mutation ?? refresh.itensConferenciaConsulta.map((item) => item.toJson()));
        emitListen(io, 'conferencia.item.update.listen', responseEvent.toJson());
        emitListen(io, 'conferir.item.update.listen', conferirListenEvent.toJson());
      });
    });

    socket.on(`${client} conferencia.item.delete`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} conferencia.item.delete`,
        eventName: 'conferencia.item.delete',
        kind: 'mutation',
      }, async ({ request, emitMutation, emitListen }) => {
        const itensMutation = this.convert(request.mutation);
        if (itensMutation.length === 0) {
          emitMutation([]);
          return;
        }
        const itensConferenciaConsulta = await this.loadItensConferenciaConsulta(itensMutation);
        await this.repository.delete(itensMutation);
        const produtoConferir = await this.buildProdutosConferir(itensMutation);
        const refreshed = await this.refreshItensConferirConsulta(produtoConferir);
        const itensConferirConsulta = refreshed.itensConferirConsulta;

        const responseEvent = this.createMutationEvent(request.session, request.responseIn, itensMutation);
        const conferenciaListenEvent = this.createMutationEvent(
          request.session,
          request.responseIn,
          itensConferenciaConsulta,
        );
        const conferirListenEvent = this.createMutationEvent(
          request.session,
          request.responseIn,
          itensConferirConsulta,
        );

        emitMutation(responseEvent.Mutation ?? itensMutation.map((item) => item.toJson()));
        emitListen(io, 'conferencia.item.delete.listen', conferenciaListenEvent.toJson());
        emitListen(io, 'conferir.item.update.listen', conferirListenEvent.toJson());
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

  private async buildRefreshPayload(items: ExpedicaoItemConferenciaDto[]): Promise<{
    itensConferenciaConsulta: ExpedicaoItemConferenciaConsultaDto[];
    itensConferirConsulta: ExpedicaoItemConferirConsultaDto[];
  }> {
    const produtoConferir = await this.buildProdutosConferir(items);
    const refreshed = await this.refreshItensConferirConsulta(produtoConferir);
    const itensConferenciaConsulta = await this.loadItensConferenciaConsulta(
      items,
      refreshed.itensConferenciaConsulta,
    );

    return {
      itensConferenciaConsulta,
      itensConferirConsulta: refreshed.itensConferirConsulta,
    };
  }

  private convert(mutations: any[] | any): ExpedicaoItemConferenciaDto[] {
    return convertSocketMutationPayload(
      mutations,
      (mutation) =>
        ExpedicaoItemConferenciaDto.fromObject({
          ...mutation,
          Item: normalizeExpedicaoItemSequenceKey(mutation.Item),
        }),
      {
        eventName: 'conferencia.item.mutation',
        requiredKeys: ['CodEmpresa', 'CodConferir', 'CodCarrinhoPercurso', 'ItemCarrinhoPercurso', 'CodProduto'],
        allowEmpty: true,
      },
    );
  }

  private async buildProdutosConferir(items: ExpedicaoItemConferenciaDto[]): Promise<ProdutoConferir[]> {
    const codCarrinhoCache = new Map<string, Promise<number>>();
    const produtos = new Map<string, ProdutoConferir>();

    await Promise.all(
      items.map(async (item) => {
        const codCarrinho = await this.getCodCarrinho({
          CodEmpresa: item.CodEmpresa,
          CodCarrinhoPercurso: item.CodCarrinhoPercurso,
          ItemCarrinhoPercurso: item.ItemCarrinhoPercurso,
        }, codCarrinhoCache);

        const produto = {
          CodEmpresa: item.CodEmpresa,
          CodConferir: item.CodConferir,
          CodCarrinho: codCarrinho,
          CodProduto: item.CodProduto,
        };

        produtos.set(this.getProdutoConferirKey(produto), produto);
      }),
    );

    return Array.from(produtos.values());
  }

  private async refreshItensConferirConsulta(
    produtos: ProdutoConferir[],
  ): Promise<{
    itensConferirConsulta: ExpedicaoItemConferirConsultaDto[];
    itensConferenciaConsulta: ExpedicaoItemConferenciaConsultaDto[];
  }> {
    if (produtos.length === 0) {
      return { itensConferirConsulta: [], itensConferenciaConsulta: [] };
    }

    const groups = produtos.map((produto) => this.buildProdutoConferirParams(produto));
    const [totals, conferirGroups] = await Promise.all([
      this.repository.sumQuantidadeAtiva(groups),
      mapWithConcurrency(produtos, async (produto) => ({
        produto,
        rows: await this.conferirItemRepository.consulta(
          this.buildProdutoConferirParams(produto),
          Pagination.create(pageLimitForGroups(1, 20)),
        ),
      })),
    ]);
    const totalByProduto = new Map(totals.map((total) => [this.getProdutoConferirKey(total), total.Total]));
    const conferirByProduto = new Map(conferirGroups.map((group) => [this.getProdutoConferirKey(group.produto), group.rows]));

    const updates: ExpedicaoItemConferirDto[] = [];
    const itensConferirConsulta: ExpedicaoItemConferirConsultaDto[] = [];

    for (const produto of produtos) {
      const key = this.getProdutoConferirKey(produto);
      const rows = conferirByProduto.get(key) ?? [];
      const quantidadeConferida = totalByProduto.get(key) ?? 0;
      if (rows.length === 0) continue;

      const first = rows[0];
      if (first.QuantidadeConferida !== quantidadeConferida) {
        const itemConferir = ExpedicaoItemConferirDto.fromConsulta(first);
        itemConferir.QuantidadeConferida = quantidadeConferida;
        updates.push(itemConferir);
      }

      itensConferirConsulta.push(
        ...rows.map((item, index) =>
          index === 0 ? item.copyWith({ QuantidadeConferida: quantidadeConferida }) : item,
        ),
      );
    }

    if (updates.length > 0) {
      await this.conferirItemRepository.update(updates);
    }

    return {
      itensConferirConsulta,
      itensConferenciaConsulta: [],
    };
  }

  private async loadItensConferenciaConsulta(
    items: ExpedicaoItemConferenciaDto[],
    alreadyLoaded: ExpedicaoItemConferenciaConsultaDto[] = [],
  ): Promise<ExpedicaoItemConferenciaConsultaDto[]> {
    const planned = assembleConferenciaConsultaRows(items, alreadyLoaded);
    if (planned.missing.length === 0) {
      return planned.rows;
    }

    const fetched = await this.repository.consultaAny(
      planned.missing.map((item) => [
        Params.equals('CodEmpresa', item.CodEmpresa),
        Params.equals('CodConferir', item.CodConferir),
        Params.equals('Item', item.Item),
      ]),
      Pagination.create(pageLimitForGroups(planned.missing.length)),
    );

    return assembleConferenciaConsultaRows(items, alreadyLoaded, fetched).rows;
  }

  private async getCodCarrinho(
    params: CarrinhoPercursoEstagioParams,
    cache?: Map<string, Promise<number>>,
  ): Promise<number> {
    const key = `${params.CodEmpresa}:${params.CodCarrinhoPercurso}:${params.ItemCarrinhoPercurso}`;

    if (cache?.has(key)) {
      return cache.get(key)!;
    }

    const load = this.carrinhoPercursoEstagioRepository.select([
      Params.equals('CodEmpresa', params.CodEmpresa),
      Params.equals('CodCarrinhoPercurso', params.CodCarrinhoPercurso),
      Params.equals('Item', params.ItemCarrinhoPercurso),
    ]).then((result) => result?.shift()?.CodCarrinho ?? 0);

    if (cache) {
      cache.set(key, load);
    }

    return load;
  }

  private getProdutoConferirKey(produto: {
    CodEmpresa: number;
    CodConferir: number;
    CodCarrinho: number;
    CodProduto: number;
  }): string {
    return `${produto.CodEmpresa}:${produto.CodConferir}:${produto.CodCarrinho}:${produto.CodProduto}`;
  }

  private buildProdutoConferirParams(produto: ProdutoConferir): Params[] {
    return [
      Params.equals('CodEmpresa', produto.CodEmpresa),
      Params.equals('CodConferir', produto.CodConferir),
      Params.equals('CodCarrinho', produto.CodCarrinho),
      Params.equals('CodProduto', produto.CodProduto),
    ];
  }
}
