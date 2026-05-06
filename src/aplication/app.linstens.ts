import { Server as SocketIOServer } from 'socket.io';
import CobrancaPixListenRefleshService from '../services/cobranca.pix.listen.reflesh.service';
import SepararPeriodicListenService from '../services/separar.periodic.listen.service';
import { resolveSepararPeriodicListenConfig } from '../services/separar.periodic.listen.config';
import {
  createCobrancaPixListenService,
} from '../factory/integracao.pix.factory';

export default class AppLinstens {
  private separarPeriodicListen: SepararPeriodicListenService | null = null;

  constructor(private readonly io: SocketIOServer) {}

  start() {
    this.listenCobrancaPix();
    this.listenRefleshCobrancaPix();
    this.listenSepararPeriodic();
  }

  execute() {
    this.start();
  }

  private async listenCobrancaPix() {
    createCobrancaPixListenService().listen();
  }

  private listenRefleshCobrancaPix() {
    new CobrancaPixListenRefleshService().listen();
  }

  /**
   * Poll periódico da consulta de separação (`separar.consulta.listen`).
   * Desligue com `SEPARAR_LISTEN_ENABLED=false`. Em várias réplicas Node, cada processo roda o próprio timer.
   */
  private listenSepararPeriodic() {
    const cfg = resolveSepararPeriodicListenConfig();
    if (!cfg.enabled) {
      console.log('[AppLinstens] Emissão periódica de Separar desabilitada (SEPARAR_LISTEN_ENABLED)');
      return;
    }

    this.separarPeriodicListen = new SepararPeriodicListenService(this.io, {
      intervalMs: cfg.intervalMs,
      limit: cfg.limit,
      debug: cfg.debug,
    });
    this.separarPeriodicListen.start();
    console.log('Serviço de emissão periódica de Separar iniciado automaticamente');
  }

  /**
   * Encerra listeners periódicos (ex.: antes de fechar pool / processo).
   */
  stopPeriodicListeners(): void {
    this.separarPeriodicListen?.stop();
    this.separarPeriodicListen = null;
  }
}
