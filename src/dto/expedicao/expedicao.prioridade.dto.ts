export default class ExpedicaoPrioridadeDto {
  CodPrioridade: number;
  Descricao: string;
  Prioridade: number;
  Ativo: string;

  constructor(params: { CodPrioridade: number; Descricao: string; Prioridade: number; Ativo: string }) {
    this.CodPrioridade = params.CodPrioridade;
    this.Descricao = params.Descricao;
    this.Prioridade = params.Prioridade;
    this.Ativo = params.Ativo;
  }

  public copyWith(params: {
    CodPrioridade: number;
    Descricao: string;
    Prioridade: number;
    Ativo: string;
  }): ExpedicaoPrioridadeDto {
    return new ExpedicaoPrioridadeDto({
      CodPrioridade: params.CodPrioridade ?? this.CodPrioridade,
      Descricao: params.Descricao ?? this.Descricao,
      Prioridade: params.Prioridade ?? this.Prioridade,
      Ativo: params.Ativo ?? this.Ativo,
    });
  }

  static fromObject(object: any): ExpedicaoPrioridadeDto {
    return new ExpedicaoPrioridadeDto({
      CodPrioridade: object.CodPrioridade,
      Descricao: object.Descricao,
      Prioridade: object.Prioridade,
      Ativo: object.Ativo,
    });
  }

  toJson(): any {
    return {
      CodPrioridade: this.CodPrioridade,
      Descricao: this.Descricao,
      Prioridade: this.Prioridade,
      Ativo: this.Ativo,
    };
  }
}
