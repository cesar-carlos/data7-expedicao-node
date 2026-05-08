import ContractBaseRepository from '../contracts/base.repository.contract';
import PagamentoPix from '../entities/pagamento.pix';

export default class CobrancaPixConsultaService {
  constructor(readonly onlineRepository: ContractBaseRepository<PagamentoPix>) {}

  async execute(txId: string): Promise<PagamentoPix | undefined> {
    try {
      const pagamentoPix = await this.onlineRepository.findWhere('Txid', txId);
      if (pagamentoPix) return pagamentoPix[0];
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
