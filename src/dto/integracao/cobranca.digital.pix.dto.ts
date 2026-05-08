export default class CobrancaDigitalPixDto {
  readonly sysId: string;
  readonly sequencia: number;
  readonly txId: string;
  readonly dataCriacao: Date;
  readonly dataExpiracao: Date;
  readonly qrCode: string;
  readonly imagemQrcode: string;
  readonly valor: number;

  constructor(params: {
    sysId: string;
    sequencia: number;
    txId: string;
    dataCriacao: Date;
    dataExpiracao: Date;
    qrCode: string;
    imagemQrcode: string;
    valor: number;
  }) {
    this.sysId = params.sysId;
    this.sequencia = params.sequencia;
    this.txId = params.txId;
    this.dataCriacao = params.dataCriacao;
    this.dataExpiracao = params.dataExpiracao;
    this.qrCode = params.qrCode;
    this.imagemQrcode = params.imagemQrcode;
    this.valor = params.valor;
  }

  static create(params: {
    sysId: string;
    sequencia: number;
    txId: string;
    dataCriacao: Date;
    dataExpiracao: Date;
    qrCode: string;
    imagemQrcode: string;
    valor: number;
  }) {
    return new CobrancaDigitalPixDto(params);
  }

  static fromObject(object: any) {
    return new CobrancaDigitalPixDto({
      sysId: object.sysId || object.SysId,
      sequencia: object.sequencia || object.Sequencia,
      txId: object.txId || object.TxId,
      dataCriacao: object.dataCriacao || object.DataCriacao,
      dataExpiracao: object.dataExpiracao || object.DataExpiracao,
      qrCode: object.qrCode || object.QrCode,
      imagemQrcode: object.imagemQrcode || object.ImagemQrcode,
      valor: object.valor || object.Valor,
    });
  }
}
