export default class CobrancaDigitalPagamentoDto {
  readonly sysId: string;
  readonly sequencia: number;
  readonly status: string;
  readonly endToEndId: string | undefined;
  readonly chave: string | undefined;
  readonly dataPagamento: Date;
  readonly valor: number;
  readonly observacao: string | undefined;

  constructor(params: {
    sysId: string;
    sequencia: number;
    status: string;
    endToEndId: string | undefined;
    chave: string | undefined;
    dataPagamento: Date;
    valor: number;
    observacao: string | undefined;
  }) {
    this.sysId = params.sysId;
    this.sequencia = params.sequencia;
    this.status = params.status;
    this.endToEndId = params.endToEndId;
    this.chave = params.chave;
    this.dataPagamento = params.dataPagamento;
    this.valor = params.valor;
    this.observacao = params.observacao;
  }

  static create = (params: {
    sysId: string;
    sequencia: number;
    status: string;
    endToEndId: string;
    chave: string;
    dataPagamento: Date;
    valor: number;
    observacao: string;
  }) => new CobrancaDigitalPagamentoDto(params);

  static fromObject(object: any) {
    return new CobrancaDigitalPagamentoDto({
      sysId: object.sysId || object.SysId,
      sequencia: object.sequencia || object.Sequencia,
      status: object.status || object.Status,
      endToEndId: object.endToEndId || object.EndToEndId,
      chave: object.chave || object.Chave,
      dataPagamento: object.dataPagamento || object.DataPagamento,
      valor: object.valor || object.Valor,
      observacao: object.observacao || object.Observacao,
    });
  }
}
