export default class ExpedicaoCarrinhoConferirConsultaDto {
  CodEmpresa: number;
  CodConferir: number;
  Origem: string;
  CodOrigem: number;
  Situacao: string;
  CodCarrinhoPercurso: number;
  ItemCarrinhoPercurso: string;
  CodPrioridade: number;
  NomePrioridade: string;
  CodCarrinho: number;
  NomeCarrinho: string;
  CodigoBarrasCarrinho: string;
  SituacaoCarrinho: string;
  SituacaoCarrinhoConferencia: string;
  DataInicioPercurso: Date;
  HoraInicioPercurso: string;
  CodPercursoEstagio: number;
  NomePercursoEstagio: string;
  CodUsuarioInicioEstagio: number;
  NomeUsuarioInicioEstagio: string;
  DataInicioEstagio: Date;
  HoraInicioEstagio: string;
  CodUsuarioFinalizacaoEstagio: number;
  NomeUsuarioFinalizacaoEstagio: string;
  DataFinalizacaoEstagio: Date;
  HoraFinalizacaoEstagio: string;
  TotalItemConferir: number;
  TotalItemConferido: number;

  constructor(params: {
    CodEmpresa: number;
    CodConferir: number;
    Origem: string;
    CodOrigem: number;
    Situacao: string;
    CodCarrinhoPercurso: number;
    ItemCarrinhoPercurso: string;
    CodPrioridade: number;
    NomePrioridade: string;
    CodCarrinho: number;
    NomeCarrinho: string;
    CodigoBarrasCarrinho: string;
    SituacaoCarrinho: string;
    SituacaoCarrinhoConferencia: string;
    DataInicioPercurso: Date;
    HoraInicioPercurso: string;
    CodPercursoEstagio: number;
    NomePercursoEstagio: string;
    CodUsuarioInicioEstagio: number;
    NomeUsuarioInicioEstagio: string;
    DataInicioEstagio: Date;
    HoraInicioEstagio: string;
    CodUsuarioFinalizacaoEstagio: number;
    NomeUsuarioFinalizacaoEstagio: string;
    DataFinalizacaoEstagio: Date;
    HoraFinalizacaoEstagio: string;
    TotalItemConferir: number;
    TotalItemConferido: number;
  }) {
    this.CodEmpresa = params.CodEmpresa;
    this.CodConferir = params.CodConferir;
    this.Origem = params.Origem;
    this.CodOrigem = params.CodOrigem;
    this.Situacao = params.Situacao;
    this.CodCarrinhoPercurso = params.CodCarrinhoPercurso;
    this.ItemCarrinhoPercurso = params.ItemCarrinhoPercurso;
    this.CodPrioridade = params.CodPrioridade;
    this.NomePrioridade = params.NomePrioridade;
    this.CodCarrinho = params.CodCarrinho;
    this.NomeCarrinho = params.NomeCarrinho;
    this.CodigoBarrasCarrinho = params.CodigoBarrasCarrinho;
    this.SituacaoCarrinho = params.SituacaoCarrinho;
    this.SituacaoCarrinhoConferencia = params.SituacaoCarrinhoConferencia;
    this.DataInicioPercurso = params.DataInicioPercurso;
    this.HoraInicioPercurso = params.HoraInicioPercurso;
    this.CodPercursoEstagio = params.CodPercursoEstagio;
    this.NomePercursoEstagio = params.NomePercursoEstagio;
    this.CodUsuarioInicioEstagio = params.CodUsuarioInicioEstagio;
    this.NomeUsuarioInicioEstagio = params.NomeUsuarioInicioEstagio;
    this.DataInicioEstagio = params.DataInicioEstagio;
    this.HoraInicioEstagio = params.HoraInicioEstagio;
    this.CodUsuarioFinalizacaoEstagio = params.CodUsuarioFinalizacaoEstagio;
    this.NomeUsuarioFinalizacaoEstagio = params.NomeUsuarioFinalizacaoEstagio;
    this.DataFinalizacaoEstagio = params.DataFinalizacaoEstagio;
    this.HoraFinalizacaoEstagio = params.HoraFinalizacaoEstagio;
    this.TotalItemConferir = params.TotalItemConferir;
    this.TotalItemConferido = params.TotalItemConferido;
  }

  public copyWith(params: {
    CodEmpresa?: number;
    CodConferir?: number;
    Origem?: string;
    CodOrigem?: number;
    Situacao?: string;
    CodCarrinhoPercurso?: number;
    ItemCarrinhoPercurso?: string;
    CodPrioridade?: number;
    NomePrioridade?: string;
    CodCarrinho?: number;
    NomeCarrinho?: string;
    CodigoBarrasCarrinho?: string;
    SituacaoCarrinho?: string;
    SituacaoCarrinhoConferencia?: string;
    DataInicioPercurso?: Date;
    HoraInicioPercurso?: string;
    CodPercursoEstagio?: number;
    NomePercursoEstagio?: string;
    CodUsuarioInicioEstagio?: number;
    NomeUsuarioInicioEstagio?: string;
    DataInicioEstagio?: Date;
    HoraInicioEstagio?: string;
    CodUsuarioFinalizacaoEstagio?: number;
    NomeUsuarioFinalizacaoEstagio?: string;
    DataFinalizacaoEstagio?: Date;
    HoraFinalizacaoEstagio?: string;
    TotalItemConferir?: number;
    TotalItemConferido?: number;
  }): ExpedicaoCarrinhoConferirConsultaDto {
    return new ExpedicaoCarrinhoConferirConsultaDto({
      CodEmpresa: params.CodEmpresa ?? this.CodEmpresa,
      CodConferir: params.CodConferir ?? this.CodConferir,
      Origem: params.Origem ?? this.Origem,
      CodOrigem: params.CodOrigem ?? this.CodOrigem,
      Situacao: params.Situacao ?? this.Situacao,
      CodCarrinhoPercurso: params.CodCarrinhoPercurso ?? this.CodCarrinhoPercurso,
      ItemCarrinhoPercurso: params.ItemCarrinhoPercurso ?? this.ItemCarrinhoPercurso,
      CodPrioridade: params.CodPrioridade ?? this.CodPrioridade,
      NomePrioridade: params.NomePrioridade ?? this.NomePrioridade,
      CodCarrinho: params.CodCarrinho ?? this.CodCarrinho,
      NomeCarrinho: params.NomeCarrinho ?? this.NomeCarrinho,
      CodigoBarrasCarrinho: params.CodigoBarrasCarrinho ?? this.CodigoBarrasCarrinho,
      SituacaoCarrinho: params.SituacaoCarrinho ?? this.SituacaoCarrinho,
      SituacaoCarrinhoConferencia: params.SituacaoCarrinhoConferencia ?? this.SituacaoCarrinhoConferencia,
      DataInicioPercurso: params.DataInicioPercurso ?? this.DataInicioPercurso,
      HoraInicioPercurso: params.HoraInicioPercurso ?? this.HoraInicioPercurso,
      CodPercursoEstagio: params.CodPercursoEstagio ?? this.CodPercursoEstagio,
      NomePercursoEstagio: params.NomePercursoEstagio ?? this.NomePercursoEstagio,
      CodUsuarioInicioEstagio: params.CodUsuarioInicioEstagio ?? this.CodUsuarioInicioEstagio,
      NomeUsuarioInicioEstagio: params.NomeUsuarioInicioEstagio ?? this.NomeUsuarioInicioEstagio,
      DataInicioEstagio: params.DataInicioEstagio ?? this.DataInicioEstagio,
      HoraInicioEstagio: params.HoraInicioEstagio ?? this.HoraInicioEstagio,
      CodUsuarioFinalizacaoEstagio: params.CodUsuarioFinalizacaoEstagio ?? this.CodUsuarioFinalizacaoEstagio,
      NomeUsuarioFinalizacaoEstagio: params.NomeUsuarioFinalizacaoEstagio ?? this.NomeUsuarioFinalizacaoEstagio,
      DataFinalizacaoEstagio: params.DataFinalizacaoEstagio ?? this.DataFinalizacaoEstagio,
      HoraFinalizacaoEstagio: params.HoraFinalizacaoEstagio ?? this.HoraFinalizacaoEstagio,
      TotalItemConferir: params.TotalItemConferir ?? this.TotalItemConferir,
      TotalItemConferido: params.TotalItemConferido ?? this.TotalItemConferido,
    });
  }

  static fromObject(object: any): ExpedicaoCarrinhoConferirConsultaDto {
    return new ExpedicaoCarrinhoConferirConsultaDto({
      CodEmpresa: object.CodEmpresa,
      CodConferir: object.CodConferir,
      Origem: object.Origem,
      CodOrigem: object.CodOrigem,
      Situacao: object.Situacao,
      CodCarrinhoPercurso: object.CodCarrinhoPercurso,
      ItemCarrinhoPercurso: object.ItemCarrinhoPercurso,
      CodPrioridade: object.CodPrioridade,
      NomePrioridade: object.NomePrioridade,
      CodCarrinho: object.CodCarrinho,
      NomeCarrinho: object.NomeCarrinho,
      CodigoBarrasCarrinho: object.CodigoBarrasCarrinho,
      SituacaoCarrinho: object.SituacaoCarrinho,
      SituacaoCarrinhoConferencia: object.SituacaoCarrinhoConferencia,
      DataInicioPercurso: object.DataInicioPercurso,
      HoraInicioPercurso: object.HoraInicioPercurso,
      CodPercursoEstagio: object.CodPercursoEstagio,
      NomePercursoEstagio: object.NomePercursoEstagio,
      CodUsuarioInicioEstagio: object.CodUsuarioInicioEstagio,
      NomeUsuarioInicioEstagio: object.NomeUsuarioInicioEstagio,
      DataInicioEstagio: object.DataInicioEstagio,
      HoraInicioEstagio: object.HoraInicioEstagio,
      CodUsuarioFinalizacaoEstagio: object.CodUsuarioFinalizacaoEstagio,
      NomeUsuarioFinalizacaoEstagio: object.NomeUsuarioFinalizacaoEstagio,
      DataFinalizacaoEstagio: object.DataFinalizacaoEstagio,
      HoraFinalizacaoEstagio: object.HoraFinalizacaoEstagio,
      TotalItemConferir: object.TotalItemConferir,
      TotalItemConferido: object.TotalItemConferido,
    });
  }

  public toJson(): any {
    return {
      CodEmpresa: this.CodEmpresa,
      CodConferir: this.CodConferir,
      Origem: this.Origem,
      CodOrigem: this.CodOrigem,
      Situacao: this.Situacao,
      CodCarrinhoPercurso: this.CodCarrinhoPercurso,
      ItemCarrinhoPercurso: this.ItemCarrinhoPercurso,
      CodPrioridade: this.CodPrioridade,
      NomePrioridade: this.NomePrioridade,
      CodCarrinho: this.CodCarrinho,
      NomeCarrinho: this.NomeCarrinho,
      CodigoBarrasCarrinho: this.CodigoBarrasCarrinho,
      SituacaoCarrinho: this.SituacaoCarrinho,
      SituacaoCarrinhoConferencia: this.SituacaoCarrinhoConferencia,
      DataInicioPercurso: this.DataInicioPercurso,
      HoraInicioPercurso: this.HoraInicioPercurso,
      CodPercursoEstagio: this.CodPercursoEstagio,
      NomePercursoEstagio: this.NomePercursoEstagio,
      CodUsuarioInicioEstagio: this.CodUsuarioInicioEstagio,
      NomeUsuarioInicioEstagio: this.NomeUsuarioInicioEstagio,
      DataInicioEstagio: this.DataInicioEstagio,
      HoraInicioEstagio: this.HoraInicioEstagio,
      CodUsuarioFinalizacaoEstagio: this.CodUsuarioFinalizacaoEstagio,
      NomeUsuarioFinalizacaoEstagio: this.NomeUsuarioFinalizacaoEstagio,
      DataFinalizacaoEstagio: this.DataFinalizacaoEstagio,
      HoraFinalizacaoEstagio: this.HoraFinalizacaoEstagio,
      TotalItemConferir: Number(this.TotalItemConferir).toFixed(4),
      TotalItemConferido: Number(this.TotalItemConferido).toFixed(4),
    };
  }
}
