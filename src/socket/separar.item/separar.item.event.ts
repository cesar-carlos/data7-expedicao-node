import { Server as SocketIOServer, Socket } from 'socket.io';
import { Params } from '../../contracts/local.base.params';

import SepararItemRepository from './separar.item.repository';
import ExpedicaoItemSepararDto from '../../dto/expedicao/expedicao.item.separar.dto';
import ExpedicaoItemSepararConsultaDto from '../../dto/expedicao/expedicao.item.separar.consulta.dto';
import ExpedicaoItemSepararUnidadeMedidaConsultaDto from '../../dto/expedicao/expedicao.item.separar.unidade.medida.consulta.dto';
import ExpedicaoMutationListenEvent from '../../model/expedicao.mutation.listen.event';
import { convertSocketMutationPayload, withSocketRequest } from '../socket.event.helpers';

export default class SepararItemEvent {
  private repository = new SepararItemRepository();

  constructor(io: SocketIOServer, socket: Socket) {
    const client = socket.id;

    socket.on(`${client} separar.item.consulta`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} separar.item.consulta`,
        eventName: 'separar.item.consulta',
        kind: 'query',
      }, async ({ request, emitQuery }) => {
        const result = await this.repository.consulta(request.where as Params[], request.pagination, request.orderBy);
        const unidadeMedidaParams = this.groupResultsByEmpresaAndSepararEstoque(result);
        const unidadesMedida = await this.repository.consultaUnidadeMedida(unidadeMedidaParams);
        const itens = this.buildUnidadesMedida(result, unidadesMedida);
        emitQuery(itens.map((item) => item.toJson()));
      });
    });

    socket.on(`${client} separar.item.unidade.medida.consulta`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} separar.item.unidade.medida.consulta`,
        eventName: 'separar.item.unidade.medida.consulta',
        kind: 'query',
      }, async ({ request, emitQuery }) => {
        const result = await this.repository.consultaUnidadeMedida(
          request.where as Params[],
          request.pagination,
          request.orderBy,
        );
        emitQuery(result.map((item) => item.toJson()));
      });
    });

    socket.on(`${client} separar.item.select`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} separar.item.select`,
        eventName: 'separar.item.select',
        kind: 'query',
      }, async ({ request, emitQuery }) => {
        const result = await this.repository.select(request.where as Params[], request.pagination, request.orderBy);
        emitQuery(result.map((item) => item.toJson()));
      });
    });

    socket.on(`${client} separar.item.insert`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} separar.item.insert`,
        eventName: 'separar.item.insert',
        kind: 'mutation',
      }, async ({ request, emitMutation, emitListen }) => {
        const itens = this.convert(request.mutation);
        const inserteds = await this.repository.insert(itens);

        const itensJson = inserteds.map((item) => item.toJson());
        const listenEvent = new ExpedicaoMutationListenEvent({
          Mutation: itensJson,
        });

        emitMutation(itensJson);
        emitListen(io, 'separar.item.insert.listen', listenEvent.toJson());
      });
    });

    socket.on(`${client} separar.item.update`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} separar.item.update`,
        eventName: 'separar.item.update',
        kind: 'mutation',
      }, async ({ request, emitMutation, emitListen }) => {
        const itens = this.convert(request.mutation);
        await this.repository.update(itens);

        const itensJson = itens.map((item) => item.toJson());
        const listenEvent = new ExpedicaoMutationListenEvent({
          Mutation: itensJson,
        });

        emitMutation(itensJson);
        emitListen(io, 'separar.item.update.listen', listenEvent.toJson());
      });
    });

    socket.on(`${client} separar.item.delete`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} separar.item.delete`,
        eventName: 'separar.item.delete',
        kind: 'mutation',
      }, async ({ request, emitMutation, emitListen }) => {
        const itens = this.convert(request.mutation);
        await this.repository.delete(itens);

        const itensJson = itens.map((item) => item.toJson());
        const listenEvent = new ExpedicaoMutationListenEvent({
          Mutation: itensJson,
        });

        emitMutation(itensJson);
        emitListen(io, 'separar.item.delete.listen', listenEvent.toJson());
      });
    });
  }

  private groupResultsByEmpresaAndSepararEstoque(results: ExpedicaoItemSepararConsultaDto[]): Params[] {
    const unidadeMedidaParams: Params[] = [];
    const uniqueKeys = new Set<string>();

    results.forEach((item) => {
      const key = `${item.CodEmpresa}_${item.CodSepararEstoque}`;
      uniqueKeys.add(key);
    });

    uniqueKeys.forEach((key) => {
      const [codEmpresa, codSepararEstoque] = key.split('_').map(Number);
      unidadeMedidaParams.push(
        Params.equals('CodEmpresa', codEmpresa),
        Params.equals('CodSepararEstoque', codSepararEstoque),
      );
    });

    return unidadeMedidaParams;
  }

  private buildUnidadesMedida(
    results: ExpedicaoItemSepararConsultaDto[],
    unidadesMedida: ExpedicaoItemSepararUnidadeMedidaConsultaDto[],
  ): ExpedicaoItemSepararConsultaDto[] {
    const unidadesPorItem = new Map<string, ExpedicaoItemSepararUnidadeMedidaConsultaDto[]>();

    for (const unidade of unidadesMedida) {
      const key = `${unidade.CodEmpresa}:${unidade.CodSepararEstoque}:${unidade.CodProduto}:${unidade.Item}`;
      const current = unidadesPorItem.get(key) ?? [];
      current.push(unidade);
      unidadesPorItem.set(key, current);
    }

    return results.map((item) => {
      if (!item.UnidadeMedidas) item.UnidadeMedidas = [];

      const key = `${item.CodEmpresa}:${item.CodSepararEstoque}:${item.CodProduto}:${item.Item}`;
      const unidadesDoProduto = unidadesPorItem.get(key) ?? [];

      item.UnidadeMedidas.push(...unidadesDoProduto);
      return item;
    });
  }

  private convert(mutations: any[] | any): ExpedicaoItemSepararDto[] {
    return convertSocketMutationPayload(
      mutations,
      (mutation) => ExpedicaoItemSepararDto.fromObject(mutation),
      { eventName: 'separar.item.mutation', requiredKeys: ['CodEmpresa', 'CodSepararEstoque', 'CodProduto'] },
    );
  }
}
