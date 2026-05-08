export default class ExpedicaoConferirConsultaDto {
  CodEmpresa: number;
  CodConferir: number;
  Origem: string;
  CodOrigem: number;
  Situacao: string;
  CodCarrinhoPercurso: number;
  DataLancamento: Date;
  HoraLancamento: string;
  TipoEntidade: string;
  CodEntidade: number;
  NomeEntidade: string;
  CodPrioridade: number;
  NomePrioridade: string;
  Historico: string;
  Observacao: string;

  constructor(params: {
    CodEmpresa: number;
    CodConferir: number;
    Origem: string;
    CodCarrinhoPercurso: number;
    CodOrigem: number;
    Situacao: string;
    DataLancamento: Date;
    HoraLancamento: string;
    TipoEntidade: string;
    CodEntidade: number;
    NomeEntidade: string;
    CodPrioridade: number;
    NomePrioridade: string;
    Historico: string;
    Observacao: string;
  }) {
    this.CodEmpresa = params.CodEmpresa;
    this.CodConferir = params.CodConferir;
    this.Origem = params.Origem;
    this.CodOrigem = params.CodOrigem;
    this.Situacao = params.Situacao;
    this.CodCarrinhoPercurso = params.CodCarrinhoPercurso;
    this.DataLancamento = params.DataLancamento;
    this.HoraLancamento = params.HoraLancamento;
    this.TipoEntidade = params.TipoEntidade;
    this.CodEntidade = params.CodEntidade;
    this.NomeEntidade = params.NomeEntidade;
    this.CodPrioridade = params.CodPrioridade;
    this.NomePrioridade = params.NomePrioridade;
    this.Historico = params.Historico;
    this.Observacao = params.Observacao;
  }

  public copyWith(params: {
    CodEmpresa?: number;
    CodConferir?: number;
    Origem?: string;
    CodOrigem?: number;
    Situacao?: string;
    CodCarrinhoPercurso?: number;
    DataLancamento?: Date;
    HoraLancamento?: string;
    TipoEntidade?: string;
    CodEntidade?: number;
    NomeEntidade?: string;
    CodPrioridade?: number;
    NomePrioridade?: string;
    Historico?: string;
    Observacao?: string;
  }) {
    return new ExpedicaoConferirConsultaDto({
      CodEmpresa: params.CodEmpresa ?? this.CodEmpresa,
      CodConferir: params.CodConferir ?? this.CodConferir,
      Origem: params.Origem ?? this.Origem,
      CodOrigem: params.CodOrigem ?? this.CodOrigem,
      Situacao: params.Situacao ?? this.Situacao,
      CodCarrinhoPercurso: params.CodCarrinhoPercurso ?? this.CodCarrinhoPercurso,
      DataLancamento: params.DataLancamento ?? this.DataLancamento,
      HoraLancamento: params.HoraLancamento ?? this.HoraLancamento,
      TipoEntidade: params.TipoEntidade ?? this.TipoEntidade,
      CodEntidade: params.CodEntidade ?? this.CodEntidade,
      NomeEntidade: params.NomeEntidade ?? this.NomeEntidade,
      CodPrioridade: params.CodPrioridade ?? this.CodPrioridade,
      NomePrioridade: params.NomePrioridade ?? this.NomePrioridade,
      Historico: params.Historico ?? this.Historico,
      Observacao: params.Observacao ?? this.Observacao,
    });
  }

  static fromObject(object: any): ExpedicaoConferirConsultaDto {
    return new ExpedicaoConferirConsultaDto({
      CodEmpresa: object.CodEmpresa,
      CodConferir: object.CodConferir,
      Origem: object.Origem,
      CodOrigem: object.CodOrigem,
      Situacao: object.Situacao,
      CodCarrinhoPercurso: object.CodCarrinhoPercurso,
      DataLancamento: object.DataLancamento,
      HoraLancamento: object.HoraLancamento,
      TipoEntidade: object.TipoEntidade,
      CodEntidade: object.CodEntidade,
      NomeEntidade: object.NomeEntidade,
      CodPrioridade: object.CodPrioridade,
      NomePrioridade: object.NomePrioridade,
      Historico: object.Historico,
      Observacao: object.Observacao,
    });
  }

  toJson(): any {
    return {
      CodEmpresa: this.CodEmpresa,
      CodConferir: this.CodConferir,
      Origem: this.Origem,
      CodOrigem: this.CodOrigem,
      CodCarrinhoPercurso: this.CodCarrinhoPercurso,
      Situacao: this.Situacao,
      DataLancamento: this.DataLancamento,
      HoraLancamento: this.HoraLancamento,
      TipoEntidade: this.TipoEntidade,
      CodEntidade: this.CodEntidade,
      NomeEntidade: this.NomeEntidade,
      CodPrioridade: this.CodPrioridade,
      NomePrioridade: this.NomePrioridade,
      Historico: this.Historico,
      Observacao: this.Observacao,
    };
  }
}
