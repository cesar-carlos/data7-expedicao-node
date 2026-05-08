export default class ExpedicaoCarrinhoPercursoDto {
  CodEmpresa: number;
  CodCarrinhoPercurso: number;
  Origem: string;
  CodOrigem: number;
  Situacao: string;
  DataInicio: Date;
  HoraInicio: string;
  DataFinalizacao?: Date;
  HoraFinalizacao?: string;

  constructor(params: {
    CodEmpresa: number;
    CodCarrinhoPercurso: number;
    Origem: string;
    CodOrigem: number;
    Situacao: string;
    DataInicio: Date;
    HoraInicio: string;
    DataFinalizacao?: Date;
    HoraFinalizacao?: string;
  }) {
    this.CodEmpresa = params.CodEmpresa;
    this.CodCarrinhoPercurso = params.CodCarrinhoPercurso;
    this.Origem = params.Origem;
    this.CodOrigem = params.CodOrigem;
    this.Situacao = params.Situacao;
    this.DataInicio = params.DataInicio;
    this.HoraInicio = params.HoraInicio;
    this.DataFinalizacao = params.DataFinalizacao;
    this.HoraFinalizacao = params.HoraFinalizacao;
  }

  public copyWith({
    CodEmpresa,
    CodCarrinhoPercurso,
    Origem,
    CodOrigem,
    Situacao,
    DataInicio,
    HoraInicio,
    DataFinalizacao,
    HoraFinalizacao,
  }: {
    CodEmpresa?: number;
    CodCarrinhoPercurso?: number;
    Origem?: string;
    CodOrigem?: number;
    Situacao?: string;
    DataInicio?: Date;
    HoraInicio?: string;
    DataFinalizacao?: Date;
    HoraFinalizacao?: string;
  }): ExpedicaoCarrinhoPercursoDto {
    return new ExpedicaoCarrinhoPercursoDto({
      CodEmpresa: CodEmpresa ?? this.CodEmpresa,
      CodCarrinhoPercurso: CodCarrinhoPercurso ?? this.CodCarrinhoPercurso,
      Origem: Origem ?? this.Origem,
      CodOrigem: CodOrigem ?? this.CodOrigem,
      Situacao: Situacao ?? this.Situacao,
      DataInicio: DataInicio ?? this.DataInicio,
      HoraInicio: HoraInicio ?? this.HoraInicio,
      DataFinalizacao: DataFinalizacao ?? this.DataFinalizacao,
      HoraFinalizacao: HoraFinalizacao ?? this.HoraFinalizacao,
    });
  }

  static fromObject(object: any): ExpedicaoCarrinhoPercursoDto {
    return new ExpedicaoCarrinhoPercursoDto({
      CodEmpresa: object.CodEmpresa,
      CodCarrinhoPercurso: object.CodCarrinhoPercurso,
      Origem: object.Origem,
      CodOrigem: object.CodOrigem,
      Situacao: object.Situacao,
      DataInicio: object.DataInicio,
      HoraInicio: object.HoraInicio,
      DataFinalizacao: object.DataFinalizacao,
      HoraFinalizacao: object.HoraFinalizacao,
    });
  }

  public toJson(): any {
    return {
      CodEmpresa: this.CodEmpresa,
      CodCarrinhoPercurso: this.CodCarrinhoPercurso,
      Origem: this.Origem,
      CodOrigem: this.CodOrigem,
      Situacao: this.Situacao,
      DataInicio: this.DataInicio,
      HoraInicio: this.HoraInicio,
      DataFinalizacao: this.DataFinalizacao,
      HoraFinalizacao: this.HoraFinalizacao,
    };
  }
}
