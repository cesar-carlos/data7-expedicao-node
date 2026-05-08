import { STATUS } from '../type/status';
import PagamentoAdicionais from './pagamento.adicionais';

export type devedor = {
  cnpj_cpf?: string;
  nome?: string;
};

export default class PagamentoPendente {
  sysId: string;
  chave: string;
  txId: string;
  status: STATUS;
  devedor: devedor;
  criacao: Date;
  expiracao: Date;
  valor: number;
  solicitacaoPagador: string;
  adicionais?: PagamentoAdicionais[];
  qrcode?: string;
  imagemQrcode?: string;

  constructor(params: {
    sysId: string;
    chave: string;
    txId: string;
    status: STATUS;
    devedor: devedor;
    criacao: Date;
    expiracao: Date;
    valor: number;
    solicitacaoPagador: string;
    adicionais?: PagamentoAdicionais[];
    qrcode?: string;
    imagemQrcode?: string;
  }) {
    this.sysId = params.sysId;
    this.chave = params.chave;
    this.txId = params.txId;
    this.status = params.status;
    this.devedor = params.devedor;
    this.criacao = params.criacao;
    this.expiracao = params.expiracao;
    this.valor = params.valor;
    this.solicitacaoPagador = params.solicitacaoPagador;
    this.adicionais = params.adicionais;
    this.qrcode = params.qrcode;
    this.imagemQrcode = params.imagemQrcode;
  }
}
