export default class ExpedicaoCarrinhoPercursoEstagioConsultaDto {
  CodEmpresa: number;
  CodCarrinhoPercurso: number;
  Item: string;
  CodPercursoEstagio: number;
  Origem: string;
  CodOrigem: number;
  Situacao: string;
  CarrinhoAgrupador: string;
  CodCarrinhoAgrupador?: number;
  CodCarrinho: number;
  NomeCarrinho: string;
  CodigoBarrasCarrinho: string;
  Ativo: string;
  CodUsuarioInicio: number;
  NomeUsuarioInicio: string;
  DataInicio: Date;
  HoraInicio: string;
  CodUsuarioFinalizacao?: number;
  NomeUsuarioFinalizacao?: string;
  DataFinalizacao?: Date;
  HoraFinalizacao?: string;
  CodSetorEstoque?: number;
  NomeSetorEstoque?: string;

  constructor(params: {
    CodEmpresa: number;
    CodCarrinhoPercurso: number;
    Item: string;
    CodPercursoEstagio: number;
    Origem: string;
    CodOrigem: number;
    Situacao: string;
    CarrinhoAgrupador: string;
    CodCarrinhoAgrupador?: number;
    CodCarrinho: number;
    NomeCarrinho: string;
    CodigoBarrasCarrinho: string;
    Ativo: string;
    CodUsuarioInicio: number;
    NomeUsuarioInicio: string;
    DataInicio: Date;
    HoraInicio: string;
    CodUsuarioFinalizacao?: number;
    NomeUsuarioFinalizacao?: string;
    DataFinalizacao?: Date;
    HoraFinalizacao?: string;
    CodSetorEstoque?: number;
    NomeSetorEstoque?: string;
  }) {
    this.CodEmpresa = params.CodEmpresa;
    this.CodCarrinhoPercurso = params.CodCarrinhoPercurso;
    this.Item = params.Item;
    this.CodPercursoEstagio = params.CodPercursoEstagio;
    this.Origem = params.Origem;
    this.CodOrigem = params.CodOrigem;
    this.Situacao = params.Situacao;
    this.CarrinhoAgrupador = params.CarrinhoAgrupador;
    this.CodCarrinhoAgrupador = params.CodCarrinhoAgrupador;
    this.CodCarrinho = params.CodCarrinho;
    this.NomeCarrinho = params.NomeCarrinho;
    this.CodigoBarrasCarrinho = params.CodigoBarrasCarrinho;
    this.Ativo = params.Ativo;
    this.CodUsuarioInicio = params.CodUsuarioInicio;
    this.NomeUsuarioInicio = params.NomeUsuarioInicio;
    this.DataInicio = params.DataInicio;
    this.HoraInicio = params.HoraInicio;
    this.CodUsuarioFinalizacao = params.CodUsuarioFinalizacao;
    this.NomeUsuarioFinalizacao = params.NomeUsuarioFinalizacao;
    this.DataFinalizacao = params.DataFinalizacao;
    this.HoraFinalizacao = params.HoraFinalizacao;
    this.CodSetorEstoque = params.CodSetorEstoque;
    this.NomeSetorEstoque = params.NomeSetorEstoque;
  }

  public copyWith(params: {
    CodEmpresa?: number;
    CodCarrinhoPercurso?: number;
    Item?: string;
    CodPercursoEstagio?: number;
    Origem?: string;
    CodOrigem?: number;
    Situacao?: string;
    CarrinhoAgrupador?: string;
    CodCarrinhoAgrupador?: number;
    CodCarrinho?: number;
    NomeCarrinho?: string;
    CodigoBarrasCarrinho?: string;
    Ativo?: string;
    CodUsuarioInicio?: number;
    NomeUsuarioInicio?: string;
    DataInicio?: Date;
    HoraInicio?: string;
    CodUsuarioFinalizacao?: number;
    NomeUsuarioFinalizacao?: string;
    DataFinalizacao?: Date;
    HoraFinalizacao?: string;
    CodSetorEstoque?: number;
    NomeSetorEstoque?: string;
  }) {
    return new ExpedicaoCarrinhoPercursoEstagioConsultaDto({
      CodEmpresa: params.CodEmpresa ?? this.CodEmpresa,
      CodCarrinhoPercurso: params.CodCarrinhoPercurso ?? this.CodCarrinhoPercurso,
      Item: params.Item ?? this.Item,
      CodPercursoEstagio: params.CodPercursoEstagio ?? this.CodPercursoEstagio,
      Origem: params.Origem ?? this.Origem,
      CodOrigem: params.CodOrigem ?? this.CodOrigem,
      Situacao: params.Situacao ?? this.Situacao,
      CarrinhoAgrupador: params.CarrinhoAgrupador ?? this.CarrinhoAgrupador,
      CodCarrinhoAgrupador: params.CodCarrinhoAgrupador ?? this.CodCarrinhoAgrupador,
      CodCarrinho: params.CodCarrinho ?? this.CodCarrinho,
      NomeCarrinho: params.NomeCarrinho ?? this.NomeCarrinho,
      CodigoBarrasCarrinho: params.CodigoBarrasCarrinho ?? this.CodigoBarrasCarrinho,
      Ativo: params.Ativo ?? this.Ativo,
      CodUsuarioInicio: params.CodUsuarioInicio ?? this.CodUsuarioInicio,
      NomeUsuarioInicio: params.NomeUsuarioInicio ?? this.NomeUsuarioInicio,
      DataInicio: params.DataInicio ?? this.DataInicio,
      HoraInicio: params.HoraInicio ?? this.HoraInicio,
      CodUsuarioFinalizacao: params.CodUsuarioFinalizacao ?? this.CodUsuarioFinalizacao,
      NomeUsuarioFinalizacao: params.NomeUsuarioFinalizacao ?? this.NomeUsuarioFinalizacao,
      DataFinalizacao: params.DataFinalizacao ?? this.DataFinalizacao,
      HoraFinalizacao: params.HoraFinalizacao ?? this.HoraFinalizacao,
      CodSetorEstoque: params.CodSetorEstoque ?? this.CodSetorEstoque,
      NomeSetorEstoque: params.NomeSetorEstoque ?? this.NomeSetorEstoque,
    });
  }

  static fromObject(object: any): ExpedicaoCarrinhoPercursoEstagioConsultaDto {
    return new ExpedicaoCarrinhoPercursoEstagioConsultaDto({
      CodEmpresa: object.CodEmpresa,
      CodCarrinhoPercurso: object.CodCarrinhoPercurso,
      Item: object.Item,
      CodPercursoEstagio: object.CodPercursoEstagio,
      Origem: object.Origem,
      CodOrigem: object.CodOrigem,
      Situacao: object.Situacao,
      CarrinhoAgrupador: object.CarrinhoAgrupador,
      CodCarrinhoAgrupador: object.CodCarrinhoAgrupador,
      CodCarrinho: object.CodCarrinho,
      NomeCarrinho: object.NomeCarrinho,
      CodigoBarrasCarrinho: object.CodigoBarrasCarrinho,
      Ativo: object.Ativo,
      CodUsuarioInicio: object.CodUsuarioInicio,
      NomeUsuarioInicio: object.NomeUsuarioInicio,
      DataInicio: object.DataInicio,
      HoraInicio: object.HoraInicio,
      CodUsuarioFinalizacao: object.CodUsuarioFinalizacao,
      NomeUsuarioFinalizacao: object.NomeUsuarioFinalizacao,
      DataFinalizacao: object.DataFinalizacao,
      HoraFinalizacao: object.HoraFinalizacao,
      CodSetorEstoque: object.CodSetorEstoque,
      NomeSetorEstoque: object.NomeSetorEstoque,
    });
  }

  public toJson(): any {
    return {
      CodEmpresa: this.CodEmpresa,
      CodCarrinhoPercurso: this.CodCarrinhoPercurso,
      Item: this.Item,
      CodPercursoEstagio: this.CodPercursoEstagio,
      Origem: this.Origem,
      CodOrigem: this.CodOrigem,
      Situacao: this.Situacao,
      CarrinhoAgrupador: this.CarrinhoAgrupador,
      CodCarrinhoAgrupador: this.CodCarrinhoAgrupador,
      CodCarrinho: this.CodCarrinho,
      NomeCarrinho: this.NomeCarrinho,
      CodigoBarrasCarrinho: this.CodigoBarrasCarrinho,
      Ativo: this.Ativo,
      CodUsuarioInicio: this.CodUsuarioInicio,
      NomeUsuarioInicio: this.NomeUsuarioInicio,
      DataInicio: this.DataInicio,
      HoraInicio: this.HoraInicio,
      CodUsuarioFinalizacao: this.CodUsuarioFinalizacao,
      NomeUsuarioFinalizacao: this.NomeUsuarioFinalizacao,
      DataFinalizacao: this.DataFinalizacao,
      HoraFinalizacao: this.HoraFinalizacao,
      CodSetorEstoque: this.CodSetorEstoque,
      NomeSetorEstoque: this.NomeSetorEstoque,
    };
  }
}
