import { Server as SocketIOServer, Socket } from 'socket.io';
import { Pagination, OrderBy, Params } from '../../contracts/local.base.params';

import SepararItemRepository from '../separar.item/separar.item.repository';
import ExpedicaoMutationBasicEvent from '../../model/expedicao.basic.mutation.event';
import ExpedicaoItemSeparacaoConsultaDto from '../../dto/expedicao/expedicao.item.separacao.consulta.dto';
import ExpedicaoItemSepararConsultaDto from '../../dto/expedicao/expedicao.item.separar.consulta.dto';
import ExpedicaoItemSeparacaoDto from '../../dto/expedicao/expedicao.item.separacao.dto';
import ExpedicaoItemSituacaoModel from '../../model/expedicao.item.situacao.model';
import ExpedicaoBasicSelectEvent from '../../model/expedicao.basic.query.event';
import ExpedicaoBasicErrorEvent from '../../model/expedicao.basic.error.event';
import SeparacaoItemRepository from './separacao.item.repository';

type ProdutoSeparar = {
  CodEmpresa: number;
  CodSepararEstoque: number;
  CodProduto: number;
};

export default class SeparacaoItemEvent {
  private repository = new SeparacaoItemRepository();

  constructor(io: SocketIOServer, socket: Socket) {
    const client = socket.id;

    socket.on(`${client} separacao.item.resumo.consulta`, async (data) => {
      const json = JSON.parse(data);
      const session = json['Session'] ?? '';
      const responseIn = json['ResponseIn'] ?? `${client} separacao.item.resumo.consulta`;
      const params = json['Where'] ?? '';
      const pagination = Pagination.fromQueryString(json['Pagination']);
      const orderBy = OrderBy.fromQueryString(json['OrderBy']);

      try {
        const result = await this.repository.consultaResumo(params, pagination, orderBy);
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

    socket.on(`${client} separacao.item.consulta`, async (data) => {
      const json = JSON.parse(data);
      const session = json['Session'] ?? '';
      const responseIn = json['ResponseIn'] ?? `${client} separacao.item.consulta`;
      const params = json['Where'] ?? '';
      const pagination = Pagination.fromQueryString(json['Pagination']);
      const orderBy = OrderBy.fromQueryString(json['OrderBy']);

      try {
        const result = await this.repository.consulta(params, pagination, orderBy);
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

    socket.on(`${client} separacao.item.select`, async (data) => {
      const json = JSON.parse(data);
      const session = json['Session'] ?? '';
      const responseIn = json['ResponseIn'] ?? `${client} separacao.item.select`;
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

    socket.on(`${client} separacao.item.insert`, async (data) => {
      const json = JSON.parse(data);
      const session = json['Session'] ?? '';
      const responseIn = json['ResponseIn'] ?? `${client} separacao.item.insert`;
      const mutation = json['Mutation'];

      try {
        const produtosSeparado: ProdutoSeparar[] = [];
        const itensMutation = this.convert(mutation);

        const inserteds = await this.repository.insert(itensMutation);

        for (const el of inserteds) {
          const isExist = produtosSeparado.findIndex(
            (sel) =>
              sel.CodEmpresa == el.CodEmpresa &&
              sel.CodSepararEstoque == el.CodSepararEstoque &&
              sel.CodProduto == el.CodProduto,
          );

          if (isExist == -1) {
            produtosSeparado.push({
              CodEmpresa: el.CodEmpresa,
              CodSepararEstoque: el.CodSepararEstoque,
              CodProduto: el.CodProduto,
            });
          }
        }

        const itensSepararConsulta: ExpedicaoItemSepararConsultaDto[] = [];
        for (const el of produtosSeparado) {
          const params = [
            Params.equals('CodEmpresa', el.CodEmpresa),
            Params.equals('CodSepararEstoque', el.CodSepararEstoque),
            Params.equals('CodProduto', el.CodProduto),
          ];

          const separados = await this.repository.select(params);
          const sumQtdSeparada = separados.reduce((acc, cur) => {
            return cur.Situacao != ExpedicaoItemSituacaoModel.cancelado ? acc + cur.Quantidade : acc;
          }, 0);

          const separarItemRepository = new SepararItemRepository();
          const separarItem = await separarItemRepository.select(params);

          if (separarItem.length > 0) {
            const item = separarItem.shift()!;
            item.QuantidadeSeparacao = sumQtdSeparada;
            await separarItemRepository.update([item]);
          }

          const separarItensConsulta = await separarItemRepository.consulta(params);
          itensSepararConsulta.push(...separarItensConsulta);
        }

        const itensSeparacaoConsulta: ExpedicaoItemSeparacaoConsultaDto[] = [];
        for (const el of inserteds) {
          const params = [
            Params.equals('CodEmpresa', el.CodEmpresa),
            Params.equals('CodSepararEstoque', el.CodSepararEstoque),
            Params.equals('Item', el.Item),
          ];

          const result = await this.repository.consulta(params);
          itensSeparacaoConsulta.push(...result);
        }

        const basicEvent = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: inserteds.map((item) => item.toJson()),
        });

        const basicEventItensSeparacaoConsulta = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: itensSeparacaoConsulta.map((item) => item.toJson()),
        });

        const basicEventItensSepararConsulta = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: itensSepararConsulta.map((item) => item.toJson()),
        });

        socket.emit(responseIn, JSON.stringify(basicEvent.toJson()));
        io.emit('separacao.item.insert.listen', JSON.stringify(basicEventItensSeparacaoConsulta.toJson()));
        io.emit('separar.item.consulta.update.listen', JSON.stringify(basicEventItensSepararConsulta.toJson()));
      } catch (error: any) {
        const event = new ExpedicaoBasicErrorEvent({
          Session: session,
          ResponseIn: responseIn,
          Error: error.message,
        });

        socket.emit(responseIn, JSON.stringify(event.toJson()));
      }
    });

    socket.on(`${client} separacao.item.update`, async (data) => {
      const json = JSON.parse(data);
      const session = json['Session'] ?? '';
      const responseIn = json['ResponseIn'] ?? `${client} separacao.item.update`;
      const mutation = json['Mutation'];

      try {
        const produtosSeparado: ProdutoSeparar[] = [];
        const itensMutation = this.convert(mutation);

        for (const el of itensMutation) {
          await this.repository.update([el]);

          const isExist = produtosSeparado.findIndex(
            (sel) =>
              sel.CodEmpresa == el.CodEmpresa &&
              sel.CodSepararEstoque == el.CodSepararEstoque &&
              sel.CodProduto == el.CodProduto,
          );

          if (isExist == -1) {
            produtosSeparado.push({
              CodEmpresa: el.CodEmpresa,
              CodSepararEstoque: el.CodSepararEstoque,
              CodProduto: el.CodProduto,
            });
          }
        }

        const itensSepararConsulta: ExpedicaoItemSepararConsultaDto[] = [];
        for (const el of produtosSeparado) {
          const params = [
            Params.equals('CodEmpresa', el.CodEmpresa),
            Params.equals('CodSepararEstoque', el.CodSepararEstoque),
            Params.equals('CodProduto', el.CodProduto),
          ];

          const separados = await this.repository.select(params);

          const sumQtdSeparada = separados.reduce((acc, cur) => {
            return cur.Situacao != ExpedicaoItemSituacaoModel.cancelado ? acc + cur.Quantidade : acc;
          }, 0);

          const separarItemRepository = new SepararItemRepository();
          const separarItem = await separarItemRepository.select(params);

          if (separarItem.length > 0) {
            const item = separarItem.shift()!;
            item.QuantidadeSeparacao = sumQtdSeparada;
            await separarItemRepository.update([item]);
          }

          const separarItensConsulta = await separarItemRepository.consulta(params);
          itensSepararConsulta.push(...separarItensConsulta);
        }

        const itensSeparacaoConsulta: ExpedicaoItemSeparacaoConsultaDto[] = [];
        for (const el of itensMutation) {
          const params = [
            Params.equals('CodEmpresa', el.CodEmpresa),
            Params.equals('CodSepararEstoque', el.CodSepararEstoque),
            Params.equals('Item', el.Item),
          ];

          const result = await this.repository.consulta(params);
          itensSeparacaoConsulta.push(...result);
        }

        const basicEvent = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: itensMutation.map((item) => item.toJson()),
        });

        const basicEventItensSeparacaoConsulta = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: itensSeparacaoConsulta.map((item) => item.toJson()),
        });

        const basicEventItensSepararConsulta = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: itensSepararConsulta.map((item) => item.toJson()),
        });

        socket.emit(responseIn, JSON.stringify(basicEvent.toJson()));
        io.emit('separacao.item.update.listen', JSON.stringify(basicEventItensSeparacaoConsulta.toJson()));
        io.emit('separar.item.consulta.update.listen', JSON.stringify(basicEventItensSepararConsulta.toJson()));
      } catch (error: any) {
        const event = new ExpedicaoBasicErrorEvent({
          Session: session,
          ResponseIn: responseIn,
          Error: error.message,
        });

        socket.emit(responseIn, JSON.stringify(event.toJson()));
      }
    });

    socket.on(`${client} separacao.item.delete`, async (data) => {
      const json = JSON.parse(data);
      const session = json['Session'] ?? '';
      const responseIn = json['ResponseIn'] ?? `${client} separacao.item.delete`;
      const mutation = json['Mutation'];

      try {
        const produtosSeparado: ProdutoSeparar[] = [];
        const itensMutation = this.convert(mutation);

        const itensSeparacaoConsulta: ExpedicaoItemSeparacaoConsultaDto[] = [];
        for (const el of itensMutation) {
          const params = [
            Params.equals('CodEmpresa', el.CodEmpresa),
            Params.equals('CodSepararEstoque', el.CodSepararEstoque),
            Params.equals('Item', el.Item),
          ];

          const result = await this.repository.consulta(params);
          itensSeparacaoConsulta.push(...result);
        }

        for (const el of itensMutation) {
          await this.repository.delete([el]);

          const isExist = produtosSeparado.findIndex(
            (sel) =>
              sel.CodEmpresa == el.CodEmpresa &&
              sel.CodSepararEstoque == el.CodSepararEstoque &&
              sel.CodProduto == el.CodProduto,
          );

          if (isExist == -1) {
            produtosSeparado.push({
              CodEmpresa: el.CodEmpresa,
              CodSepararEstoque: el.CodSepararEstoque,
              CodProduto: el.CodProduto,
            });
          }
        }

        const itensSepararConsulta: ExpedicaoItemSepararConsultaDto[] = [];
        for (const el of produtosSeparado) {
          const params = [
            Params.equals('CodEmpresa', el.CodEmpresa),
            Params.equals('CodSepararEstoque', el.CodSepararEstoque),
            Params.equals('CodProduto', el.CodProduto),
          ];

          const separados = await this.repository.select(params);

          const sumQtdSeparada = separados.reduce((acc, cur) => {
            return cur.Situacao != ExpedicaoItemSituacaoModel.cancelado ? acc + cur.Quantidade : acc;
          }, 0);

          const separarItemRepository = new SepararItemRepository();
          const separarItem = await separarItemRepository.select(params);

          if (separarItem.length > 0) {
            const item = separarItem.shift()!;
            item.QuantidadeSeparacao = sumQtdSeparada;
            await separarItemRepository.update([item]);
          }

          const separarItensConsulta = await separarItemRepository.consulta(params);
          itensSepararConsulta.push(...separarItensConsulta);
        }

        const basicEvent = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: itensMutation.map((item) => item.toJson()),
        });

        const basicEventItensSeparacaoConsulta = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: itensSeparacaoConsulta.map((item) => item.toJson()),
        });

        const basicEventItensSepararConsulta = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: itensSepararConsulta.map((item) => item.toJson()),
        });

        socket.emit(responseIn, JSON.stringify(basicEvent.toJson()));
        io.emit('separacao.item.delete.listen', JSON.stringify(basicEventItensSeparacaoConsulta.toJson()));
        io.emit('separar.item.consulta.update.listen', JSON.stringify(basicEventItensSepararConsulta.toJson()));
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

  private convert(mutations: any[] | any): ExpedicaoItemSeparacaoDto[] {
    try {
      if (!Array.isArray(mutations)) mutations = [mutations];
      return mutations.map((mutation: any) => {
        return ExpedicaoItemSeparacaoDto.fromObject(mutation);
      });
    } catch (error) {
      return [];
    }
  }
}
