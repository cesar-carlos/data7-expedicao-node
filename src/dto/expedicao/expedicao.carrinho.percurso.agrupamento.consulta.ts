export default class ExpedicaoCarrinhoPercursoAgrupamentoConsulta {
  CodEmpresa: number;
  CodCarrinhoPercurso: number;
  ItemAgrupamento?: string;
  ItemCarrinhoPercurso: string;
  Origem: string;
  CodOrigem: number;
  Situacao: string;
  SituacaoPercurso: string;
  CodPercursoEstagio?: number;
  DescricaoPercursoEstagio?: string;
  CodCarrinhoAgrupador?: number;
  NomeCarrinhoAgrupador?: string;
  CodigoBarrasCarrinhoAgrupador?: string;
  CodCarrinho: number;
  NomeCarrinho: string;
  CodigoBarrasCarrinho: string;
  CarrinhoAgrupador: string;
  DataInicio: Date;
  HoraInicio: string;
  CodUsuarioInicio: number;
  NomeUsuarioInicio: string;

  constructor(params: {
    CodEmpresa: number;
    CodCarrinhoPercurso: number;
    ItemAgrupamento?: string;
    ItemCarrinhoPercurso: string;
    Origem: string;
    CodOrigem: number;
    Situacao: string;
    SituacaoPercurso: string;
    CodPercursoEstagio?: number;
    DescricaoPercursoEstagio?: string;
    CodCarrinhoAgrupador?: number;
    NomeCarrinhoAgrupador?: string;
    CodigoBarrasCarrinhoAgrupador?: string;
    CodCarrinho: number;
    NomeCarrinho: string;
    CodigoBarrasCarrinho: string;
    CarrinhoAgrupador: string;
    DataInicio: Date;
    HoraInicio: string;
    CodUsuarioInicio: number;
    NomeUsuarioInicio: string;
  }) {
    this.CodEmpresa = params.CodEmpresa;
    this.CodCarrinhoPercurso = params.CodCarrinhoPercurso;
    this.ItemAgrupamento = params.ItemAgrupamento;
    this.ItemCarrinhoPercurso = params.ItemCarrinhoPercurso;
    this.Origem = params.Origem;
    this.CodOrigem = params.CodOrigem;
    this.Situacao = params.Situacao;
    this.SituacaoPercurso = params.SituacaoPercurso;
    this.CodPercursoEstagio = params.CodPercursoEstagio;
    this.DescricaoPercursoEstagio = params.DescricaoPercursoEstagio;
    this.CodCarrinhoAgrupador = params.CodCarrinhoAgrupador;
    this.NomeCarrinhoAgrupador = params.NomeCarrinhoAgrupador;
    this.CodigoBarrasCarrinhoAgrupador = params.CodigoBarrasCarrinhoAgrupador;
    this.CodCarrinho = params.CodCarrinho;
    this.NomeCarrinho = params.NomeCarrinho;
    this.CodigoBarrasCarrinho = params.CodigoBarrasCarrinho;
    this.CarrinhoAgrupador = params.CarrinhoAgrupador;
    this.DataInicio = params.DataInicio;
    this.HoraInicio = params.HoraInicio;
    this.CodUsuarioInicio = params.CodUsuarioInicio;
    this.NomeUsuarioInicio = params.NomeUsuarioInicio;
  }

  public copyWith(params: {
    CodEmpresa?: number;
    CodCarrinhoPercurso?: number;
    ItemAgrupamento?: string;
    ItemCarrinhoPercurso?: string;
    Origem?: string;
    CodOrigem?: number;
    Situacao?: string;
    SituacaoPercurso?: string;
    CodPercursoEstagio?: number;
    DescricaoPercursoEstagio?: string;
    CodCarrinhoAgrupador?: number;
    NomeCarrinhoAgrupador?: string;
    CodigoBarrasCarrinhoAgrupador?: string;
    CodCarrinho?: number;
    NomeCarrinho?: string;
    CodigoBarrasCarrinho?: string;
    CarrinhoAgrupador?: string;
    DataInicio?: Date;
    HoraInicio?: string;
    CodUsuarioInicio?: number;
    NomeUsuarioInicio?: string;
  }) {
    return new ExpedicaoCarrinhoPercursoAgrupamentoConsulta({
      CodEmpresa: params.CodEmpresa ?? this.CodEmpresa,
      CodCarrinhoPercurso: params.CodCarrinhoPercurso ?? this.CodCarrinhoPercurso,
      ItemAgrupamento: params.ItemAgrupamento ?? this.ItemAgrupamento,
      ItemCarrinhoPercurso: params.ItemCarrinhoPercurso ?? this.ItemCarrinhoPercurso,
      Origem: params.Origem ?? this.Origem,
      CodOrigem: params.CodOrigem ?? this.CodOrigem,
      Situacao: params.Situacao ?? this.Situacao,
      SituacaoPercurso: params.SituacaoPercurso ?? this.SituacaoPercurso,
      CodPercursoEstagio: params.CodPercursoEstagio ?? this.CodPercursoEstagio,
      DescricaoPercursoEstagio: params.DescricaoPercursoEstagio ?? this.DescricaoPercursoEstagio,
      CodCarrinhoAgrupador: params.CodCarrinhoAgrupador ?? this.CodCarrinhoAgrupador,
      NomeCarrinhoAgrupador: params.NomeCarrinhoAgrupador ?? this.NomeCarrinhoAgrupador,
      CodigoBarrasCarrinhoAgrupador: params.CodigoBarrasCarrinhoAgrupador ?? this.CodigoBarrasCarrinhoAgrupador,
      CodCarrinho: params.CodCarrinho ?? this.CodCarrinho,
      NomeCarrinho: params.NomeCarrinho ?? this.NomeCarrinho,
      CodigoBarrasCarrinho: params.CodigoBarrasCarrinho ?? this.CodigoBarrasCarrinho,
      CarrinhoAgrupador: params.CarrinhoAgrupador ?? this.CarrinhoAgrupador,
      DataInicio: params.DataInicio ?? this.DataInicio,
      HoraInicio: params.HoraInicio ?? this.HoraInicio,
      CodUsuarioInicio: params.CodUsuarioInicio ?? this.CodUsuarioInicio,
      NomeUsuarioInicio: params.NomeUsuarioInicio ?? this.NomeUsuarioInicio,
    });
  }

  static fromObject(object: any): ExpedicaoCarrinhoPercursoAgrupamentoConsulta {
    return new ExpedicaoCarrinhoPercursoAgrupamentoConsulta({
      CodEmpresa: object.CodEmpresa,
      CodCarrinhoPercurso: object.CodCarrinhoPercurso,
      ItemAgrupamento: object.ItemAgrupamento,
      ItemCarrinhoPercurso: object.ItemCarrinhoPercurso,
      Origem: object.Origem,
      CodOrigem: object.CodOrigem,
      Situacao: object.Situacao,
      SituacaoPercurso: object.SituacaoPercurso,
      CodPercursoEstagio: object.CodPercursoEstagio,
      DescricaoPercursoEstagio: object.DescricaoPercursoEstagio,
      CodCarrinhoAgrupador: object.CodCarrinhoAgrupador,
      NomeCarrinhoAgrupador: object.NomeCarrinhoAgrupador,
      CodigoBarrasCarrinhoAgrupador: object.CodigoBarrasCarrinhoAgrupador,
      CodCarrinho: object.CodCarrinho,
      NomeCarrinho: object.NomeCarrinho,
      CodigoBarrasCarrinho: object.CodigoBarrasCarrinho,
      CarrinhoAgrupador: object.CarrinhoAgrupador,
      DataInicio: object.DataInicio,
      HoraInicio: object.HoraInicio,
      CodUsuarioInicio: object.CodUsuarioInicio,
      NomeUsuarioInicio: object.NomeUsuarioInicio,
    });
  }

  public toJson(): any {
    return {
      CodEmpresa: this.CodEmpresa,
      CodCarrinhoPercurso: this.CodCarrinhoPercurso,
      ItemAgrupamento: this.ItemAgrupamento,
      ItemCarrinhoPercurso: this.ItemCarrinhoPercurso,
      Origem: this.Origem,
      CodOrigem: this.CodOrigem,
      Situacao: this.Situacao,
      SituacaoPercurso: this.SituacaoPercurso,
      CodPercursoEstagio: this.CodPercursoEstagio,
      DescricaoPercursoEstagio: this.DescricaoPercursoEstagio,
      CodCarrinhoAgrupador: this.CodCarrinhoAgrupador,
      NomeCarrinhoAgrupador: this.NomeCarrinhoAgrupador,
      CodigoBarrasCarrinhoAgrupador: this.CodigoBarrasCarrinhoAgrupador,
      CodCarrinho: this.CodCarrinho,
      NomeCarrinho: this.NomeCarrinho,
      CodigoBarrasCarrinho: this.CodigoBarrasCarrinho,
      CarrinhoAgrupador: this.CarrinhoAgrupador,
      DataInicio: this.DataInicio,
      HoraInicio: this.HoraInicio,
      CodUsuarioInicio: this.CodUsuarioInicio,
      NomeUsuarioInicio: this.NomeUsuarioInicio,
    };
  }
}
