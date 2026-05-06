import { createHash } from 'crypto';
import { Server as SocketIOServer } from 'socket.io';
import { Pagination, OrderBy } from '../contracts/local.base.params';

import BasePeriodicListenService from './base.periodic.listen.service';
import ExpedicaoBasicListenEvent from '../model/expedicao.basic.listen.event';
import SepararRepository from '../socket/separar/separar.repository';

/** Opções de runtime (env via {@link resolveSepararPeriodicListenConfig} ou testes). */
export type SepararPeriodicListenRuntimeOptions = {
  intervalMs: number;
  limit: number;
  debug: boolean;
  repository?: SepararRepository;
};

export default class SepararPeriodicListenService extends BasePeriodicListenService {
  private repository: SepararRepository;
  private io: SocketIOServer;
  private readonly limit: number;
  private readonly debug: boolean;
  private lastPayloadHash: string | null = null;
  private hadClientsLastTick = false;

  constructor(io: SocketIOServer, options: SepararPeriodicListenRuntimeOptions) {
    super(options.intervalMs);
    this.io = io;
    this.limit = options.limit;
    this.debug = options.debug;
    this.repository = options.repository ?? new SepararRepository();
  }

  /**
   * Emissão periódica de `separar.consulta.listen`.
   *
   * Consulta paginada: **uma página global** com até `limit` linhas (não é “limit por empresa”).
   * Ordenação: `CodEmpresa ASC`, `CodSepararEstoque DESC` — empresas com código menor primeiro;
   * dentro da mesma empresa, separações com maior `CodSepararEstoque` primeiro (em geral mais recentes).
   *
   * Sem clientes Socket.IO conectados no namespace default → não consulta o banco.
   * Evita emitir payload idêntico ao anterior (hash SHA-256), exceto quando `forceRefresh`
   * após período sem clientes (novo cliente precisa receber snapshot).
   *
   * Várias instâncias Node (PM2 cluster / réplicas) executam cada uma o próprio timer → várias
   * consultas ao SQL e vários broadcasts; para um único poll use um único processo ou adapter Redis.
   */
  protected async emitData(): Promise<void> {
    const clientCount = this.io.sockets.sockets.size;
    if (clientCount === 0) {
      this.hadClientsLastTick = false;
      return;
    }

    const forceRefresh = !this.hadClientsLastTick;
    this.hadClientsLastTick = true;

    const pagination = Pagination.create(this.limit, 0, 1);
    const orderBy = OrderBy.create('CodEmpresa, CodSepararEstoque', 'ASC,DESC');

    const separarConsulta = await this.repository.consulta([], pagination, orderBy);
    const list = Array.isArray(separarConsulta) ? separarConsulta : [];

    const rows = list.map((item) => item.toJson());
    const payload = { Data: rows };
    const fingerprint = createHash('sha256').update(JSON.stringify(payload)).digest('hex');

    if (!forceRefresh && fingerprint === this.lastPayloadHash) {
      if (this.debug) {
        console.log(
          `[SepararPeriodicListenService] Emit omitido (payload idêntico ao anterior); limit=${this.limit}`,
        );
      }
      return;
    }

    this.lastPayloadHash = fingerprint;

    const basicEventSepararConsulta = new ExpedicaoBasicListenEvent({
      Data: rows,
    });

    if (this.debug) {
      console.log(
        `[SepararPeriodicListenService] Emit separar.consulta.listen; linhas=${rows.length}; limit=${this.limit}`,
      );
    }

    this.io.emit('separar.consulta.listen', JSON.stringify(basicEventSepararConsulta.toJson()));
  }
}
