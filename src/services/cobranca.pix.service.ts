import { STATUS } from '../type/status';

import Cobranca from '../entities/cobranca';
import CobrancaPix from '../entities/cobranca.pix';

import ProcessInfo from '../entities/process.info';
import CreatePixService from './create.pix.service';
import CobrancaPixInputDTO from '../dto/integracao/cobranca.pix.input.dto';
import CobrancaDigitalPixDto from '../dto/integracao/cobranca.digital.pix.dto';
import ContractBaseRepository from '../contracts/base.repository.contract';
import LocalBaseRepositoryContract from '../contracts/local.base.repository.contract';

export default class CobrancaPixService {
  constructor(
    readonly localRepository: LocalBaseRepositoryContract<CobrancaDigitalPixDto>,
    readonly onlineRepository: ContractBaseRepository<CobrancaPix>,
    readonly createPixService: CreatePixService,
  ) {}

  public async execute(cobranca: Cobranca): Promise<ProcessInfo> {
    try {
      for (let i = 0; i < cobranca.parcelas.length; i++) {
        const parcela = cobranca.parcelas[i];

        const input = new CobrancaPixInputDTO({
          id: parcela.sysId,
          expiracao: 3600,
          cnpj_cpf: cobranca.cliente.cnpj_cpf,
          nome: cobranca.cliente.nomeCliente,
          valor: parcela.valorParcela,
          solicitacaoPagador: parcela.observacao,
          infoAdicionais: [],
        });

        const result = await this.createPixService.execute(input);
        if (result instanceof ProcessInfo) return result;

        const localData = new CobrancaDigitalPixDto({
          sysId: parcela.sysId,
          sequencia: i + 1,
          txId: result.txId,
          dataCriacao: result.criacao,
          dataExpiracao: result.expiracao,
          qrCode: result.qrcode || '',
          imagemQrcode: result.imagemQrcode || '',
          valor: result.valor,
        });

        const onlineData = new CobrancaPix({
          sysId: parcela.sysId,
          txId: result.txId,
          STATUS: STATUS.AGUARDANDO,
          datacriacao: result.criacao,
          parcela: parcela.numeroParcela,
          valor: result.valor,
          linkQrCode: result.qrcode || '',
          imagemQrcode: result.imagemQrcode || '',
          nomeCliente: cobranca.cliente.nomeCliente,
          telefone: cobranca.cliente.telefone,
          eMail: cobranca.cliente.eMail,
          liberacaoKey: parcela.liberacaoKey,
        });

        await this.localRepository.insert(localData);
        await this.onlineRepository.insert(onlineData);
      }

      return new ProcessInfo({ status: 'success' }, '', '');
    } catch (error: any) {
      return new ProcessInfo({ status: 'error' }, error.message);
    }
  }
}
