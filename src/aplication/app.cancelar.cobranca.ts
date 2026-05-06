import { getLocalDbContext, getOnlineDbContext } from '../di/database.context';
import { DI_BIND } from '../di/bind.tokens';

import LocalBaseRepositoryContract from '../contracts/local.base.repository.contract';
import CobrancaDigitalTituloDto from '../dto/integracao/cobranca.digital.titulo.dto';
import ContractBaseRepository from '../contracts/base.repository.contract';
import CancelamentoPixService from '../services/cancelamento.pix.service';
import CobrancaPix from '../entities/cobranca.pix';
import AppDependencys from './app.dependencys';

export default class AppCancelarCobranca {
  private sysId: string;
  private requerente: string; //'CS: CANCELADO-SISTEMA' | CC: 'CANCELADO-CLIENTE' | PG:'PAGAMENTO-CLIENTE'

  constructor(params: { sysId: string; requerente: string }) {
    this.sysId = params.sysId;
    this.requerente = params.requerente;
  }

  public async execute() {
    const localRepository = AppDependencys.resolve<LocalBaseRepositoryContract<CobrancaDigitalTituloDto>>({
      context: getLocalDbContext(),
      bind: DI_BIND.LocalBaseRepositoryContract_CobrancaDigitalTituloDto,
    });

    const onlineRepository = AppDependencys.resolve<ContractBaseRepository<CobrancaPix>>({
      context: getOnlineDbContext(),
      bind: DI_BIND.ContractBaseRepository_CobrancaPix,
    });

    const cancelamentoPixService = new CancelamentoPixService(localRepository, onlineRepository);
    cancelamentoPixService.execute({ sysId: this.sysId, status: this.requerente });
  }
}
