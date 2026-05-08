export default class ExpedicaoCarrinhoPercursoAgrupamento {
  CodEmpresa: number;
  CodCarrinhoPercurso: number;
  Item: string;
  Origem: string;
  ItemCarrinhoPercurso: string;
  Situacao: string;
  CodCarrinhoAgrupador: number;
  DataLancamento: Date;
  HoraLancamento: string;
  CodUsuarioLancamento: number;
  NomeUsuarioLancamento: string;

  constructor(params: {
    CodEmpresa: number;
    CodCarrinhoPercurso: number;
    Item: string;
    Origem: string;
    ItemCarrinhoPercurso: string;
    Situacao: string;
    CodCarrinhoAgrupador: number;
    DataLancamento: Date;
    HoraLancamento: string;
    CodUsuarioLancamento: number;
    NomeUsuarioLancamento: string;
  }) {
    this.CodEmpresa = params.CodEmpresa;
    this.CodCarrinhoPercurso = params.CodCarrinhoPercurso;
    this.Item = params.Item;
    this.Origem = params.Origem;
    this.ItemCarrinhoPercurso = params.ItemCarrinhoPercurso;
    this.Situacao = params.Situacao;
    this.CodCarrinhoAgrupador = params.CodCarrinhoAgrupador;
    this.DataLancamento = params.DataLancamento;
    this.HoraLancamento = params.HoraLancamento;
    this.CodUsuarioLancamento = params.CodUsuarioLancamento;
    this.NomeUsuarioLancamento = params.NomeUsuarioLancamento;
  }

  public copyWith(params: {
    CodEmpresa?: number;
    CodCarrinhoPercurso?: number;
    Item?: string;
    Origem?: string;
    ItemCarrinhoPercurso?: string;
    Situacao?: string;
    CodCarrinhoAgrupador?: number;
    DataLancamento?: Date;
    HoraLancamento?: string;
    CodUsuarioLancamento?: number;
    NomeUsuarioLancamento?: string;
  }) {
    return new ExpedicaoCarrinhoPercursoAgrupamento({
      CodEmpresa: params.CodEmpresa ?? this.CodEmpresa,
      CodCarrinhoPercurso: params.CodCarrinhoPercurso ?? this.CodCarrinhoPercurso,
      Item: params.Item ?? this.Item,
      Origem: params.Origem ?? this.Origem,
      ItemCarrinhoPercurso: params.ItemCarrinhoPercurso ?? this.ItemCarrinhoPercurso,
      Situacao: params.Situacao ?? this.Situacao,
      CodCarrinhoAgrupador: params.CodCarrinhoAgrupador ?? this.CodCarrinhoAgrupador,
      DataLancamento: params.DataLancamento ?? this.DataLancamento,
      HoraLancamento: params.HoraLancamento ?? this.HoraLancamento,
      CodUsuarioLancamento: params.CodUsuarioLancamento ?? this.CodUsuarioLancamento,
      NomeUsuarioLancamento: params.NomeUsuarioLancamento ?? this.NomeUsuarioLancamento,
    });
  }

  static fromObject(object: any): ExpedicaoCarrinhoPercursoAgrupamento {
    return new ExpedicaoCarrinhoPercursoAgrupamento({
      CodEmpresa: object.CodEmpresa,
      CodCarrinhoPercurso: object.CodCarrinhoPercurso,
      Item: object.Item,
      Origem: object.Origem,
      ItemCarrinhoPercurso: object.ItemCarrinhoPercurso,
      Situacao: object.Situacao,
      CodCarrinhoAgrupador: object.CodCarrinhoAgrupador,
      DataLancamento: object.DataLancamento,
      HoraLancamento: object.HoraLancamento,
      CodUsuarioLancamento: object.CodUsuarioLancamento,
      NomeUsuarioLancamento: object.NomeUsuarioLancamento,
    });
  }

  public toJson(): any {
    return {
      CodEmpresa: this.CodEmpresa,
      CodCarrinhoPercurso: this.CodCarrinhoPercurso,
      Item: this.Item,
      Origem: this.Origem,
      ItemCarrinhoPercurso: this.ItemCarrinhoPercurso,
      Situacao: this.Situacao,
      CodCarrinhoAgrupador: this.CodCarrinhoAgrupador,
      DataLancamento: this.DataLancamento,
      HoraLancamento: this.HoraLancamento,
      CodUsuarioLancamento: this.CodUsuarioLancamento,
      NomeUsuarioLancamento: this.NomeUsuarioLancamento,
    };
  }
}
