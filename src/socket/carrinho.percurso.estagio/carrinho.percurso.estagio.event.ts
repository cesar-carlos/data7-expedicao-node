import { Server as SocketIOServer, Socket } from 'socket.io';
import { Params } from '../../contracts/local.base.params';

import CarrinhoPercursoEstagioRepository from './carrinho.percurso.estagio.repository';
import ExpedicaoCarrinhoPercursoEstagioDto from '../../dto/expedicao/expedicao.carrinho.percurso.estagio.dto';
import ExpedicaoCarrinhoPercursoEstagioConsultaDto from '../../dto/expedicao/expedicao.carrinho.percurso.estagio.consulta.dto';
import ExpedicaoCarrinhoPercursoDto from '../../dto/expedicao/expedicao.carrinho.percurso.dto';
import ExpedicaoSepararConsultaDto from '../../dto/expedicao/expedicao.separar.consulta.dto';
import CarrinhoPercursoRepository from '../carrinho.percurso/carrinho.percurso.repository';
import ExpedicaoMutationBasicEvent from '../../model/expedicao.basic.mutation.event';
import SepararRepository from '../separar/separar.repository';
import { convertSocketMutationPayload, mapWithConcurrency, withSocketRequest } from '../socket.event.helpers';

export default class CarrinhoPercursoEstagioEvent {
  private repository = new CarrinhoPercursoEstagioRepository();
  private carrinhoPercursoRepository = new CarrinhoPercursoRepository();
  private separarRepository = new SepararRepository();

  constructor(io: SocketIOServer, socket: Socket) {
    const client = socket.id;

    socket.on(`${client} carrinho.percurso.estagio.consulta`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} carrinho.percurso.estagio.consulta`,
        eventName: 'carrinho.percurso.estagio.consulta',
        kind: 'query',
      }, async ({ request, emitQuery }) => {
        const result = await this.repository.consulta(request.where as Params[], request.pagination, request.orderBy);
        emitQuery(result.map((item) => item.toJson()));
      });
    });

    socket.on(`${client} carrinho.percurso.estagio.select`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} carrinho.percurso.estagio.select`,
        eventName: 'carrinho.percurso.estagio.select',
        kind: 'query',
      }, async ({ request, emitQuery }) => {
        const result = await this.repository.select(request.where as Params[], request.pagination, request.orderBy);
        emitQuery(result.map((item) => item.toJson()));
      });
    });

    socket.on(`${client} carrinho.percurso.estagio.insert`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} carrinho.percurso.estagio.insert`,
        eventName: 'carrinho.percurso.estagio.insert',
        kind: 'mutation',
      }, async ({ request, emitMutation, emitListen }) => {
        const itens = this.convert(request.mutation);
        const inserteds = await this.repository.insert(itens);
        const percursoConsulta = await this.getCarrinhosPercursoEstagioConsulta(inserteds);
        const separarConsulta = await this.loadSepararConsulta(percursoConsulta);

        const responseEvent = this.createMutationEvent(request.session, request.responseIn, inserteds);
        const percursoListenEvent = this.createMutationEvent(request.session, request.responseIn, percursoConsulta);
        const separarListenEvent = this.createMutationEvent(request.session, request.responseIn, separarConsulta);

        emitMutation(responseEvent.Mutation ?? inserteds.map((item) => item.toJson()));
        emitListen(io, 'carrinho.percurso.estagio.insert.listen', percursoListenEvent.toJson());
        emitListen(io, 'separar.update.listen', separarListenEvent.toJson());
      });
    });

    socket.on(`${client} carrinho.percurso.estagio.update`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} carrinho.percurso.estagio.update`,
        eventName: 'carrinho.percurso.estagio.update',
        kind: 'mutation',
      }, async ({ request, emitMutation, emitListen }) => {
        const itens = this.convert(request.mutation);
        await this.repository.update(itens);
        const carrinhosPercursoEstagioConsulta = await this.getCarrinhosPercursoEstagioConsulta(itens);
        const [separarConsulta, carrinhosPercurso] = await Promise.all([
          this.loadSepararConsulta(carrinhosPercursoEstagioConsulta),
          this.loadCarrinhosPercurso(carrinhosPercursoEstagioConsulta),
        ]);

        const responseEvent = this.createMutationEvent(request.session, request.responseIn, itens);
        const separarListenEvent = this.createMutationEvent(request.session, request.responseIn, separarConsulta);
        const carrinhoPercursoListenEvent = this.createMutationEvent(
          request.session,
          request.responseIn,
          carrinhosPercurso,
        );
        const estagioListenEvent = this.createMutationEvent(
          request.session,
          request.responseIn,
          carrinhosPercursoEstagioConsulta,
        );

        emitMutation(responseEvent.Mutation ?? itens.map((item) => item.toJson()));
        emitListen(io, 'separar.update.listen', separarListenEvent.toJson());
        emitListen(io, 'carrinho.percurso.update.listen', carrinhoPercursoListenEvent.toJson());
        emitListen(io, 'carrinho.percurso.estagio.update.listen', estagioListenEvent.toJson());
      });
    });

    socket.on(`${client} carrinho.percurso.estagio.delete`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} carrinho.percurso.estagio.delete`,
        eventName: 'carrinho.percurso.estagio.delete',
        kind: 'mutation',
      }, async ({ request, emitMutation, emitListen }) => {
        const itens = this.convert(request.mutation);
        await this.repository.delete(itens);
        const percursoConsulta = await this.getCarrinhosPercursoEstagioConsulta(itens);

        const responseEvent = this.createMutationEvent(request.session, request.responseIn, itens);
        const percursoListenEvent = this.createMutationEvent(request.session, request.responseIn, percursoConsulta);

        emitMutation(responseEvent.Mutation ?? itens.map((item) => item.toJson()));
        emitListen(io, 'carrinho.percurso.estagio.delete.listen', percursoListenEvent.toJson());
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

  private async getCarrinhosPercursoEstagioConsulta(
    carrinhoEstagios: ExpedicaoCarrinhoPercursoEstagioDto[],
  ): Promise<ExpedicaoCarrinhoPercursoEstagioConsultaDto[]> {
    const consultas = await Promise.all(
      Array.from(
        new Map(
          carrinhoEstagios.map((item) => [
            `${item.CodEmpresa}:${item.CodCarrinhoPercurso}:${item.Item}`,
            [
              Params.equals('CodEmpresa', item.CodEmpresa),
              Params.equals('CodCarrinhoPercurso', item.CodCarrinhoPercurso),
              Params.equals('Item', item.Item),
            ],
          ]),
        ).values(),
      ).map((params) => this.repository.consulta(params)),
    );

    return consultas.flat();
  }

  private convert(mutations: any[] | any): ExpedicaoCarrinhoPercursoEstagioDto[] {
    return convertSocketMutationPayload(
      mutations,
      (mutation) => ExpedicaoCarrinhoPercursoEstagioDto.fromObject(mutation),
      {
        eventName: 'carrinho.percurso.estagio.mutation',
        requiredKeys: ['CodEmpresa', 'CodCarrinhoPercurso', 'Item', 'Origem', 'CodOrigem'],
      },
    );
  }

  private async loadSepararConsulta(
    itens: ExpedicaoCarrinhoPercursoEstagioConsultaDto[],
  ): Promise<ExpedicaoSepararConsultaDto[]> {
    const queryParams = Array.from(
      new Map(
        itens
          .filter((item) => item.Origem == 'SE')
          .map((item) => [
            `${item.CodEmpresa}:${item.CodOrigem}`,
            [
              Params.equals('CodEmpresa', item.CodEmpresa),
              Params.equals('CodSepararEstoque', item.CodOrigem),
            ],
          ]),
      ).values(),
    );
    const consultas = await mapWithConcurrency(queryParams, (params) => this.separarRepository.consulta(params));

    return consultas.flat();
  }

  private async loadCarrinhosPercurso(
    itens: ExpedicaoCarrinhoPercursoEstagioConsultaDto[],
  ): Promise<ExpedicaoCarrinhoPercursoDto[]> {
    const queryParams = Array.from(
      new Map(
        itens.map((item) => [
          `${item.CodEmpresa}:${item.CodCarrinhoPercurso}`,
          [
            Params.equals('CodEmpresa', item.CodEmpresa),
            Params.equals('CodCarrinhoPercurso', item.CodCarrinhoPercurso),
          ],
        ]),
      ).values(),
    );
    const consultas = await mapWithConcurrency(queryParams, (params) => this.carrinhoPercursoRepository.select(params));

    return consultas.flat();
  }
}
