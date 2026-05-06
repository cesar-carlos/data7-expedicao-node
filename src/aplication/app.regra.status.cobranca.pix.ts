import RegraStatusCobrancaPixService from '../services/regra.status.cobranca.pix.service';
import {
  createCobrancaDigitalRepository,
  createItemLiberacaoBloqueioRepository,
  createOnlineCobrancaRepository,
} from '../factory/integracao.pix.factory';

export default class AppRegraStatusCobrancaPix {
  private localRepositoryLiberacao = createItemLiberacaoBloqueioRepository();
  private localRepositoryCobranca = createCobrancaDigitalRepository();
  private onlineRepository = createOnlineCobrancaRepository();

  private regraStatusCobrancaService = new RegraStatusCobrancaPixService(
    this.localRepositoryLiberacao,
    this.localRepositoryCobranca,
    this.onlineRepository,
  );

  public async execute(params: { codLiberacaoBloqueio: number; idLiberacao: number }): Promise<void> {
    await this.regraStatusCobrancaService.execute(params.codLiberacaoBloqueio, params.idLiberacao);
  }
}
