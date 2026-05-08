import * as Pagamento from '../type/status';

import CobrancaPix from '../entities/cobranca.pix';
import PagamentoPixService from './pagamento.pix.service';
import CancelamentoPixService from './cancelamento.pix.service';
import FirebaseCobrancaPixListenRepository from '../repository/firebase/firebase.cobranca.pix.listen.repository';

import PagamentoPix from '../entities/pagamento.pix';
import ContractBaseRepository from '../contracts/base.repository.contract';
import LocalBaseRepositoryContract from '../contracts/local.base.repository.contract';
import CobrancaDigitalTituloDto from '../dto/integracao/cobranca.digital.titulo.dto';
import CobrancaDigitalPagamentoDto from '../dto/integracao/cobranca.digital.pagamento.dto';

export default class CobrancaPixListenService {
  private fbCobrancaPixListenRepository = new FirebaseCobrancaPixListenRepository();

  constructor(
    private onlineRepoCobrancaPix: ContractBaseRepository<CobrancaPix>,
    private onlineRepoPagamentoPix: ContractBaseRepository<PagamentoPix>,
    private localRepoCobrancaDigitalTituloDto: LocalBaseRepositoryContract<CobrancaDigitalTituloDto>,
    private localRepoCobrancaDigitalPagamentoDto: LocalBaseRepositoryContract<CobrancaDigitalPagamentoDto>,
  ) {}

  public listen() {
    this.fbCobrancaPixListenRepository.listen(async (cobrancaPix: CobrancaPix) => {
      try {
        if (cobrancaPix.STATUS === Pagamento.STATUS.CONCLUIDO) {
          await new PagamentoPixService(this.localRepoCobrancaDigitalPagamentoDto, this.onlineRepoPagamentoPix).execute(
            { sysId: cobrancaPix.sysId, txId: cobrancaPix.txId },
          );

          //FINALIZAR COBRANCA
          cobrancaPix.STATUS = Pagamento.STATUS.FINALIZADO;
          await this.onlineRepoCobrancaPix.update(cobrancaPix);
        }

        if (cobrancaPix.STATUS === Pagamento.STATUS.CANCELADO_CLIENTE) {
          new CancelamentoPixService(this.localRepoCobrancaDigitalTituloDto, this.onlineRepoCobrancaPix).execute({
            sysId: cobrancaPix.sysId,
            status: 'CC',
          });

          //FINALIZAR COBRANCA
          cobrancaPix.STATUS = Pagamento.STATUS.CANCELADO;
          await this.onlineRepoCobrancaPix.update(cobrancaPix);
        }
      } catch (error: any) {
        console.log(error.message);
      }
    });
  }
}
