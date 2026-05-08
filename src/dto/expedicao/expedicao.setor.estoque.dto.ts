export default class ExpedicaoSetorEstoqueDto {
  CodSetorEstoque: number;
  Descricao: string;
  Ativo: string;

  constructor(params: { CodSetorEstoque: number; Descricao: string; Ativo: string }) {
    this.CodSetorEstoque = params.CodSetorEstoque;
    this.Descricao = params.Descricao;
    this.Ativo = params.Ativo;
  }

  public copyWith(params: { CodSetorEstoque: number; Descricao: string; Ativo: string }): ExpedicaoSetorEstoqueDto {
    return new ExpedicaoSetorEstoqueDto({
      CodSetorEstoque: params.CodSetorEstoque ?? this.CodSetorEstoque,
      Descricao: params.Descricao ?? this.Descricao,
      Ativo: params.Ativo ?? this.Ativo,
    });
  }

  static fromObject(object: any): ExpedicaoSetorEstoqueDto {
    return new ExpedicaoSetorEstoqueDto({
      CodSetorEstoque: object.CodSetorEstoque,
      Descricao: object.Descricao,
      Ativo: object.Ativo,
    });
  }

  toJson(): any {
    return {
      CodSetorEstoque: this.CodSetorEstoque,
      Descricao: this.Descricao,
      Ativo: this.Ativo,
    };
  }
}
