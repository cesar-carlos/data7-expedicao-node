import { Server as SocketIOServer, Socket } from 'socket.io';
import { Pagination, OrderBy, Params } from '../../contracts/local.base.params';

import SepararItemRepository from './separar.item.repository';
import ExpedicaoItemSepararDto from '../../dto/expedicao/expedicao.item.separar.dto';
import ExpedicaoItemSepararConsultaDto from '../../dto/expedicao/expedicao.item.separar.consulta.dto';
import ExpedicaoItemSepararUnidadeMedidaConsultaDto from '../../dto/expedicao/expedicao.item.separar.unidade.medida.consulta.dto';
import ExpedicaoMutationListenEvent from '../../model/expedicao.mutation.listen.event';
import ExpedicaoMutationBasicEvent from '../../model/expedicao.basic.mutation.event';
import ExpedicaoBasicSelectEvent from '../../model/expedicao.basic.query.event';
import ExpedicaoBasicErrorEvent from '../../model/expedicao.basic.error.event';

export default class SepararItemEvent {
  private repository = new SepararItemRepository();

  constructor(io: SocketIOServer, socket: Socket) {
    const client = socket.id;

    socket.on(`${client} separar.item.consulta`, async (data) => {
      const json = JSON.parse(data);
      const session = json['Session'] ?? '';
      const responseIn = json['ResponseIn'] ?? `${client} separar.item.consulta`;
      const params = json['Where'] ?? '';
      const pagination = Pagination.fromQueryString(json['Pagination']);
      const orderBy = OrderBy.fromQueryString(json['OrderBy']);

      try {
        const result = await this.repository.consulta(params, pagination, orderBy);

        // Obter parâmetros para consulta de unidades de medida
        const unidadeMedidaParams = this.groupResultsByEmpresaAndSepararEstoque(result);

        // Buscar unidades de medida usando os parâmetros agrupados
        const unidadesMedida = await this.repository.consultaUnidadeMedida(unidadeMedidaParams);

        // Converter para JSON, incluindo as unidades de medida agrupadas por item

        const itens = this.buildUnidadesMedida(result, unidadesMedida);
        const jsonData = itens.map((item) => item.toJson());

        const event = new ExpedicaoBasicSelectEvent({
          Session: session,
          ResponseIn: responseIn,
          Data: jsonData,
        });

        socket.emit(responseIn, JSON.stringify(event.toJson()));
      } catch (error: any) {
        const event = new ExpedicaoBasicErrorEvent({
          Session: session,
          ResponseIn: responseIn,
          Error: error.message,
        });

        socket.emit(responseIn, JSON.stringify(event.toJson()));
      }
    });

    socket.on(`${client} separar.item.unidade.medida.consulta`, async (data) => {
      const json = JSON.parse(data);
      const session = json['Session'] ?? '';
      const responseIn = json['ResponseIn'] ?? `${client} separar.item.unidade.medida.consulta`;
      const params = json['Where'] ?? '';
      const pagination = Pagination.fromQueryString(json['Pagination']);
      const orderBy = OrderBy.fromQueryString(json['OrderBy']);

      try {
        const result = await this.repository.consultaUnidadeMedida(params, pagination, orderBy);
        const jsonData = result.map((item) => item.toJson());

        const event = new ExpedicaoBasicSelectEvent({
          Session: session,
          ResponseIn: responseIn,
          Data: jsonData,
        });

        socket.emit(responseIn, JSON.stringify(event.toJson()));
      } catch (error: any) {
        const event = new ExpedicaoBasicErrorEvent({
          Session: session,
          ResponseIn: responseIn,
          Error: error.message,
        });

        socket.emit(responseIn, JSON.stringify(event.toJson()));
      }
    });

    socket.on(`${client} separar.item.select`, async (data) => {
      const json = JSON.parse(data);
      const session = json['Session'] ?? '';
      const responseIn = json['ResponseIn'] ?? `${client} separar.item.select`;
      const params = json['Where'] ?? '';
      const pagination = Pagination.fromQueryString(json['Pagination']);
      const orderBy = OrderBy.fromQueryString(json['OrderBy']);

      try {
        const result = await this.repository.select(params, pagination, orderBy);
        const jsonData = result.map((item) => item.toJson());

        const event = new ExpedicaoBasicSelectEvent({
          Session: session,
          ResponseIn: responseIn,
          Data: jsonData,
        });

        socket.emit(responseIn, JSON.stringify(event.toJson()));
      } catch (error: any) {
        const event = new ExpedicaoBasicErrorEvent({
          Session: session,
          ResponseIn: responseIn,
          Error: error.message,
        });

        socket.emit(responseIn, JSON.stringify(event.toJson()));
      }
    });

    socket.on(`${client} separar.item.insert`, async (data) => {
      const json = JSON.parse(data);
      const session = json['Session'] ?? '';
      const responseIn = json['ResponseIn'] ?? `${client} separar.item.insert`;
      const mutation = json['Mutation'];

      try {
        const itens = this.convert(mutation);
        const inserteds = await this.repository.insert(itens);

        const itensJson = inserteds.map((item) => item.toJson());
        const basicEvent = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: itensJson,
        });

        const listenEvent = new ExpedicaoMutationListenEvent({
          Mutation: itensJson,
        });

        socket.emit(responseIn, JSON.stringify(basicEvent.toJson()));
        io.emit('separar.item.insert.listen', JSON.stringify(listenEvent.toJson()));
      } catch (error: any) {
        const event = new ExpedicaoBasicErrorEvent({
          Session: session,
          ResponseIn: responseIn,
          Error: error.message,
        });

        socket.emit(responseIn, JSON.stringify(event.toJson()));
      }
    });

    socket.on(`${client} separar.item.update`, async (data) => {
      const json = JSON.parse(data);
      const session = json['Session'] ?? '';
      const responseIn = json['ResponseIn'] ?? `${client} separar.item.update`;
      const mutation = json['Mutation'];

      try {
        const itens = this.convert(mutation);
        await this.repository.update(itens);

        const itensJson = itens.map((item) => item.toJson());
        const basicEvent = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: itensJson,
        });

        const listenEvent = new ExpedicaoMutationListenEvent({
          Mutation: itensJson,
        });

        socket.emit(responseIn, JSON.stringify(basicEvent.toJson()));
        io.emit('separar.item.update.listen', JSON.stringify(listenEvent.toJson()));
      } catch (error: any) {
        const event = new ExpedicaoBasicErrorEvent({
          Session: session,
          ResponseIn: responseIn,
          Error: error.message,
        });

        socket.emit(responseIn, JSON.stringify(event.toJson()));
      }
    });

    socket.on(`${client} separar.item.delete`, async (data) => {
      const json = JSON.parse(data);
      const session = json['Session'] ?? '';
      const responseIn = json['ResponseIn'] ?? `${client} separar.item.delete`;
      const mutation = json['Mutation'];

      try {
        const itens = this.convert(mutation);
        await this.repository.delete(itens);

        const itensJson = itens.map((item) => item.toJson());
        const basicEvent = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: itensJson,
        });

        const listenEvent = new ExpedicaoMutationListenEvent({
          Mutation: itensJson,
        });

        socket.emit(responseIn, JSON.stringify(basicEvent.toJson()));
        io.emit('separar.item.delete.listen', JSON.stringify(listenEvent.toJson()));
      } catch (error: any) {
        const event = new ExpedicaoBasicErrorEvent({
          Session: session,
          ResponseIn: responseIn,
          Error: error.message,
        });

        socket.emit(responseIn, JSON.stringify(event.toJson()));
      }
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
    return results.map((item) => {
      if (!item.UnidadeMedidas) item.UnidadeMedidas = [];

      const unidadesDoProduto = unidadesMedida.filter(
        (um) =>
          um.CodEmpresa === item.CodEmpresa &&
          um.CodSepararEstoque === item.CodSepararEstoque &&
          um.CodProduto === item.CodProduto &&
          um.Item === item.Item,
      );

      item.UnidadeMedidas.push(...unidadesDoProduto);
      return item;
    });
  }

  private convert(mutations: any[] | any): ExpedicaoItemSepararDto[] {
    try {
      if (!Array.isArray(mutations)) mutations = [mutations];
      return mutations.map((mutation: any) => {
        return ExpedicaoItemSepararDto.fromObject(mutation);
      });
    } catch (error) {
      return [];
    }
  }
}
