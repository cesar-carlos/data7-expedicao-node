import moment from 'moment';

import { txid } from '../helper/txid.help';
import { infoAdicionais } from '../dto/api.requets/request.create.pix.dto';

import ProcessInfo from '../entities/process.info';
import PagamentoPendente from '../entities/pagamento.pendente';
import CobrancaPixInputDTO from '../dto/integracao/cobranca.pix.input.dto';
import CreatePixApiContract from '../contracts/create.pix.api.contract';

export default class CreatePixService {
  constructor(private create: CreatePixApiContract) {}

  public async execute(input: CobrancaPixInputDTO): Promise<PagamentoPendente | ProcessInfo> {
    try {
      const adicionais: infoAdicionais[] = [{ nome: 'sysId', valor: input.id }];
      input.infoAdicionais.forEach((item) => {
        adicionais.push({ nome: item.nome, valor: item.valor });
      });

      const result = await this.create.execute({
        sysId: input.id,
        params: { txid: txid.create() },
        calendario: { expiracao: input.expiracao },
        devedor: { cnpj_cpf: input.cnpj_cpf, nome: input.nome },
        valor: { original: input.valor.toFixed(2).toString() },
        solicitacaoPagador: input.solicitacaoPagador,
        infoAdicionais: adicionais,
      });

      const params = {
        sysId: result.sysId,
        chave: result.chave,
        txId: result.txid,
        status: result.status,
        devedor: result.devedor,
        criacao: result.calendario.criacao,
        expiracao: moment(result.calendario.criacao).add(result.calendario.expiracao, 'minute').toDate(),
        valor: Number.parseFloat(result.valor.original),
        solicitacaoPagador: result.solicitacaoPagador,
        adicionais: result.infoAdicionais,
        qrcode: result.qrcode,
        imagemQrcode: result.imagemQrcode,
      };

      const output = new PagamentoPendente(params);
      return output;
    } catch (error: any) {
      return new ProcessInfo({ status: 'error' }, error.message);
    }
  }
}
