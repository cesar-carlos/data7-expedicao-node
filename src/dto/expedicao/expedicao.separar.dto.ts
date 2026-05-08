export default class ExpedicaoSepararDto {
  CodEmpresa: number;
  CodSepararEstoque: number;
  Origem: string;
  CodOrigem: number;
  CodTipoOperacaoExpedicao: number;
  TipoEntidade: string;
  CodEntidade: number;
  NomeEntidade: string;
  Situacao: string;
  Data: Date;
  Hora: string;
  CodPrioridade: number;
  Historico?: string;
  Observacao?: string;
  CodMotivoCancelamento?: number;
  DataCancelamento?: Date;
  HoraCancelamento?: string;
  CodUsuarioCancelamento?: number;
  NomeUsuarioCancelamento?: string;
  ObservacaoCancelamento?: string;

  constructor(params: {
    CodEmpresa: number;
    CodSepararEstoque: number;
    Origem: string;
    CodOrigem: number;
    CodTipoOperacaoExpedicao: number;
    TipoEntidade: string;
    CodEntidade: number;
    NomeEntidade: string;
    Situacao: string;
    Data: Date;
    Hora: string;
    CodPrioridade: number;
    Historico?: string;
    Observacao?: string;
    CodMotivoCancelamento?: number;
    DataCancelamento?: Date;
    HoraCancelamento?: string;
    CodUsuarioCancelamento?: number;
    NomeUsuarioCancelamento?: string;
    ObservacaoCancelamento?: string;
  }) {
    this.CodEmpresa = params.CodEmpresa;
    this.CodSepararEstoque = params.CodSepararEstoque;
    this.Origem = params.Origem;
    this.CodOrigem = params.CodOrigem;
    this.CodTipoOperacaoExpedicao = params.CodTipoOperacaoExpedicao;
    this.TipoEntidade = params.TipoEntidade;
    this.CodEntidade = params.CodEntidade;
    this.NomeEntidade = params.NomeEntidade;
    this.Situacao = params.Situacao;
    this.Data = params.Data;
    this.Hora = params.Hora;
    this.CodPrioridade = params.CodPrioridade;
    this.Historico = params?.Historico;
    this.Observacao = params?.Observacao;
    this.CodMotivoCancelamento = params?.CodMotivoCancelamento;
    this.DataCancelamento = params?.DataCancelamento;
    this.HoraCancelamento = params?.HoraCancelamento;
    this.CodUsuarioCancelamento = params?.CodUsuarioCancelamento;
    this.NomeUsuarioCancelamento = params?.NomeUsuarioCancelamento;
    this.ObservacaoCancelamento = params?.ObservacaoCancelamento;
  }

  public copyWith(params: {
    CodEmpresa: number;
    CodSepararEstoque: number;
    Origem: string;
    CodOrigem: number;
    CodTipoOperacaoExpedicao: number;
    TipoEntidade: string;
    CodEntidade: number;
    NomeEntidade: string;
    Situacao: string;
    Data: Date;
    Hora: string;
    CodPrioridade: number;
    Historico?: string;
    Observacao?: string;
    CodMotivoCancelamento?: number;
    DataCancelamento?: Date;
    HoraCancelamento?: string;
    CodUsuarioCancelamento?: number;
    NomeUsuarioCancelamento?: string;
    ObservacaoCancelamento?: string;
  }): ExpedicaoSepararDto {
    return new ExpedicaoSepararDto({
      CodEmpresa: params.CodEmpresa ?? this.CodEmpresa,
      CodSepararEstoque: params.CodSepararEstoque ?? this.CodSepararEstoque,
      Origem: params.Origem ?? this.Origem,
      CodOrigem: params.CodOrigem ?? this.CodOrigem,
      CodTipoOperacaoExpedicao: params.CodTipoOperacaoExpedicao ?? this.CodTipoOperacaoExpedicao,
      TipoEntidade: params.TipoEntidade ?? this.TipoEntidade,
      CodEntidade: params.CodEntidade ?? this.CodEntidade,
      NomeEntidade: params.NomeEntidade ?? this.NomeEntidade,
      Situacao: params.Situacao ?? this.Situacao,
      Data: params.Data ?? this.Data,
      Hora: params.Hora ?? this.Hora,
      CodPrioridade: params.CodPrioridade ?? this.CodPrioridade,
      Historico: params?.Historico ?? this.Historico,
      Observacao: params?.Observacao ?? this.Observacao,
      CodMotivoCancelamento: params?.CodMotivoCancelamento ?? this.CodMotivoCancelamento,
      DataCancelamento: params?.DataCancelamento ?? this.DataCancelamento,
      HoraCancelamento: params?.HoraCancelamento ?? this.HoraCancelamento,
      CodUsuarioCancelamento: params?.CodUsuarioCancelamento ?? this.CodUsuarioCancelamento,
      NomeUsuarioCancelamento: params?.NomeUsuarioCancelamento ?? this.NomeUsuarioCancelamento,
      ObservacaoCancelamento: params?.ObservacaoCancelamento ?? this.ObservacaoCancelamento,
    });
  }

  static fromObject(object: any): ExpedicaoSepararDto {
    return new ExpedicaoSepararDto({
      CodEmpresa: object.CodEmpresa,
      CodSepararEstoque: object.CodSepararEstoque,
      Origem: object.Origem,
      CodOrigem: object.CodOrigem,
      CodTipoOperacaoExpedicao: object.CodTipoOperacaoExpedicao,
      TipoEntidade: object.TipoEntidade,
      CodEntidade: object.CodEntidade,
      NomeEntidade: object.NomeEntidade,
      Situacao: object.Situacao,
      Data: object.Data,
      Hora: object.Hora,
      CodPrioridade: object.CodPrioridade,
      Historico: object?.Historico,
      Observacao: object?.Observacao,
      CodMotivoCancelamento: object?.CodMotivoCancelamento,
      DataCancelamento: object?.DataCancelamento,
      HoraCancelamento: object?.HoraCancelamento,
      CodUsuarioCancelamento: object?.CodUsuarioCancelamento,
      NomeUsuarioCancelamento: object?.NomeUsuarioCancelamento,
      ObservacaoCancelamento: object?.ObservacaoCancelamento,
    });
  }

  toJson(): any {
    return {
      CodEmpresa: this.CodEmpresa,
      CodSepararEstoque: this.CodSepararEstoque,
      Origem: this.Origem,
      CodOrigem: this.CodOrigem,
      CodTipoOperacaoExpedicao: this.CodTipoOperacaoExpedicao,
      TipoEntidade: this.TipoEntidade,
      CodEntidade: this.CodEntidade,
      NomeEntidade: this.NomeEntidade,
      Situacao: this.Situacao,
      Data: this.Data,
      Hora: this.Hora,
      CodPrioridade: this.CodPrioridade,
      Historico: this.Historico,
      Observacao: this.Observacao,
      CodMotivoCancelamento: this.CodMotivoCancelamento,
      DataCancelamento: this.DataCancelamento,
      HoraCancelamento: this.HoraCancelamento,
      CodUsuarioCancelamento: this.CodUsuarioCancelamento,
      NomeUsuarioCancelamento: this.NomeUsuarioCancelamento,
      ObservacaoCancelamento: this.ObservacaoCancelamento,
    };
  }
}
