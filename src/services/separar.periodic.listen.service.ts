import { createHash } from 'crypto';
import { Server as SocketIOServer } from 'socket.io';
import { Pagination, OrderBy } from '../contracts/local.base.params';

import BasePeriodicListenService from './base.periodic.listen.service';
import ExpedicaoBasicListenEvent from '../model/expedicao.basic.listen.event';
import SepararRepository from '../socket/separar/separar.repository';

export default class SepararPeriodicListenService extends BasePeriodicListenService {
  private repository: SepararRepository;
  private io: SocketIOServer;
  private lastPayloadHash: string | null = null;
  private hadClientsLastTick = false;

  constructor(io: SocketIOServer, intervalTime: number = 8000) {
    super(intervalTime);
    this.io = io;
    this.repository = new SepararRepository();
  }

  /**
   * Emissão periódica de separar.consulta: últimos 20 registros por CodEmpresa DESC, CodSepararEstoque DESC.
   * Sem clientes conectados não consulta o banco. Evita emitir payload idêntico ao anterior (exceto na primeira conexão após período sem clientes).
   */
  protected async emitData(): Promise<void> {
    const clientCount = this.io.sockets.sockets.size;
    if (clientCount === 0) {
      this.hadClientsLastTick = false;
      return;
    }

    const forceRefresh = !this.hadClientsLastTick;
    this.hadClientsLastTick = true;

    const pagination = Pagination.create(20, 0, 1);
    const orderBy = OrderBy.create('CodEmpresa, CodSepararEstoque', 'DESC');

    const separarConsulta = await this.repository.consulta([], pagination, orderBy);

    const rows = separarConsulta.map((item) => item.toJson());
    const payload = { Data: rows };
    const fingerprint = createHash('sha256').update(JSON.stringify(payload)).digest('hex');

    if (!forceRefresh && fingerprint === this.lastPayloadHash) {
      return;
    }

    this.lastPayloadHash = fingerprint;

    const basicEventSepararConsulta = new ExpedicaoBasicListenEvent({
      Data: rows,
    });

    this.io.emit('separar.consulta.listen', JSON.stringify(basicEventSepararConsulta.toJson()));
  }
}
