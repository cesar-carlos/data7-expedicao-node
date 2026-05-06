import { Server as SocketIOServer, Socket } from 'socket.io';
import { Pagination, OrderBy, Params } from '../../contracts/local.base.params';

import EstoqueConversaoUnidadeRepository from './estoque.conversao.unidade.repository';
import EstoqueConversaoUnidadeDto from '../../dto/common.data/estoque.conversao.unidade.dto';
import ExpedicaoMutationBasicEvent from '../../model/expedicao.basic.mutation.event';
import ExpedicaoBasicSelectEvent from '../../model/expedicao.basic.query.event';
import ExpedicaoBasicErrorEvent from '../../model/expedicao.basic.error.event';

export default class EstoqueConversaoUnidadeEvent {
  private repository = new EstoqueConversaoUnidadeRepository();

  constructor(io: SocketIOServer, socket: Socket) {
    const client = socket.id;
    socket.on(`${client} produto.conversao.unidade.consulta`, async (data) => {
      const json = JSON.parse(data);

      const session = json['Session'] ?? '';
      const responseIn = json['ResponseIn'] ?? `${client} estoque.produto.conversao.unidade.consulta`;
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

    socket.on(`${client} produto.conversao.unidade.select`, async (data) => {
      const json = JSON.parse(data);
      const session = json['Session'] ?? '';
      const responseIn = json['ResponseIn'] ?? `${client} estoque.produto.conversao.unidade.select`;
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

    socket.on(`${client} produto.conversao.unidade.insert`, async (data) => {
      const json = JSON.parse(data);
      const session = json['Session'] ?? '';
      const responseIn = json['ResponseIn'] ?? (`${client} estoque.produto.conversao.unidade.insert` as string);
      const mutation = json['Mutation'];

      try {
        const itens = this.convert(mutation);
        for (const el of itens) {
          const sequence = await this.repository.sequence();
          el.CodProduto = sequence?.Valor ?? 0;
          el.Item = await this.lestItem(el.CodProduto);
          await this.repository.insert([el]);
        }

        const basicEvent = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: itens.map((item) => item.toJson()),
        });

        socket.emit(responseIn, JSON.stringify(basicEvent.toJson()));
        io.emit('produto.conversao.unidade.insert.listen', JSON.stringify(basicEvent.toJson()));
      } catch (error: any) {
        const event = new ExpedicaoBasicErrorEvent({
          Session: session,
          ResponseIn: responseIn,
          Error: error.message,
        });

        socket.emit(responseIn, JSON.stringify(event.toJson()));
      }
    });

    socket.on(`${client} produto.conversao.unidade.update`, async (data) => {
      const json = JSON.parse(data);
      const session = json['Session'] ?? '';
      const responseIn = json['ResponseIn'] ?? `${client} estoque.produto.conversao.unidade.update`;
      const mutation = json['Mutation'];

      try {
        const itens = this.convert(mutation);
        await this.repository.update(itens);

        const basicEvent = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: itens.map((item) => item.toJson()),
        });

        socket.emit(responseIn, JSON.stringify(basicEvent.toJson()));
        io.emit('produto.conversao.unidade.update.listen', JSON.stringify(basicEvent.toJson()));
      } catch (error: any) {
        const event = new ExpedicaoBasicErrorEvent({
          Session: session,
          ResponseIn: responseIn,
          Error: error.message,
        });

        socket.emit(responseIn, JSON.stringify(event.toJson()));
      }
    });

    socket.on(`${client} produto.conversao.unidade.delete`, async (data) => {
      const json = JSON.parse(data);
      const session = json['Session'] ?? '';
      const responseIn = json['ResponseIn'] ?? `${client} estoque.produto.conversao.unidade.delete`;
      const mutation = json['Mutation'];

      try {
        const itens = this.convert(mutation);
        await this.repository.delete(itens);

        const basicEvent = new ExpedicaoMutationBasicEvent({
          Session: session,
          ResponseIn: responseIn,
          Mutation: itens.map((item) => item.toJson()),
        });

        socket.emit(responseIn, JSON.stringify(basicEvent.toJson()));
        io.emit('produto.conversao.unidade.delete.listen', JSON.stringify(basicEvent.toJson()));
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

  private convert(mutations: any[] | any): EstoqueConversaoUnidadeDto[] {
    try {
      if (!Array.isArray(mutations)) mutations = [mutations];
      return mutations.map((mutation: any) => {
        return EstoqueConversaoUnidadeDto.fromObject(mutation);
      });
    } catch (error) {
      return [];
    }
  }

  private async lestItem(codProduto: number): Promise<string> {
    const itens = await this.repository.select([Params.equals('CodProduto', codProduto)]);
    if (itens.length == 0) return '001';
    const list = itens.map((item) => item.Item);
    const max = Math.max(...list.map((item) => Number(item)));
    return String(max + 1).padStart(3, '0');
  }
}
