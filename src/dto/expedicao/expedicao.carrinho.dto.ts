export default class ExpedicaoCarrinhoDto {
  CodEmpresa: number;
  CodCarrinho: number;
  CodigoBarras: string;
  Descricao: string;
  Situacao: string;
  Ativo: string;

  constructor(params: {
    CodEmpresa: number;
    CodCarrinho: number;
    CodigoBarras: string;
    Descricao: string;
    Situacao: string;
    Ativo: string;
  }) {
    this.CodEmpresa = params.CodEmpresa;
    this.CodCarrinho = params.CodCarrinho;
    this.CodigoBarras = params.CodigoBarras;
    this.Descricao = params.Descricao;
    this.Situacao = params.Situacao;
    this.Ativo = params.Ativo;
  }

  public copyWith(params: {
    CodEmpresa?: number;
    CodCarrinho?: number;
    CodigoBarras?: string;
    Descricao?: string;
    Situacao?: string;
    Ativo?: string;
  }) {
    return new ExpedicaoCarrinhoDto({
      CodEmpresa: params.CodEmpresa ?? this.CodEmpresa,
      CodCarrinho: params.CodCarrinho ?? this.CodCarrinho,
      CodigoBarras: params.CodigoBarras ?? this.CodigoBarras,
      Descricao: params.Descricao ?? this.Descricao,
      Situacao: params.Situacao ?? this.Situacao,
      Ativo: params.Ativo ?? this.Ativo,
    });
  }

  static fromObject(object: any): ExpedicaoCarrinhoDto {
    return new ExpedicaoCarrinhoDto({
      CodEmpresa: object.CodEmpresa,
      CodCarrinho: object.CodCarrinho,
      CodigoBarras: object.CodigoBarras,
      Descricao: object.Descricao,
      Situacao: object.Situacao,
      Ativo: object.Ativo,
    });
  }

  public toJson(): any {
    return {
      CodEmpresa: this.CodEmpresa,
      CodCarrinho: this.CodCarrinho,
      CodigoBarras: this.CodigoBarras,
      Descricao: this.Descricao,
      Situacao: this.Situacao,
      Ativo: this.Ativo,
    };
  }
}
