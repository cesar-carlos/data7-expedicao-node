import { STATUS } from '../type/status';
import CobrancaLiberacaoKey from './cobranca.liberacao.key';

export default class CobrancaPix {
  readonly sysId: string;
  readonly txId: string;
  public STATUS: STATUS;
  readonly datacriacao: Date;
  readonly parcela: string;
  readonly valor: number;
  readonly linkQrCode: string;
  readonly imagemQrcode: string;
  readonly nomeCliente: string;
  readonly telefone: string | null;
  readonly eMail: string | null;
  readonly liberacaoKey: CobrancaLiberacaoKey;

  constructor(params: {
    sysId: string;
    txId: string;
    STATUS: STATUS;
    datacriacao: Date;
    parcela: string;
    valor: number;
    linkQrCode: string;
    imagemQrcode: string;
    nomeCliente: string;
    telefone: string | null;
    eMail: string | null;
    liberacaoKey: CobrancaLiberacaoKey;
  }) {
    this.sysId = params.sysId;
    this.txId = params.txId;
    this.STATUS = params.STATUS;
    this.datacriacao = params.datacriacao;
    this.parcela = params.parcela;
    this.valor = params.valor;
    this.linkQrCode = params.linkQrCode;
    this.imagemQrcode = params.imagemQrcode;
    this.nomeCliente = params.nomeCliente;
    this.telefone = params.telefone;
    this.eMail = params.eMail;
    this.liberacaoKey = params.liberacaoKey;
  }

  static create(params: {
    sysId: string;
    txId: string;
    STATUS: STATUS;
    datacriacao: Date;
    parcela: string;
    valor: number;
    linkQrCode: string;
    imagemQrcode: string;
    nomeCliente: string;
    telefone: string | null;
    eMail: string | null;
    liberacaoKey: CobrancaLiberacaoKey;
  }) {
    return new CobrancaPix(params);
  }
}
