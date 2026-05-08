export default class ExpedicaoCarrinhoPercursoEstagioDto {
  CodEmpresa: number;
  CodCarrinhoPercurso: number;
  Item: string;
  Origem: string;
  CodOrigem: number;
  CodPercursoEstagio: number;
  CodCarrinho: number;
  Situacao: string;
  DataInicio: Date;
  HoraInicio: string;
  CodUsuarioInicio: number;
  NomeUsuarioInicio: string;
  DataFinalizacao?: Date;
  HoraFinalizacao?: string;
  CodUsuarioFinalizacao?: number;
  NomeUsuarioFinalizacao?: string;

  constructor(params: {
    CodEmpresa: number;
    CodCarrinhoPercurso: number;
    Item: string;
    Origem: string;
    CodOrigem: number;
    CodPercursoEstagio: number;
    CodCarrinho: number;
    Situacao: string;
    DataInicio: Date;
    HoraInicio: string;
    CodUsuarioInicio: number;
    NomeUsuarioInicio: string;
    DataFinalizacao?: Date;
    HoraFinalizacao?: string;
    CodUsuarioFinalizacao?: number;
    NomeUsuarioFinalizacao?: string;
  }) {
    this.CodEmpresa = params.CodEmpresa;
    this.CodCarrinhoPercurso = params.CodCarrinhoPercurso;
    this.Item = params.Item;
    this.Origem = params.Origem;
    this.CodOrigem = params.CodOrigem;
    this.CodPercursoEstagio = params.CodPercursoEstagio;
    this.CodCarrinho = params.CodCarrinho;
    this.Situacao = params.Situacao;
    this.DataInicio = params.DataInicio;
    this.HoraInicio = params.HoraInicio;
    this.CodUsuarioInicio = params.CodUsuarioInicio;
    this.NomeUsuarioInicio = params.NomeUsuarioInicio;
    this.DataFinalizacao = params.DataFinalizacao;
    this.HoraFinalizacao = params.HoraFinalizacao;
    this.CodUsuarioFinalizacao = params.CodUsuarioFinalizacao;
    this.NomeUsuarioFinalizacao = params.NomeUsuarioFinalizacao;
  }

  public copyWith(params: {
    CodEmpresa?: number;
    CodCarrinhoPercurso?: number;
    Item?: string;
    Origem?: string;
    CodOrigem?: number;
    CodPercursoEstagio?: number;
    CodCarrinho?: number;
    Situacao?: string;
    DataInicio?: Date;
    HoraInicio?: string;
    CodUsuarioInicio?: number;
    NomeUsuarioInicio?: string;
    DataFinalizacao?: Date;
    HoraFinalizacao?: string;
    CodUsuarioFinalizacao?: number;
    NomeUsuarioFinalizacao?: string;
  }): ExpedicaoCarrinhoPercursoEstagioDto {
    return new ExpedicaoCarrinhoPercursoEstagioDto({
      CodEmpresa: params.CodEmpresa ?? this.CodEmpresa,
      CodCarrinhoPercurso: params.CodCarrinhoPercurso ?? this.CodCarrinhoPercurso,
      Item: params.Item ?? this.Item,
      Origem: params.Origem ?? this.Origem,
      CodOrigem: params.CodOrigem ?? this.CodOrigem,
      CodPercursoEstagio: params.CodPercursoEstagio ?? this.CodPercursoEstagio,
      CodCarrinho: params.CodCarrinho ?? this.CodCarrinho,
      Situacao: params.Situacao ?? this.Situacao,
      DataInicio: params.DataInicio ?? this.DataInicio,
      HoraInicio: params.HoraInicio ?? this.HoraInicio,
      CodUsuarioInicio: params.CodUsuarioInicio ?? this.CodUsuarioInicio,
      NomeUsuarioInicio: params.NomeUsuarioInicio ?? this.NomeUsuarioInicio,
      DataFinalizacao: params.DataFinalizacao ?? this.DataFinalizacao,
      HoraFinalizacao: params.HoraFinalizacao ?? this.HoraFinalizacao,
      CodUsuarioFinalizacao: params.CodUsuarioFinalizacao ?? this.CodUsuarioFinalizacao,
      NomeUsuarioFinalizacao: params.NomeUsuarioFinalizacao ?? this.NomeUsuarioFinalizacao,
    });
  }

  static fromObject(object: any): ExpedicaoCarrinhoPercursoEstagioDto {
    return new ExpedicaoCarrinhoPercursoEstagioDto({
      CodEmpresa: object.CodEmpresa,
      CodCarrinhoPercurso: object.CodCarrinhoPercurso,
      Item: object.Item,
      Origem: object.Origem,
      CodOrigem: object.CodOrigem,
      CodPercursoEstagio: object.CodPercursoEstagio,
      CodCarrinho: object.CodCarrinho,
      Situacao: object.Situacao,
      DataInicio: object.DataInicio,
      HoraInicio: object.HoraInicio,
      CodUsuarioInicio: object.CodUsuarioInicio,
      NomeUsuarioInicio: object.NomeUsuarioInicio,
      DataFinalizacao: object.DataFinalizacao,
      HoraFinalizacao: object.HoraFinalizacao,
      CodUsuarioFinalizacao: object.CodUsuarioFinalizacao,
      NomeUsuarioFinalizacao: object.NomeUsuarioFinalizacao,
    });
  }

  public toJson(): any {
    return {
      CodEmpresa: this.CodEmpresa,
      CodCarrinhoPercurso: this.CodCarrinhoPercurso,
      Item: this.Item,
      Origem: this.Origem,
      CodOrigem: this.CodOrigem,
      CodPercursoEstagio: this.CodPercursoEstagio,
      CodCarrinho: this.CodCarrinho,
      Situacao: this.Situacao,
      DataInicio: this.DataInicio,
      HoraInicio: this.HoraInicio,
      CodUsuarioInicio: this.CodUsuarioInicio,
      NomeUsuarioInicio: this.NomeUsuarioInicio,
      DataFinalizacao: this.DataFinalizacao,
      HoraFinalizacao: this.HoraFinalizacao,
      CodUsuarioFinalizacao: this.CodUsuarioFinalizacao,
      NomeUsuarioFinalizacao: this.NomeUsuarioFinalizacao,
    };
  }
}
