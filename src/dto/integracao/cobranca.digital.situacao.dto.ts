export default class CobrancaDigitalSituacaoDto {
  readonly sysId: string;
  readonly sequencia: number;
  readonly status: string;
  readonly txId: string;
  readonly locId: string;
  readonly chave: string;

  constructor(params: {
    sysId: string;
    sequencia: number;
    status: string;
    txId: string;
    locId: string;
    chave: string;
  }) {
    this.sysId = params.sysId;
    this.sequencia = params.sequencia;
    this.status = params.status;
    this.txId = params.txId;
    this.locId = params.locId;
    this.chave = params.chave;
  }

  static create(params: {
    sysId: string;
    sequencia: number;
    status: string;
    txId: string;
    locId: string;
    chave: string;
  }) {
    return new CobrancaDigitalSituacaoDto(params);
  }

  static fromObject(object: any) {
    return new CobrancaDigitalSituacaoDto({
      sysId: object.sysId || object.SysId,
      sequencia: object.sequencia || object.Sequencia,
      status: object.status || object.Status,
      txId: object.txId || object.TxId,
      locId: object.locId || object.LocId,
      chave: object.chave || object.Chave,
    });
  }
}
