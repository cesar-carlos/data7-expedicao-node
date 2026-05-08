export default class CobrancaDigitalPixPagamentoDto {
  readonly sysId: string;
  readonly chave: string;
  readonly sequencia: number;
  readonly txId: string;
  readonly endToEndId: string | undefined;
  readonly dataCriacao: Date;
  readonly dataExpiracao: Date;
  readonly dataPagamento: Date | undefined;
  readonly qrCode: string;
  readonly imagemQrcode: string;
  readonly valor: number;

  constructor(params: {
    sysId: string;
    chave: string;
    sequencia: number;
    txId: string;
    endToEndId: string | undefined;
    dataCriacao: Date;
    dataExpiracao: Date;
    dataPagamento: Date | undefined;
    qrCode: string;
    imagemQrcode: string;
    valor: number;
  }) {
    this.sysId = params.sysId;
    this.chave = params.chave;
    this.sequencia = params.sequencia;
    this.txId = params.txId;
    this.endToEndId = params.endToEndId;
    this.dataCriacao = params.dataCriacao;
    this.dataExpiracao = params.dataExpiracao;
    this.dataPagamento = params.dataPagamento;
    this.qrCode = params.qrCode;
    this.imagemQrcode = params.imagemQrcode;
    this.valor = params.valor;
  }

  static create(params: {
    sysId: string;
    chave: string;
    sequencia: number;
    txId: string;
    endToEndId: string | undefined;
    dataCriacao: Date;
    dataExpiracao: Date;
    dataPagamento: Date | undefined;
    qrCode: string;
    imagemQrcode: string;
    valor: number;
  }) {
    return new CobrancaDigitalPixPagamentoDto(params);
  }

  static fromObject(object: any) {
    return new CobrancaDigitalPixPagamentoDto({
      sysId: object.sysId || object.SysId,
      chave: object.chave || object.Chave,
      sequencia: object.sequencia || object.Sequencia,
      txId: object.txId || object.TxId,
      endToEndId: object.endToEndId || object.EndToEndId || undefined,
      dataCriacao: object.dataCriacao || object.DataCriacao,
      dataExpiracao: object.dataExpiracao || object.DataExpiracao,
      dataPagamento: object.dataPagamento || object.DataPagamento || undefined,
      qrCode: object.qrCode || object.QrCode,
      imagemQrcode: object.imagemQrcode || object.ImagemQrcode,
      valor: object.valor || object.Valor,
    });
  }
}
