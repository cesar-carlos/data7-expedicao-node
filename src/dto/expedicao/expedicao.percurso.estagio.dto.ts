export default class ExpedicaoPercursoEstagioDto {
  CodPercursoEstagio: number;
  Descricao: string;
  Ativo: string;
  Origem: string;
  Sequencia: number;

  constructor(params: {
    CodPercursoEstagio: number;
    Descricao: string;
    Ativo: string;
    Origem: string;
    Sequencia: number;
  }) {
    this.CodPercursoEstagio = params.CodPercursoEstagio;
    this.Descricao = params.Descricao;
    this.Ativo = params.Ativo;
    this.Origem = params.Origem;
    this.Sequencia = params.Sequencia;
  }

  public copyWith(params: {
    CodPercursoEstagio: number;
    Descricao: string;
    Ativo: string;
    Origem: string;
    Sequencia: number;
  }): ExpedicaoPercursoEstagioDto {
    return new ExpedicaoPercursoEstagioDto({
      CodPercursoEstagio: params.CodPercursoEstagio ?? this.CodPercursoEstagio,
      Descricao: params.Descricao ?? this.Descricao,
      Ativo: params.Ativo ?? this.Ativo,
      Origem: params.Origem ?? this.Origem,
      Sequencia: params.Sequencia ?? this.Sequencia,
    });
  }

  static fromObject(object: any): ExpedicaoPercursoEstagioDto {
    return new ExpedicaoPercursoEstagioDto({
      CodPercursoEstagio: object.CodPercursoEstagio,
      Descricao: object.Descricao,
      Ativo: object.Ativo,
      Origem: object.Origem,
      Sequencia: object.Sequencia,
    });
  }

  toJson(): any {
    return {
      CodPercursoEstagio: this.CodPercursoEstagio,
      Descricao: this.Descricao,
      Ativo: this.Ativo,
      Origem: this.Origem,
      Sequencia: this.Sequencia,
    };
  }
}
