import { Server as SocketIOServer, Socket } from 'socket.io';
import { Params } from '../../contracts/local.base.params';
import ExpedicaoSetorEstoqueDto from '../../dto/expedicao/expedicao.setor.estoque.dto';
import { convertSocketMutationPayload } from '../socket.event.helpers';
import SocketCrudRegistrar from '../socket.crud.registrar';
import SetorEstoqueRepository from './setor.estoque.repository';

export default class SetorEstoqueEvent {
  private readonly repository = new SetorEstoqueRepository();

  constructor(io: SocketIOServer, socket: Socket) {
    const registrar = new SocketCrudRegistrar(io, socket);

    registrar.query({
      eventSuffix: 'setor.estoque.select',
      execute: (where, pagination, orderBy) => this.repository.select(where, pagination, orderBy),
      map: (item) => item.toJson(),
    });

    registrar.mutation({
      eventSuffix: 'setor.estoque.insert',
      convert: (mutation) => this.convert(mutation),
      beforeExecute: async (items) => {
        for (const item of items) {
          if (item.CodSetorEstoque <= 0) {
            item.CodSetorEstoque = (await this.repository.sequence())?.Valor ?? 0;
          }
        }
      },
      execute: async (items) => this.repository.insert(items),
      loadListen: async (items) => this.loadSelected(items),
      responseMap: (item) => item.toJson(),
      listenChannel: 'setor.estoque.insert.listen',
      listenPayload: (items) => ({ Mutation: items.map((item) => item.toJson()) }),
    });

    registrar.mutation({
      eventSuffix: 'setor.estoque.update',
      convert: (mutation) => this.convert(mutation),
      execute: async (items) => this.repository.update(items),
      loadListen: async (items) => this.loadSelected(items),
      responseMap: (item) => item.toJson(),
      listenChannel: 'setor.estoque.update.listen',
      listenPayload: (items) => ({ Mutation: items.map((item) => item.toJson()) }),
      allowEmptyMutation: true,
    });

    registrar.mutation({
      eventSuffix: 'setor.estoque.delete',
      convert: (mutation) => this.convert(mutation),
      execute: async (items) => this.repository.delete(items),
      loadListen: async (items) => this.loadSelected(items),
      loadListenBeforeExecute: true,
      responseMap: (item) => item.toJson(),
      listenChannel: 'setor.estoque.delete.listen',
      listenPayload: (items) => ({ Mutation: items.map((item) => item.toJson()) }),
      allowEmptyMutation: true,
    });
  }

  private async loadSelected(items: ExpedicaoSetorEstoqueDto[]): Promise<ExpedicaoSetorEstoqueDto[]> {
    const result = await Promise.all(
      items.map((item) => this.repository.select([Params.equals('CodSetorEstoque', item.CodSetorEstoque)])),
    );

    return result.flat();
  }

  private convert(mutations: unknown[] | unknown): ExpedicaoSetorEstoqueDto[] {
    return convertSocketMutationPayload(
      mutations,
      (mutation) => ExpedicaoSetorEstoqueDto.fromObject(mutation),
      { eventName: 'setor.estoque.mutation' },
    );
  }
}
