import { Server as SocketIOServer, Socket } from 'socket.io';
import { Pagination, OrderBy, Params } from '../../contracts/local.base.params';

import ConferenciaItemRepository from './conferencia.item.repository';
import ExpedicaoBasicErrorEvent from '../../model/expedicao.basic.error.event';
import ExpedicaoMutationBasicEvent from '../../model/expedicao.basic.mutation.event';
import ExpedicaoItemConferenciaConsultaDto from '../../dto/expedicao/expedicao.item.conferencia.consulta.dto';
import CarrinhoPercursoEstagioRepository from '../carrinho.percurso.estagio/carrinho.percurso.estagio.repository';
import ExpedicaoItemConferirConsultaDto from '../../dto/expedicao/expedicao.item.conferir.consulta.dto';
import ExpedicaoItemConferenciaDto from '../../dto/expedicao/expedicao.item.conferencia.dto';
import ExpedicaoItemConferirDto from '../../dto/expedicao/expedicao.item.conferir.dto';
import ExpedicaoItemSituacaoModel from '../../model/expedicao.item.situacao.model';
import ExpedicaoBasicSelectEvent from '../../model/expedicao.basic.query.event';
import ConferirItemRepository from '../conferir.item/conferir.item.repository';

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

  constructor(io: SocketIOServer, socket: Socket) {
    const client = socket.id;

    socket.on(`${client} conferencia.item.consulta`, async (data) => {
      const json = JSON.parse(data);
      const session = json['Session'] ?? '';
      const responseIn = json['ResponseIn'] ?? `${client} conferencia.item.consulta`;
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

    socket.on(`${client} conferencia.item.select`, async (data) => {
      const json = JSON.parse(data);
      const session = json['Session'] ?? '';
      const responseIn = json['ResponseIn'] ?? `${client} conferencia.item.select`;
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

    socket.on(`${client} conferencia.item.insert`, async (data) => {
      const json = JSON.parse(data);
      const session = json['Session'] ?? '';
      const responseIn = json['ResponseIn'] ?? `${client} conferencia.item.insert`;
      const mutation = json['Mutation'];

      try {
        const produtoConferir: ProdutoConferir[] = [];
        const itensMutation = this.convert(mutation);

        const inserteds = await this.repository.insert(itensMutation);

        for (const el of inserteds) {
          const codCarrinho = await this.getCodCarrinho({
            CodEmpresa: el.CodEmpresa,
            CodCarrinhoPercurso: el.CodCarrinhoPercurso,
            ItemCarrinhoPercurso: el.ItemCarrinhoPercurso,
          });

          const isExist = produtoConferir.findIndex(
            (sel) =>
              sel.CodEmpresa == el.CodEmpresa &&
              sel.CodConferir == el.CodConferir &&
              sel.CodCarrinho == codCarrinho &&
              sel.CodProduto == el.CodProduto,
          );

          if (isExist == -1) {
            produtoConferir.push({
              CodEmpresa: el.CodEmpresa,
              CodConferir: el.CodConferir,
              CodCarrinho: codCarrinho,
              CodProduto: el.CodProduto,
            });
          }
        }

        const itensConferirConsulta: ExpedicaoItemConferirConsultaDto[] = [];
        for (const el of produtoConferir) {
          const params = [
            Params.equals('CodEmpresa', el.CodEmpresa),
            Params.equals('CodConferir', el.CodConferir),
            Params.equals('CodCarrinho', el.CodCarrinho),
            Params.equals('CodProduto', el.CodProduto),
          ];

          const itensConferenciaConsultaProdutoCarrinho = await this.repository.consulta(params);
          const sumQtdConferida = itensConferenciaConsultaProdutoCarrinho.reduce((acc, cur) => {
            return cur.Situacao != ExpedicaoItemSituacaoModel.cancelado ? acc + cur.Quantidade : acc;
          }, 0);

          const conferirItemRepository = new ConferirItemRepository();
          const itensConferirProdutoCarrinho = await conferirItemRepository.consulta(params);

          if (itensConferirProdutoCarrinho.length > 0) {
            const itemConferirProdutoCarrinho = ExpedicaoItemConferirDto.fromConsulta(
              itensConferirProdutoCarrinho.shift()!,
            );

            itemConferirProdutoCarrinho.QuantidadeConferida = sumQtdConferida;
            await conferirItemRepository.update([itemConferirProdutoCarrinho]);
          }

          const conferirItensConsultaProdutoCarrinho = await conferirItemRepository.consulta(params);
          itensConferirConsulta.push(...conferirItensConsultaProdutoCarrinho);
        }

        const itensConferenciaConsulta: ExpedicaoItemConferenciaConsultaDto[] = [];
        for (const el of inserteds) {
          const params = [
            Params.equals('CodEmpresa', el.CodEmpresa),
            Params.equals('CodConferir', el.CodConferir),
            Params.equals('Item', el.Item),
          ];

          const result = await this.repository.consulta(params);
          itensConferenciaConsulta.push(...result);
        }

        const basicEvent = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: inserteds.map((item) => item.toJson()),
        });

        const basicEventItensConferenciaConsulta = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: itensConferenciaConsulta.map((item) => item.toJson()),
        });

        const basicEventItensConferirConsulta = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: itensConferirConsulta.map((item) => item.toJson()),
        });

        socket.emit(responseIn, JSON.stringify(basicEvent.toJson()));
        io.emit('conferencia.item.insert.listen', JSON.stringify(basicEventItensConferenciaConsulta.toJson()));
        io.emit('conferir.item.update.listen', JSON.stringify(basicEventItensConferirConsulta.toJson()));
      } catch (error: any) {
        const event = new ExpedicaoBasicErrorEvent({
          Session: session,
          ResponseIn: responseIn,
          Error: error.message,
        });

        socket.emit(responseIn, JSON.stringify(event.toJson()));
      }
    });

    socket.on(`${client} conferencia.item.update`, async (data) => {
      const json = JSON.parse(data);
      const session = json['Session'] ?? '';
      const responseIn = json['ResponseIn'] ?? `${client} conferencia.item.update`;
      const mutation = json['Mutation'];

      try {
        const produtoConferir: ProdutoConferir[] = [];
        const itensMutation = this.convert(mutation);

        for (const el of itensMutation) {
          await this.repository.update([el]);

          const codCarrinho = await this.getCodCarrinho({
            CodEmpresa: el.CodEmpresa,
            CodCarrinhoPercurso: el.CodCarrinhoPercurso,
            ItemCarrinhoPercurso: el.ItemCarrinhoPercurso,
          });

          const isExist = produtoConferir.findIndex(
            (sel) =>
              sel.CodEmpresa == el.CodEmpresa &&
              sel.CodConferir == el.CodConferir &&
              sel.CodCarrinho == codCarrinho &&
              sel.CodProduto == el.CodProduto,
          );

          if (isExist == -1) {
            produtoConferir.push({
              CodEmpresa: el.CodEmpresa,
              CodConferir: el.CodConferir,
              CodCarrinho: codCarrinho,
              CodProduto: el.CodProduto,
            });
          }
        }

        const itensConferirConsulta: ExpedicaoItemConferirConsultaDto[] = [];
        for (const el of produtoConferir) {
          const params = [
            Params.equals('CodEmpresa', el.CodEmpresa),
            Params.equals('CodConferir', el.CodConferir),
            Params.equals('CodCarrinho', el.CodCarrinho),
            Params.equals('CodProduto', el.CodProduto),
          ];

          const itensConferenciaConsultaProdutoCarrinho = await this.repository.consulta(params);
          const sumQtdConferida = itensConferenciaConsultaProdutoCarrinho.reduce((acc, cur) => {
            return cur.Situacao != ExpedicaoItemSituacaoModel.cancelado ? acc + cur.Quantidade : acc;
          }, 0);

          const conferirItemRepository = new ConferirItemRepository();
          const itensConferirProdutoCarrinho = await conferirItemRepository.consulta(params);

          if (itensConferirProdutoCarrinho.length > 0) {
            const itemConferirProdutoCarrinho = ExpedicaoItemConferirDto.fromConsulta(
              itensConferirProdutoCarrinho.shift()!,
            );

            itemConferirProdutoCarrinho.QuantidadeConferida = sumQtdConferida;
            await conferirItemRepository.update([itemConferirProdutoCarrinho]);
          }

          const conferirItensConsultaProdutoCarrinho = await conferirItemRepository.consulta(params);
          itensConferirConsulta.push(...conferirItensConsultaProdutoCarrinho);
        }

        const itensConferenciaConsulta: ExpedicaoItemConferenciaConsultaDto[] = [];
        for (const el of itensMutation) {
          const params = [
            Params.equals('CodEmpresa', el.CodEmpresa),
            Params.equals('CodConferir', el.CodConferir),
            Params.equals('Item', el.Item),
          ];

          const result = await this.repository.consulta(params);
          itensConferenciaConsulta.push(...result);
        }

        const basicEvent = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: itensConferenciaConsulta.map((item) => item.toJson()),
        });

        const basicEventItensConferenciaConsulta = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: itensConferenciaConsulta.map((item) => item.toJson()),
        });

        const basicEventItensConferirConsulta = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: itensConferirConsulta.map((item) => item.toJson()),
        });

        socket.emit(responseIn, JSON.stringify(basicEvent.toJson()));
        io.emit('conferencia.item.update.listen', JSON.stringify(basicEventItensConferenciaConsulta.toJson()));
        io.emit('conferir.item.update.listen', JSON.stringify(basicEventItensConferirConsulta.toJson()));
      } catch (error: any) {
        const event = new ExpedicaoBasicErrorEvent({
          Session: session,
          ResponseIn: responseIn,
          Error: error.message,
        });

        socket.emit(responseIn, JSON.stringify(event.toJson()));
      }
    });

    socket.on(`${client} conferencia.item.delete`, async (data) => {
      const json = JSON.parse(data);
      const session = json['Session'] ?? '';
      const responseIn = json['ResponseIn'] ?? `${client} conferencia.item.delete`;
      const mutation = json['Mutation'];

      try {
        const produtoConferir: ProdutoConferir[] = [];
        const itensMutation = this.convert(mutation);

        const itensConferenciaConsulta: ExpedicaoItemConferenciaConsultaDto[] = [];
        for (const el of itensMutation) {
          const params = [
            Params.equals('CodEmpresa', el.CodEmpresa),
            Params.equals('CodConferir', el.CodConferir),
            Params.equals('Item', el.Item),
          ];

          const result = await this.repository.consulta(params);
          itensConferenciaConsulta.push(...result);
        }

        for (const el of itensMutation) {
          await this.repository.delete([el]);

          const codCarrinho = await this.getCodCarrinho({
            CodEmpresa: el.CodEmpresa,
            CodCarrinhoPercurso: el.CodCarrinhoPercurso,
            ItemCarrinhoPercurso: el.ItemCarrinhoPercurso,
          });

          const isExist = produtoConferir.findIndex(
            (sel) =>
              sel.CodEmpresa == el.CodEmpresa &&
              sel.CodConferir == el.CodConferir &&
              sel.CodCarrinho == codCarrinho &&
              sel.CodProduto == el.CodProduto,
          );

          if (isExist == -1) {
            produtoConferir.push({
              CodEmpresa: el.CodEmpresa,
              CodConferir: el.CodConferir,
              CodCarrinho: codCarrinho,
              CodProduto: el.CodProduto,
            });
          }
        }

        const itensConferirConsulta: ExpedicaoItemConferirConsultaDto[] = [];
        for (const el of produtoConferir) {
          const params = [
            Params.equals('CodEmpresa', el.CodEmpresa),
            Params.equals('CodConferir', el.CodConferir),
            Params.equals('CodCarrinho', el.CodCarrinho),
            Params.equals('CodProduto', el.CodProduto),
          ];

          const itensConferenciaConsultaProdutoCarrinho = await this.repository.consulta(params);
          const sumQtdConferida = itensConferenciaConsultaProdutoCarrinho.reduce((acc, cur) => {
            return cur.Situacao != ExpedicaoItemSituacaoModel.cancelado ? acc + cur.Quantidade : acc;
          }, 0);

          const conferirItemRepository = new ConferirItemRepository();
          const itensConferirProdutoCarrinho = await conferirItemRepository.consulta(params);

          if (itensConferirProdutoCarrinho.length > 0) {
            const itemConferirProdutoCarrinho = ExpedicaoItemConferirDto.fromConsulta(
              itensConferirProdutoCarrinho.shift()!,
            );

            itemConferirProdutoCarrinho.QuantidadeConferida = sumQtdConferida;
            await conferirItemRepository.update([itemConferirProdutoCarrinho]);
          }

          const conferirItensConsultaProdutoCarrinho = await conferirItemRepository.consulta(params);
          itensConferirConsulta.push(...conferirItensConsultaProdutoCarrinho);
        }

        const basicEvent = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: itensMutation.map((item) => item.toJson()),
        });

        const basicEventItensConferenciaConsulta = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: itensConferenciaConsulta.map((item) => item.toJson()),
        });

        const basicEventItensConferirConsulta = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: itensConferirConsulta.map((item) => item.toJson()),
        });

        socket.emit(responseIn, JSON.stringify(basicEvent.toJson()));
        io.emit('conferencia.item.delete.listen', JSON.stringify(basicEventItensConferenciaConsulta.toJson()));
        io.emit('conferir.item.update.listen', JSON.stringify(basicEventItensConferirConsulta.toJson()));
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

  private convert(mutations: any[] | any): ExpedicaoItemConferenciaDto[] {
    try {
      if (!Array.isArray(mutations)) mutations = [mutations];
      return mutations.map((mutation: any) => {
        return ExpedicaoItemConferenciaDto.fromObject(mutation);
      });
    } catch (error) {
      return [];
    }
  }

  private async getCodCarrinho(params: CarrinhoPercursoEstagioParams): Promise<number> {
    const repository = new CarrinhoPercursoEstagioRepository();
    const result = await repository.select([
      Params.equals('CodEmpresa', params.CodEmpresa),
      Params.equals('CodCarrinhoPercurso', params.CodCarrinhoPercurso),
      Params.equals('Item', params.ItemCarrinhoPercurso),
    ]);

    return result?.shift()?.CodCarrinho ?? 0;
  }
}
