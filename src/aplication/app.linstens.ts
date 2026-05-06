import { eContext } from '../dependency/container.dependency';
import { Server as SocketIOServer } from 'socket.io';

import CobrancaPix from '../entities/cobranca.pix';
import PagamentoPix from '../entities/pagamento.pix';

import AppDependencys from './app.dependencys';
import ContractBaseRepository from '../contracts/base.repository.contract';
import LocalBaseRepositoryContract from '../contracts/local.base.repository.contract';
import CobrancaDigitalPagamentoDto from '../dto/integracao/cobranca.digital.pagamento.dto';
import CobrancaPixListenRefleshService from '../services/cobranca.pix.listen.reflesh.service';
import CobrancaDigitalTituloDto from '../dto/integracao/cobranca.digital.titulo.dto';
import CobrancaPixListenService from '../services/cobranca.pix.listen.service';
import SepararPeriodicListenService from '../services/separar.periodic.listen.service';

export default class AppLinstens {
  private separarPeriodicListen: SepararPeriodicListenService | null = null;

  constructor(private readonly io: SocketIOServer) {}

  execute() {
    this.listenCobrancaPix();
    this.listenRefleshCobrancaPix();
    this.listenSepararPeriodic();
  }

  private async listenCobrancaPix() {
    const firebaseCobrancaPixRepository = AppDependencys.resolve<ContractBaseRepository<CobrancaPix>>({
      context: process.env.ONLINE_DATABASE?.toLocaleLowerCase() as eContext,
      bind: 'ContractBaseRepository<CobrancaPix>',
    });

    const firebasePagamentoPixRepository = AppDependencys.resolve<ContractBaseRepository<PagamentoPix>>({
      context: process.env.ONLINE_DATABASE?.toLocaleLowerCase() as eContext,
      bind: 'ContractBaseRepository<PagamentoPix>',
    });

    const localCobrancaDigitalTituloRepository = AppDependencys.resolve<
      LocalBaseRepositoryContract<CobrancaDigitalTituloDto>
    >({
      context: process.env.LOCAL_DATABASE?.toLocaleLowerCase() as eContext,
      bind: 'LocalBaseRepositoryContract<CobrancaDigitalTituloDto>',
    });

    const localCobrancaDigitalPagamentoRepository = AppDependencys.resolve<
      LocalBaseRepositoryContract<CobrancaDigitalPagamentoDto>
    >({
      context: process.env.LOCAL_DATABASE?.toLocaleLowerCase() as eContext,
      bind: 'LocalBaseRepositoryContract<CobrancaDigitalPagamentoDto>',
    });

    new CobrancaPixListenService(
      firebaseCobrancaPixRepository,
      firebasePagamentoPixRepository,
      localCobrancaDigitalTituloRepository,
      localCobrancaDigitalPagamentoRepository,
    ).listen();
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
