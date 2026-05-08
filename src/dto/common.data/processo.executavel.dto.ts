export default class ProcessoExecutavelDto {
  CodProcessoExecutavel: number;
  CodEmpresa: number;
  CodFilial: number;
  Status: string;
  Contexto: string;
  Origem: string;
  CodOrigem: number;
  ItemOrigem?: string;
  DataAbertura: Date;
  CodUsuario: number;
  NomeUsuario: string;
  CodSetorEstoque?: number;
  CodSetorConferencia?: number;
  CodContaFinanceira?: string;
  CodPeriodoCaixa?: number;
  StatusPeriodoCaixa?: string;
  UsuarioWindows: string;
  NomeComputador: string;
  BancoDados: string;

  constructor(params: {
    CodProcessoExecutavel: number;
    CodEmpresa: number;
    CodFilial: number;
    Status: string;
    Contexto: string;
    Origem: string;
    CodOrigem: number;
    ItemOrigem?: string;
    DataAbertura: Date;
    CodUsuario: number;
    NomeUsuario: string;
    CodSetorEstoque?: number;
    CodSetorConferencia?: number;
    CodContaFinanceira?: string;
    CodPeriodoCaixa?: number;
    StatusPeriodoCaixa?: string;
    UsuarioWindows: string;
    NomeComputador: string;
    BancoDados: string;
  }) {
    this.CodProcessoExecutavel = params.CodProcessoExecutavel;
    this.CodEmpresa = params.CodEmpresa;
    this.CodFilial = params.CodFilial;
    this.Status = params.Status;
    this.Contexto = params.Contexto;
    this.Origem = params.Origem;
    this.CodOrigem = params.CodOrigem;
    this.ItemOrigem = params.ItemOrigem;
    this.DataAbertura = params.DataAbertura;
    this.CodUsuario = params.CodUsuario;
    this.NomeUsuario = params.NomeUsuario;
    this.CodSetorEstoque = params.CodSetorEstoque;
    this.CodSetorConferencia = params.CodSetorConferencia;
    this.CodContaFinanceira = params.CodContaFinanceira;
    this.CodPeriodoCaixa = params.CodPeriodoCaixa;
    this.StatusPeriodoCaixa = params.StatusPeriodoCaixa;
    this.UsuarioWindows = params.UsuarioWindows;
    this.NomeComputador = params.NomeComputador;
    this.BancoDados = params.BancoDados;
  }

  copyWith(params: {
    CodProcessoExecutavel?: number;
    CodEmpresa?: number;
    CodFilial?: number;
    Status?: string;
    Contexto?: string;
    Origem?: string;
    CodOrigem?: number;
    ItemOrigem?: string;
    DataAbertura?: Date;
    CodUsuario?: number;
    NomeUsuario?: string;
    CodSetorEstoque?: number;
    CodSetorConferencia?: number;
    CodContaFinanceira?: string;
    CodPeriodoCaixa?: number;
    StatusPeriodoCaixa?: string;
    UsuarioWindows?: string;
    NomeComputador?: string;
    BancoDados?: string;
  }): ProcessoExecutavelDto {
    return new ProcessoExecutavelDto({
      CodProcessoExecutavel: params.CodProcessoExecutavel ?? this.CodProcessoExecutavel,
      CodEmpresa: params.CodEmpresa ?? this.CodEmpresa,
      CodFilial: params.CodFilial ?? this.CodFilial,
      Status: params.Status ?? this.Status,
      Contexto: params.Contexto ?? this.Contexto,
      Origem: params.Origem ?? this.Origem,
      CodOrigem: params.CodOrigem ?? this.CodOrigem,
      ItemOrigem: params.ItemOrigem ?? this.ItemOrigem,
      DataAbertura: params.DataAbertura ?? this.DataAbertura,
      CodUsuario: params.CodUsuario ?? this.CodUsuario,
      NomeUsuario: params.NomeUsuario ?? this.NomeUsuario,
      CodSetorEstoque: params.CodSetorEstoque ?? this.CodSetorEstoque,
      CodSetorConferencia: params.CodSetorConferencia ?? this.CodSetorConferencia,
      CodContaFinanceira: params.CodContaFinanceira ?? this.CodContaFinanceira,
      CodPeriodoCaixa: params.CodPeriodoCaixa ?? this.CodPeriodoCaixa,
      StatusPeriodoCaixa: params.StatusPeriodoCaixa ?? this.StatusPeriodoCaixa,
      UsuarioWindows: params.UsuarioWindows ?? this.UsuarioWindows,
      NomeComputador: params.NomeComputador ?? this.NomeComputador,
      BancoDados: params.BancoDados ?? this.BancoDados,
    });
  }

  static fromObject(object: any): ProcessoExecutavelDto {
    return new ProcessoExecutavelDto({
      CodProcessoExecutavel: object.CodProcessoExecutavel,
      CodEmpresa: object.CodEmpresa,
      CodFilial: object.CodFilial,
      Status: object.Status,
      Contexto: object.Contexto,
      Origem: object.Origem,
      CodOrigem: object.CodOrigem,
      ItemOrigem: object.ItemOrigem,
      DataAbertura: object.DataAbertura,
      CodUsuario: object.CodUsuario,
      NomeUsuario: object.NomeUsuario,
      CodSetorEstoque: object.CodSetorEstoque,
      CodSetorConferencia: object.CodSetorConferencia,
      CodContaFinanceira: object.CodContaFinanceira,
      CodPeriodoCaixa: object.CodPeriodoCaixa,
      StatusPeriodoCaixa: object.StatusPeriodoCaixa,
      UsuarioWindows: object.UsuarioWindows,
      NomeComputador: object.NomeComputador,
      BancoDados: object.BancoDados,
    });
  }

  public toJson(): any {
    return {
      CodProcessoExecutavel: this.CodProcessoExecutavel,
      CodEmpresa: this.CodEmpresa,
      CodFilial: this.CodFilial,
      Status: this.Status,
      Contexto: this.Contexto,
      Origem: this.Origem,
      CodOrigem: this.CodOrigem,
      ItemOrigem: this.ItemOrigem,
      DataAbertura: this.DataAbertura,
      CodUsuario: this.CodUsuario,
      NomeUsuario: this.NomeUsuario,
      CodSetorEstoque: this.CodSetorEstoque,
      CodSetorConferencia: this.CodSetorConferencia,
      CodContaFinanceira: this.CodContaFinanceira,
      CodPeriodoCaixa: this.CodPeriodoCaixa,
      StatusPeriodoCaixa: this.StatusPeriodoCaixa,
      UsuarioWindows: this.UsuarioWindows,
      NomeComputador: this.NomeComputador,
      BancoDados: this.BancoDados,
    };
  }
}
