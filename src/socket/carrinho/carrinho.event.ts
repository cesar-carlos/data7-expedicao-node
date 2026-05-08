import { Server as SocketIOServer, Socket } from 'socket.io';
import { Params } from '../../contracts/local.base.params';
import ExpedicaoCarrinhoConsultaDto from '../../dto/expedicao/expedicao.carrinho.consulta.dto';
import ExpedicaoCarrinhoDto from '../../dto/expedicao/expedicao.carrinho.dto';
import { convertSocketMutationPayload } from '../socket.event.helpers';
import SocketCrudRegistrar from '../socket.crud.registrar';
import CarrinhoRepository from './carrinho.repository';

export default class CarrinhoEvent {
  private readonly repository = new CarrinhoRepository();

  constructor(io: SocketIOServer, socket: Socket) {
    const registrar = new SocketCrudRegistrar(io, socket);

    registrar.query({
      eventSuffix: 'carrinho.consulta',
      execute: (where, pagination, orderBy) => this.repository.consulta(where, pagination, orderBy),
      map: (item) => item.toJson(),
    });

    registrar.query({
      eventSuffix: 'carrinho.select',
      execute: (where, pagination, orderBy) => this.repository.select(where, pagination, orderBy),
      map: (item) => item.toJson(),
    });

    registrar.mutation({
      eventSuffix: 'carrinho.insert',
      convert: (mutation) => this.convert(mutation),
      beforeExecute: async (items) => {
        for (const item of items) {
          item.CodCarrinho = (await this.repository.sequence())?.Valor ?? 0;
        }
      },
      execute: async (items) => this.repository.insert(items),
      loadListen: async (items) => this.loadConsulta(items),
      responseMap: (item) => item.toJson(),
      listenChannel: 'carrinho.insert.listen',
      listenPayload: (items) => ({ Mutation: items.map((item) => item.toJson()) }),
    });

    registrar.mutation({
      eventSuffix: 'carrinho.update',
      convert: (mutation) => this.convert(mutation),
      execute: async (items) => this.repository.update(items),
      loadListen: async (items) => this.loadConsulta(items),
      responseMap: (item) => item.toJson(),
      listenChannel: 'carrinho.update.listen',
      listenPayload: (items) => ({ Mutation: items.map((item) => item.toJson()) }),
      allowEmptyMutation: true,
    });

    registrar.mutation({
      eventSuffix: 'carrinho.delete',
      convert: (mutation) => this.convert(mutation),
      execute: async (items) => this.repository.delete(items),
      loadListen: async (items) => this.loadConsulta(items),
      loadListenBeforeExecute: true,
      responseMap: (item) => item.toJson(),
      listenChannel: 'carrinho.delete.listen',
      listenPayload: (items) => ({ Mutation: items.map((item) => item.toJson()) }),
      allowEmptyMutation: true,
    });
  }

  private async loadConsulta(items: ExpedicaoCarrinhoDto[]): Promise<ExpedicaoCarrinhoConsultaDto[]> {
    const results = await Promise.all(
      items.map((item) => this.repository.consulta([Params.equals('CodCarrinho', item.CodCarrinho)])),
    );

    return results.flat();
  }

  private convert(mutations: unknown[] | unknown): ExpedicaoCarrinhoDto[] {
    return convertSocketMutationPayload(
      mutations,
      (mutation) => ExpedicaoCarrinhoDto.fromObject(mutation),
      { eventName: 'carrinho.mutation' },
    );
  }
}
