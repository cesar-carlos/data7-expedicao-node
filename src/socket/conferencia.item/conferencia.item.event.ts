import { Server as SocketIOServer, Socket } from 'socket.io';
import { Params } from '../../contracts/local.base.params';

import ConferenciaItemRepository from './conferencia.item.repository';
import ExpedicaoMutationBasicEvent from '../../model/expedicao.basic.mutation.event';
import ExpedicaoItemConferenciaConsultaDto from '../../dto/expedicao/expedicao.item.conferencia.consulta.dto';
import CarrinhoPercursoEstagioRepository from '../carrinho.percurso.estagio/carrinho.percurso.estagio.repository';
import ExpedicaoItemConferirConsultaDto from '../../dto/expedicao/expedicao.item.conferir.consulta.dto';
import ExpedicaoItemConferenciaDto from '../../dto/expedicao/expedicao.item.conferencia.dto';
import ExpedicaoItemConferirDto from '../../dto/expedicao/expedicao.item.conferir.dto';
import ExpedicaoItemSituacaoModel from '../../model/expedicao.item.situacao.model';
import ConferirItemRepository from '../conferir.item/conferir.item.repository';
import { convertSocketMutationPayload, mapWithConcurrency, withSocketRequest } from '../socket.event.helpers';

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
        await this.updateOneByOne(itensMutation);
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
        const itensConferenciaConsulta = await this.loadItensConferenciaConsulta(itensMutation);
        await this.deleteOneByOne(itensMutation);
        const produtoConferir = await this.buildProdutosConferir(itensMutation);
        const itensConferirConsulta = await this.refreshItensConferirConsulta(produtoConferir);

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
    const [itensConferirConsulta, itensConferenciaConsulta] = await Promise.all([
      this.refreshItensConferirConsulta(produtoConferir),
      this.loadItensConferenciaConsulta(items),
    ]);

    return {
      itensConferenciaConsulta,
      itensConferirConsulta,
    };
  }

  private async updateOneByOne(items: ExpedicaoItemConferenciaDto[]): Promise<void> {
    for (const item of items) {
      await this.repository.update([item]);
    }
  }

  private async deleteOneByOne(items: ExpedicaoItemConferenciaDto[]): Promise<void> {
    for (const item of items) {
      await this.repository.delete([item]);
    }
  }

  private convert(mutations: any[] | any): ExpedicaoItemConferenciaDto[] {
    return convertSocketMutationPayload(
      mutations,
      (mutation) => ExpedicaoItemConferenciaDto.fromObject(mutation),
      {
        eventName: 'conferencia.item.mutation',
        requiredKeys: ['CodEmpresa', 'CodConferir', 'Item', 'CodCarrinhoPercurso', 'ItemCarrinhoPercurso', 'CodProduto'],
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
  ): Promise<ExpedicaoItemConferirConsultaDto[]> {
    const consultas = await mapWithConcurrency(
      produtos,
      async (produto) => {
        const params = this.buildProdutoConferirParams(produto);
        const [itensConferenciaConsulta, itensConferir] = await Promise.all([
          this.repository.consulta(params),
          this.conferirItemRepository.consulta(params),
        ]);

        const quantidadeConferida = itensConferenciaConsulta.reduce((acc, cur) => {
          return cur.Situacao != ExpedicaoItemSituacaoModel.cancelado ? acc + cur.Quantidade : acc;
        }, 0);

        if (itensConferir.length > 0) {
          const itemConferir = ExpedicaoItemConferirDto.fromConsulta(itensConferir[0]);
          itemConferir.QuantidadeConferida = quantidadeConferida;
          await this.conferirItemRepository.update([itemConferir]);
          return this.conferirItemRepository.consulta(params);
        }

        return itensConferir;
      },
    );

    return consultas.flat();
  }

  private async loadItensConferenciaConsulta(
    items: ExpedicaoItemConferenciaDto[],
  ): Promise<ExpedicaoItemConferenciaConsultaDto[]> {
    const queryParams = Array.from(
      new Map(
        items.map((item) => [
          `${item.CodEmpresa}:${item.CodConferir}:${item.Item}`,
          [
            Params.equals('CodEmpresa', item.CodEmpresa),
            Params.equals('CodConferir', item.CodConferir),
            Params.equals('Item', item.Item),
          ],
        ]),
      ).values(),
    );
    const consultas = await mapWithConcurrency(queryParams, (params) => this.repository.consulta(params));

    return consultas.flat();
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

  private getProdutoConferirKey(produto: ProdutoConferir): string {
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
