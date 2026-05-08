export default class ExpedicaoConferirDto {
  CodEmpresa: number;
  CodConferir: number;
  Origem: string;
  CodOrigem: number;
  CodPrioridade: number;
  Situacao: string;
  Data: Date;
  Hora: string;
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
    CodConferir: number;
    Origem: string;
    CodOrigem: number;
    CodPrioridade: number;
    Situacao: string;
    Data: Date;
    Hora: string;
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
    this.CodConferir = params.CodConferir;
    this.Origem = params.Origem;
    this.CodOrigem = params.CodOrigem;
    this.CodPrioridade = params.CodPrioridade;
    this.Situacao = params.Situacao;
    this.Data = params.Data;
    this.Hora = params.Hora;
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
    CodEmpresa?: number;
    CodConferir?: number;
    Origem?: string;
    CodOrigem?: number;
    CodPrioridade?: number;
    Situacao?: string;
    Data?: Date;
    Hora?: string;
    Historico?: string;
    Observacao?: string;
    CodMotivoCancelamento?: number;
    DataCancelamento?: Date;
    HoraCancelamento?: string;
    CodUsuarioCancelamento?: number;
    NomeUsuarioCancelamento?: string;
    ObservacaoCancelamento?: string;
  }) {
    return new ExpedicaoConferirDto({
      CodEmpresa: params?.CodEmpresa ?? this.CodEmpresa,
      CodConferir: params?.CodConferir ?? this.CodConferir,
      Origem: params?.Origem ?? this.Origem,
      CodOrigem: params?.CodOrigem ?? this.CodOrigem,
      CodPrioridade: params?.CodPrioridade ?? this.CodPrioridade,
      Situacao: params?.Situacao ?? this.Situacao,
      Data: params?.Data ?? this.Data,
      Hora: params?.Hora ?? this.Hora,
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

  static fromObject(object: any): ExpedicaoConferirDto {
    try {
      return new ExpedicaoConferirDto({
        CodEmpresa: object.CodEmpresa,
        CodConferir: object.CodConferir,
        Origem: object.Origem,
        CodOrigem: object.CodOrigem,
        CodPrioridade: object.CodPrioridade,
        Situacao: object.Situacao,
        Data: object.Data,
        Hora: object.Hora,
        Historico: object?.Historico,
        Observacao: object?.Observacao,
        CodMotivoCancelamento: object?.CodMotivoCancelamento,
        DataCancelamento: object?.DataCancelamento,
        HoraCancelamento: object?.HoraCancelamento,
        CodUsuarioCancelamento: object?.CodUsuarioCancelamento,
        NomeUsuarioCancelamento: object?.NomeUsuarioCancelamento,
        ObservacaoCancelamento: object?.ObservacaoCancelamento,
      });
    } catch (error) {
      throw new Error('Error parsing object to ExpedicaoConferirDto');
    }
  }

  toJson(): any {
    return {
      CodEmpresa: this.CodEmpresa,
      CodConferir: this.CodConferir,
      Origem: this.Origem,
      CodOrigem: this.CodOrigem,
      CodPrioridade: this.CodPrioridade,
      Situacao: this.Situacao,
      Data: this.Data,
      Hora: this.Hora,
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
