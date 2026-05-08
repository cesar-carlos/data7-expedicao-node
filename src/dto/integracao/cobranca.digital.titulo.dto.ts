export default class CobrancaDigitalTituloDto {
  codEmpresa: number;
  codCobrancaDigital: number;
  item: string;
  sysId: string;
  status: string;
  tipoCobranca: string;
  numeroTitulo: string;
  parcela: string;
  qtdParcelas: number | undefined;
  liberacaoKey: string;
  dataLancamento: Date;
  dataEmissao: Date;
  dataVenda: Date;
  dataVencimento: Date;
  valor: number;
  observacao: string;

  constructor(params: {
    codEmpresa: number;
    codCobrancaDigital: number;
    item: string;
    sysId: string;
    status: string;
    tipoCobranca: string;
    numeroTitulo: string;
    parcela: string;
    qtdParcelas: number | undefined;
    liberacaoKey: string;
    dataLancamento: Date;
    dataEmissao: Date;
    dataVenda: Date;
    dataVencimento: Date;
    valor: number;
    observacao: string;
  }) {
    this.codEmpresa = params.codEmpresa;
    this.codCobrancaDigital = params.codCobrancaDigital;
    this.item = params.item;
    this.sysId = params.sysId;
    this.status = params.status;
    this.tipoCobranca = params.tipoCobranca;
    this.numeroTitulo = params.numeroTitulo;
    this.parcela = params.parcela;
    this.qtdParcelas = params.qtdParcelas;
    this.liberacaoKey = params.liberacaoKey;
    this.dataLancamento = params.dataLancamento;
    this.dataEmissao = params.dataEmissao;
    this.dataVenda = params.dataVenda;
    this.dataVencimento = params.dataVencimento;
    this.valor = params.valor;
    this.observacao = params.observacao;
  }

  static create(params: {
    codEmpresa: number;
    codCobrancaDigital: number;
    item: string;
    sysId: string;
    status: string;
    tipoCobranca: string;
    numeroTitulo: string;
    parcela: string;
    qtdParcelas: number | undefined;
    liberacaoKey: string;
    dataLancamento: Date;
    dataEmissao: Date;
    dataVenda: Date;
    dataVencimento: Date;
    valor: number;
    observacao: string;
  }) {
    return new CobrancaDigitalTituloDto(params);
  }

  static fromObject(object: any) {
    return new CobrancaDigitalTituloDto({
      codEmpresa: object.codEmpresa || object.CodEmpresa,
      codCobrancaDigital: object.codCobrancaDigital || object.CodCobrancaDigital,
      item: object.item || object.Item,
      sysId: object.sysId || object.SysId,
      status: object.status || object.Status,
      tipoCobranca: object.tipoCobranca || object.TipoCobranca,
      numeroTitulo: object.numeroTitulo || object.NumeroTitulo,
      parcela: object.parcela || object.Parcela,
      qtdParcelas: object.qtdParcelas || object.QtdParcelas,
      liberacaoKey: object.liberacaoKey || object.LiberacaoKey,
      dataLancamento: object.dataLancamento || object.DataLancamento,
      dataEmissao: object.dataEmissao || object.DataEmissao,
      dataVenda: object.dataVenda || object.DataVenda,
      dataVencimento: object.dataVencimento || object.DataVencimento,
      valor: object.valor || object.Valor,
      observacao: object.observacao || object.Observacao,
    });
  }
}
