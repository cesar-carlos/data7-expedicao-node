import PagamentoPix from '../entities/pagamento.pix';
import ContractBaseRepository from '../contracts/base.repository.contract';
import LocalBaseRepositoryContract from '../contracts/local.base.repository.contract';
import CobrancaDigitalPagamentoDto from '../dto/integracao/cobranca.digital.pagamento.dto';

export default class PagamentoPixService {
  private localRepository: LocalBaseRepositoryContract<CobrancaDigitalPagamentoDto>;
  private onlineRepository: ContractBaseRepository<PagamentoPix>;

  constructor(
    localRepository: LocalBaseRepositoryContract<CobrancaDigitalPagamentoDto>,
    onlineRepository: ContractBaseRepository<PagamentoPix>,
  ) {
    this.localRepository = localRepository;
    this.onlineRepository = onlineRepository;
  }

  public async execute(params: { sysId: string; txId: string }): Promise<void> {
    try {
      const localPagamentos = await this.localRepository.selectWhere([{ key: 'SysId', value: params.sysId }]);
      const fbPagamento = await this.onlineRepository.findWhere('Txid', params.txId);

      fbPagamento?.forEach(async (item) => {
        const exists = localPagamentos?.find((loc) => loc.endToEndId === item.endToEndId);
        if (!exists) {
          const nextSequencia =
            localPagamentos?.reduce((acc, cur) => (acc > cur.sequencia ? acc : cur.sequencia), 0) ?? 0;

          const cobDigitalPagamentoDto = new CobrancaDigitalPagamentoDto({
            sysId: params.sysId,
            sequencia: nextSequencia + 1,
            status: 'P',
            endToEndId: item.endToEndId,
            chave: item.chave,
            dataPagamento: item.horario,
            valor: item.valor,
            observacao: item.infoPagador ?? '',
          });

          this.localRepository.insert(cobDigitalPagamentoDto);
        }
      });
    } catch (error: any) {
      throw new Error(error).message;
    }
  }
}
