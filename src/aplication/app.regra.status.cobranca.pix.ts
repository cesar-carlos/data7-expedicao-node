import { getLocalDbContext, getOnlineDbContext } from '../di/database.context';
import { DI_BIND } from '../di/bind.tokens';

import CobrancaPix from '../entities/cobranca.pix';
import ContractBaseRepository from '../contracts/base.repository.contract';
import ItemLiberacaoBloqueioDto from '../dto/common.data/item.liberacao.bloqueio.dto';
import LocalBaseRepositoryContract from '../contracts/local.base.repository.contract';
import RegraStatusCobrancaPixService from '../services/regra.status.cobranca.pix.service';
import CobrancaDigitalDto from '../dto/integracao/cobranca.digital.dto';
import AppDependencys from './app.dependencys';

export default class AppRegraStatusCobrancaPix {
  private localRepositoryLiberacao = AppDependencys.resolve<LocalBaseRepositoryContract<ItemLiberacaoBloqueioDto>>({
    context: getLocalDbContext(),
    bind: DI_BIND.LocalBaseRepositoryContract_ItemLiberacaoBloqueioDto,
  });

  private localRepositoryCobranca = AppDependencys.resolve<LocalBaseRepositoryContract<CobrancaDigitalDto>>({
    context: getLocalDbContext(),
    bind: DI_BIND.LocalBaseRepositoryContract_CobrancaDigitalDto,
  });

  private onlineRepository = AppDependencys.resolve<ContractBaseRepository<CobrancaPix>>({
    context: getOnlineDbContext(),
    bind: DI_BIND.ContractBaseRepository_CobrancaPix,
  });

  private regraStatusCobrancaService = new RegraStatusCobrancaPixService(
    this.localRepositoryLiberacao,
    this.localRepositoryCobranca,
    this.onlineRepository,
  );

  public async execute(params: { codLiberacaoBloqueio: number; idLiberacao: number }): Promise<void> {
    await this.regraStatusCobrancaService.execute(params.codLiberacaoBloqueio, params.idLiberacao);
  }
}
