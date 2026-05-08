import CobrancaLiberacaoKey from './cobranca.liberacao.key';

export default class CobrancaParcela {
  readonly sysId: string;
  public status: string;
  readonly origem: string;
  readonly codOrigem: number;
  readonly liberacaoKey: CobrancaLiberacaoKey;
  readonly numeroParcela: string;
  readonly qtdParcela: number;
  readonly tipoCobranca: string;
  readonly dataEmissao: Date;
  readonly dataVenda: Date;
  readonly dataVencimento: Date;
  readonly valorParcela: number;
  readonly observacao: string;

  constructor(param: {
    sysId: string;
    status: string;
    origem: string;
    codOrigem: number;
    liberacaoKey: CobrancaLiberacaoKey;
    numeroParcela: string;
    qtdParcela: number;
    tipoCobranca: string;
    dataEmissao: Date;
    dataVenda: Date;
    dataVencimento: Date;
    valorParcela: number;
    observacao: string;
  }) {
    this.sysId = param.sysId;
    this.status = param.status ?? 'A';
    this.origem = param.origem;
    this.codOrigem = param.codOrigem;
    this.liberacaoKey = param.liberacaoKey;
    this.numeroParcela = param.numeroParcela;
    this.qtdParcela = param.qtdParcela;
    this.tipoCobranca = param.tipoCobranca;
    this.dataEmissao = param.dataEmissao;
    this.dataVenda = param.dataVenda;
    this.dataVencimento = param.dataVencimento;
    this.valorParcela = param.valorParcela;
    this.observacao = param.observacao;
  }

  static create = (param: {
    sysId: string;
    status: string;
    origem: string;
    codOrigem: number;
    liberacaoKey: CobrancaLiberacaoKey;
    numeroParcela: string;
    qtdParcela: number;
    tipoCobranca: string;
    dataEmissao: Date;
    dataVenda: Date;
    dataVencimento: Date;
    valorParcela: number;
    observacao: string;
  }) => {
    return new CobrancaParcela(param);
  };

  static fromObject = (object: any) => {
    return new CobrancaParcela({
      sysId: object.SysId,
      status: object.Status ?? 'A',
      origem: object.Origem,
      codOrigem: object.CodOrigem,
      liberacaoKey: CobrancaLiberacaoKey.fromObject(object.LiberacaoKey),
      numeroParcela: object.NumeroParcela,
      qtdParcela: object.QtdParcela,
      tipoCobranca: object.TipoCobranca,
      dataEmissao: object.DataEmissao,
      dataVenda: object.DataVenda,
      dataVencimento: object.DataVencimento,
      valorParcela: object.ValorParcela,
      observacao: object.Observacao,
    });
  };
}
