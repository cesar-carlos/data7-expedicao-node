import { Server as SocketIOServer, Socket } from 'socket.io';
import { Pagination, OrderBy, Params } from '../../contracts/local.base.params';

import ExpedicaoBasicErrorEvent from '../../model/expedicao.basic.error.event';
import CarrinhoPercursoEstagioRepository from './carrinho.percurso.estagio.repository';
import ExpedicaoCarrinhoPercursoEstagioDto from '../../dto/expedicao/expedicao.carrinho.percurso.estagio.dto';
import ExpedicaoCarrinhoPercursoEstagioConsultaDto from '../../dto/expedicao/expedicao.carrinho.percurso.estagio.consulta.dto';
import ExpedicaoCarrinhoPercursoDto from '../../dto/expedicao/expedicao.carrinho.percurso.dto';
import ExpedicaoSepararConsultaDto from '../../dto/expedicao/expedicao.separar.consulta.dto';
import CarrinhoPercursoRepository from '../carrinho.percurso/carrinho.percurso.repository';
import ExpedicaoMutationBasicEvent from '../../model/expedicao.basic.mutation.event';
import ExpedicaoBasicSelectEvent from '../../model/expedicao.basic.query.event';
import SepararRepository from '../separar/separar.repository';

export default class CarrinhoPercursoEstagioEvent {
  private repository = new CarrinhoPercursoEstagioRepository();

  constructor(io: SocketIOServer, socket: Socket) {
    const client = socket.id;

    socket.on(`${client} carrinho.percurso.estagio.consulta`, async (data) => {
      const json = JSON.parse(data);
      const session = json['Session'] ?? '';
      const responseIn = json['ResponseIn'] ?? `${client} carrinho.percurso.estagio.consulta`;
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

    socket.on(`${client} carrinho.percurso.estagio.select`, async (data) => {
      const json = JSON.parse(data);
      const session = json['Session'] ?? '';
      const responseIn = json['ResponseIn'] ?? `${client} carrinho.percurso.estagio.select`;
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

    socket.on(`${client} carrinho.percurso.estagio.insert`, async (data) => {
      const json = JSON.parse(data);
      const session = json['Session'] ?? '';
      const responseIn = json['ResponseIn'] ?? (`${client} carrinho.percurso.estagio.insert` as string);
      const mutation = json['Mutation'];

      try {
        const itens = this.convert(mutation);
        const inserteds = await this.repository.insert(itens);

        const percursoConsulta = await this.getCarrinhosPercursoEstagioConsulta(inserteds);
        const separarConsulta: ExpedicaoSepararConsultaDto[] = [];
        const separarRepository = new SepararRepository();

        for (const el of percursoConsulta) {
          if (el.Origem == 'SE') {
            const paramsSeparar = [
              Params.equals('CodEmpresa', el.CodEmpresa),
              Params.equals('CodSepararEstoque', el.CodOrigem),
            ];

            const separar = await separarRepository.consulta(paramsSeparar);
            separarConsulta.push(...separar);
          }
        }

        // Criar evento para carrinhos percurso estagio
        const basicEvent = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: inserteds.map((item) => item.toJson()),
        });

        // Criar evento para carrinhos percurso estagio consulta
        const basicEventConsulta = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: percursoConsulta.map((item) => item.toJson()),
        });

        // Criar evento para separar consulta
        const basicEventSepararConsulta = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: separarConsulta.map((item) => item.toJson()),
        });

        socket.emit(responseIn, JSON.stringify(basicEvent.toJson()));
        io.emit('carrinho.percurso.estagio.insert.listen', JSON.stringify(basicEventConsulta.toJson()));
        io.emit('separar.update.listen', JSON.stringify(basicEventSepararConsulta.toJson()));
      } catch (error: any) {
        const event = new ExpedicaoBasicErrorEvent({
          Session: session,
          ResponseIn: responseIn,
          Error: error.message,
        });

        socket.emit(responseIn, JSON.stringify(event.toJson()));
      }
    });

    socket.on(`${client} carrinho.percurso.estagio.update`, async (data) => {
      const json = JSON.parse(data);
      const session = json['Session'] ?? '';
      const responseIn = json['ResponseIn'] ?? `${client} carrinho.percurso.estagio.update`;
      const mutation = json['Mutation'];

      try {
        const itens = this.convert(mutation);
        await this.repository.update(itens);
        const carrinhosPercursoEstagioConsulta = await this.getCarrinhosPercursoEstagioConsulta(itens);

        const separarConsulta: ExpedicaoSepararConsultaDto[] = [];
        const carrinhosPercurso: ExpedicaoCarrinhoPercursoDto[] = [];
        const carrinhoPercursoRepository = new CarrinhoPercursoRepository();
        const separarRepository = new SepararRepository();

        for (const el of carrinhosPercursoEstagioConsulta) {
          const paramsCarrinhosPercurso = [
            Params.equals('CodEmpresa', el.CodEmpresa),
            Params.equals('CodCarrinhoPercurso', el.CodCarrinhoPercurso),
          ];

          const result = await carrinhoPercursoRepository.select(paramsCarrinhosPercurso);
          carrinhosPercurso.push(...result);

          if (el.Origem == 'SE') {
            const paramsSeparar = [
              Params.equals('CodEmpresa', el.CodEmpresa),
              Params.equals('CodSepararEstoque', el.CodOrigem),
            ];

            const result = await separarRepository.consulta(paramsSeparar);
            separarConsulta.push(...result);
          }
        }

        // Criar evento para separar
        const basicEventSeparar = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: separarConsulta.map((item) => item.toJson()),
        });

        // Criar evento para carrinhos percurso
        const basicEventCarrinhoPercurso = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: carrinhosPercurso.map((item) => item.toJson()),
        });

        // Criar evento para carrinhos percurso estagio
        const basicEventCarrinhoPercursoEstagio = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: itens.map((item) => item.toJson()),
        });

        // Criar evento para carrinhos percurso estagio consulta
        const basicEventCarrinhoPercursoEstagioConsulta = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: carrinhosPercursoEstagioConsulta.map((item) => item.toJson()),
        });

        socket.emit(responseIn, JSON.stringify(basicEventCarrinhoPercursoEstagio.toJson()));
        io.emit('separar.update.listen', JSON.stringify(basicEventSeparar.toJson()));
        io.emit('carrinho.percurso.update.listen', JSON.stringify(basicEventCarrinhoPercurso.toJson()));
        io.emit(
          'carrinho.percurso.estagio.update.listen',
          JSON.stringify(basicEventCarrinhoPercursoEstagioConsulta.toJson()),
        );
      } catch (error: any) {
        const event = new ExpedicaoBasicErrorEvent({
          Session: session,
          ResponseIn: responseIn,
          Error: error.message,
        });

        socket.emit(responseIn, JSON.stringify(event.toJson()));
      }
    });

    socket.on(`${client} carrinho.percurso.estagio.delete`, async (data) => {
      const json = JSON.parse(data);
      const session = json['Session'] ?? '';
      const responseIn = json['ResponseIn'] ?? `${client} carrinho.percurso.estagio.delete`;
      const mutation = json['Mutation'];

      try {
        const itens = this.convert(mutation);
        await this.repository.delete(itens);
        const percursoConsulta = await this.getCarrinhosPercursoEstagioConsulta(itens);

        const basicEvent = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: itens.map((item) => item.toJson()),
        });

        const basicEventConsulta = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: percursoConsulta.map((item) => item.toJson()),
        });

        socket.emit(responseIn, JSON.stringify(basicEvent.toJson()));
        io.emit('carrinho.percurso.estagio.delete.listen', JSON.stringify(basicEventConsulta.toJson()));
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

  private async getCarrinhosPercursoEstagioConsulta(
    carrinhoEstagios: ExpedicaoCarrinhoPercursoEstagioDto[],
  ): Promise<ExpedicaoCarrinhoPercursoEstagioConsultaDto[]> {
    const carrinhoPercursoConsulta: ExpedicaoCarrinhoPercursoEstagioConsultaDto[] = [];

    for (const el of carrinhoEstagios) {
      const params = [
        Params.equals('CodEmpresa', el.CodEmpresa),
        Params.equals('CodCarrinhoPercurso', el.CodCarrinhoPercurso),
        Params.equals('Item', el.Item),
      ];

      const cars = await this.repository.consulta(params);
      carrinhoPercursoConsulta.push(...cars);
    }

    return carrinhoPercursoConsulta;
  }

  private convert(mutations: any[] | any): ExpedicaoCarrinhoPercursoEstagioDto[] {
    try {
      if (!Array.isArray(mutations)) mutations = [mutations];
      return mutations.map((mutation: any) => {
        return ExpedicaoCarrinhoPercursoEstagioDto.fromObject(mutation);
      });
    } catch (error) {
      return [];
    }
  }
}
