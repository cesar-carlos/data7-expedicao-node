export default class ExpedicaoCarrinhoConsultaDto {
  CodEmpresa: number;
  CodCarrinho: number;
  Descricao: string;
  Ativo: string;
  Situacao: string;
  CodigoBarras: string;
  CodCarrinhoPercurso?: number;
  CodPercursoEstagio?: number;
  DescricaoPercursoEstagio?: string;
  Origem?: string;
  CodOrigem?: number;
  DataInicio?: Date;
  HoraInicio?: string;
  CodUsuarioInicio?: number;
  NomeUsuarioInicio?: string;
  CodSetorEstoque?: number;
  NomeSetorEstoque?: string;

  constructor(params: {
    CodEmpresa: number;
    CodCarrinho: number;
    Descricao: string;
    Ativo: string;
    Situacao: string;
    CodigoBarras: string;
    CodCarrinhoPercurso?: number;
    CodPercursoEstagio?: number;
    DescricaoPercursoEstagio?: string;
    Origem?: string;
    CodOrigem?: number;
    DataInicio?: Date;
    HoraInicio?: string;
    CodUsuarioInicio?: number;
    NomeUsuarioInicio?: string;
    CodSetorEstoque?: number;
    NomeSetorEstoque?: string;
  }) {
    this.CodEmpresa = params.CodEmpresa;
    this.CodCarrinho = params.CodCarrinho;
    this.Descricao = params.Descricao;
    this.Ativo = params.Ativo;
    this.Situacao = params.Situacao;
    this.CodigoBarras = params.CodigoBarras;
    this.CodCarrinhoPercurso = params.CodCarrinhoPercurso;
    this.CodPercursoEstagio = params.CodPercursoEstagio;
    this.DescricaoPercursoEstagio = params.DescricaoPercursoEstagio;
    this.Origem = params.Origem;
    this.CodOrigem = params.CodOrigem;
    this.DataInicio = params.DataInicio;
    this.HoraInicio = params.HoraInicio;
    this.CodUsuarioInicio = params.CodUsuarioInicio;
    this.NomeUsuarioInicio = params.NomeUsuarioInicio;
    this.CodSetorEstoque = params.CodSetorEstoque;
    this.NomeSetorEstoque = params.NomeSetorEstoque;
  }

  public copyWith(params: {
    CodEmpresa?: number;
    CodCarrinho?: number;
    Descricao?: string;
    Ativo?: string;
    Situacao?: string;
    CodigoBarras?: string;
    CodCarrinhoPercurso?: number;
    CodPercursoEstagio?: number;
    DescricaoPercursoEstagio?: string;
    Origem?: string;
    CodOrigem?: number;
    DataInicio?: Date;
    HoraInicio?: string;
    CodUsuarioInicio?: number;
    NomeUsuarioInicio?: string;
    CodSetorEstoque?: number;
    NomeSetorEstoque?: string;
  }) {
    return new ExpedicaoCarrinhoConsultaDto({
      CodEmpresa: params.CodEmpresa ?? this.CodEmpresa,
      CodCarrinho: params.CodCarrinho ?? this.CodCarrinho,
      Descricao: params.Descricao ?? this.Descricao,
      Ativo: params.Ativo ?? this.Ativo,
      Situacao: params.Situacao ?? this.Situacao,
      CodigoBarras: params.CodigoBarras ?? this.CodigoBarras,
      CodCarrinhoPercurso: params.CodCarrinhoPercurso ?? this.CodCarrinhoPercurso,
      CodPercursoEstagio: params.CodPercursoEstagio ?? this.CodPercursoEstagio,
      DescricaoPercursoEstagio: params.DescricaoPercursoEstagio ?? this.DescricaoPercursoEstagio,
      Origem: params.Origem ?? this.Origem,
      CodOrigem: params.CodOrigem ?? this.CodOrigem,
      DataInicio: params.DataInicio ?? this.DataInicio,
      HoraInicio: params.HoraInicio ?? this.HoraInicio,
      CodUsuarioInicio: params.CodUsuarioInicio ?? this.CodUsuarioInicio,
      NomeUsuarioInicio: params.NomeUsuarioInicio ?? this.NomeUsuarioInicio,
      CodSetorEstoque: params.CodSetorEstoque ?? this.CodSetorEstoque,
      NomeSetorEstoque: params.NomeSetorEstoque ?? this.NomeSetorEstoque,
    });
  }

  static fromObject(object: any): ExpedicaoCarrinhoConsultaDto {
    return new ExpedicaoCarrinhoConsultaDto({
      CodEmpresa: object.CodEmpresa,
      CodCarrinho: object.CodCarrinho,
      Descricao: object.Descricao,
      Ativo: object.Ativo,
      Situacao: object.Situacao,
      CodigoBarras: object.CodigoBarras,
      CodCarrinhoPercurso: object.CodCarrinhoPercurso,
      CodPercursoEstagio: object.CodPercursoEstagio,
      DescricaoPercursoEstagio: object.DescricaoPercursoEstagio,
      Origem: object.Origem,
      CodOrigem: object.CodOrigem,
      DataInicio: object.DataInicio,
      HoraInicio: object.HoraInicio,
      CodUsuarioInicio: object.CodUsuarioInicio,
      NomeUsuarioInicio: object.NomeUsuarioInicio,
      CodSetorEstoque: object.CodSetorEstoque,
      NomeSetorEstoque: object.NomeSetorEstoque,
    });
  }

  public toJson(): any {
    return {
      CodEmpresa: this.CodEmpresa,
      CodCarrinho: this.CodCarrinho,
      Descricao: this.Descricao,
      Ativo: this.Ativo,
      Situacao: this.Situacao,
      CodigoBarras: this.CodigoBarras,
      CodCarrinhoPercurso: this.CodCarrinhoPercurso,
      CodPercursoEstagio: this.CodPercursoEstagio,
      DescricaoPercursoEstagio: this.DescricaoPercursoEstagio,
      Origem: this.Origem,
      CodOrigem: this.CodOrigem,
      DataInicio: this.DataInicio,
      HoraInicio: this.HoraInicio,
      CodUsuarioInicio: this.CodUsuarioInicio,
      NomeUsuarioInicio: this.NomeUsuarioInicio,
      CodSetorEstoque: this.CodSetorEstoque,
      NomeSetorEstoque: this.NomeSetorEstoque,
    };
  }
}
