import RegraStatusCobrancaPixService from '../services/regra.status.cobranca.pix.service';
import {
  createRegraStatusCobrancaPixService,
} from '../factory/integracao.pix.factory';

export default class AppRegraStatusCobrancaPix {
  private regraStatusCobrancaService: RegraStatusCobrancaPixService = createRegraStatusCobrancaPixService();

  public async execute(params: { codLiberacaoBloqueio: number; idLiberacao: number }): Promise<void> {
    await this.regraStatusCobrancaService.execute(params.codLiberacaoBloqueio, params.idLiberacao);
  }
}
