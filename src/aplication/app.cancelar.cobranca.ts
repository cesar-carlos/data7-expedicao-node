import CancelamentoPixService from '../services/cancelamento.pix.service';
import {
  createCancelamentoPixService,
} from '../factory/integracao.pix.factory';

export default class AppCancelarCobranca {
  private sysId: string;
  private requerente: string; //'CS: CANCELADO-SISTEMA' | CC: 'CANCELADO-CLIENTE' | PG:'PAGAMENTO-CLIENTE'

  constructor(params: { sysId: string; requerente: string }) {
    this.sysId = params.sysId;
    this.requerente = params.requerente;
  }

  public async execute(): Promise<void> {
    const cancelamentoPixService: CancelamentoPixService = createCancelamentoPixService();
    await cancelamentoPixService.execute({ sysId: this.sysId, status: this.requerente });
  }
}
