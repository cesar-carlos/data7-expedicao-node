import ContractBaseRepository from '../contracts/base.repository.contract';
import LocalBaseRepositoryContract from '../contracts/local.base.repository.contract';
import CobrancaPixConsultaService from './cobranca.pix.consulta.service';
import CobrancaDigitalPixDto from '../dto/integracao/cobranca.digital.pix.dto';
import PagamentoPix from '../entities/pagamento.pix';
import CobrancaDigitalPixPagamentoDto from '../dto/integracao/cobranca.digital.pix.pagamento.dto';

export default class CobrancaPixConsultaPagamentoService {
  constructor(
    private localRepository: LocalBaseRepositoryContract<CobrancaDigitalPixDto>,
    readonly onlineRepository: ContractBaseRepository<PagamentoPix>,
  ) {}

  async execute(
    Chave: string,
    Origem: string,
    CodOrigem: number,
  ): Promise<CobrancaDigitalPixPagamentoDto[] | undefined> {
    try {
      const cobrancaDigitalPix = await this.localRepository.selectWhere([
        { key: 'SysId', value: `%.${Origem}.${CodOrigem}%`, operator: 'like' },
      ]);

      if (!cobrancaDigitalPix) return undefined;
      const result: CobrancaDigitalPixPagamentoDto[] = [];

      const cobrancaPixConsultaService = new CobrancaPixConsultaService(this.onlineRepository);
      for (const cobranca of cobrancaDigitalPix) {
        const cobrancaPixOnline = await cobrancaPixConsultaService.execute(cobranca.txId);
        if (!cobrancaPixOnline) continue;

        if (cobrancaPixOnline.valor.toFixed(2) == cobranca.valor.toFixed(2) && cobrancaPixOnline.chave == Chave) {
          result.push(
            CobrancaDigitalPixPagamentoDto.create({
              sysId: cobranca.sysId,
              chave: cobrancaPixOnline.chave,
              sequencia: cobranca.sequencia,
              txId: cobranca.txId,
              endToEndId: cobrancaPixOnline.endToEndId,
              dataCriacao: cobranca.dataCriacao,
              dataExpiracao: cobranca.dataExpiracao,
              dataPagamento: cobrancaPixOnline.horario,
              qrCode: cobranca.qrCode,
              imagemQrcode: cobranca.imagemQrcode,
              valor: cobranca.valor,
            }),
          );
        }
      }

      return result;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
