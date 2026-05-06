import { Server as SocketIOServer } from 'socket.io';
import CobrancaPixListenRefleshService from '../services/cobranca.pix.listen.reflesh.service';
import SepararPeriodicListenService from '../services/separar.periodic.listen.service';
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

  private listenSepararPeriodic() {
    this.separarPeriodicListen = new SepararPeriodicListenService(this.io);
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
