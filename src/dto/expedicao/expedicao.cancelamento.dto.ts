export default class ExpedicaoCancelamentoDto {
  CodEmpresa: number;
  CodCancelamento: number;
  Origem: string;
  CodOrigem: number;
  ItemOrigem?: string;
  CodMotivoCancelamento: number;
  DataCancelamento: Date;
  HoraCancelamento: string;
  CodUsuarioCancelamento: number;
  NomeUsuarioCancelamento: string;
  ObservacaoCancelamento?: string;

  constructor(params: {
    CodEmpresa: number;
    CodCancelamento: number;
    Origem: string;
    CodOrigem: number;
    ItemOrigem?: string;
    CodMotivoCancelamento: number;
    DataCancelamento: Date;
    HoraCancelamento: string;
    CodUsuarioCancelamento: number;
    NomeUsuarioCancelamento: string;
    ObservacaoCancelamento?: string;
  }) {
    this.CodEmpresa = params.CodEmpresa;
    this.CodCancelamento = params.CodCancelamento;
    this.Origem = params.Origem;
    this.CodOrigem = params.CodOrigem;
    this.ItemOrigem = params.ItemOrigem;
    this.CodMotivoCancelamento = params.CodMotivoCancelamento;
    this.DataCancelamento = params.DataCancelamento;
    this.HoraCancelamento = params.HoraCancelamento;
    this.CodUsuarioCancelamento = params.CodUsuarioCancelamento;
    this.NomeUsuarioCancelamento = params.NomeUsuarioCancelamento;
    this.ObservacaoCancelamento = params.ObservacaoCancelamento;
  }

  public copyWith(params: {
    CodEmpresa?: number;
    CodCancelamento?: number;
    Origem?: string;
    CodOrigem?: number;
    ItemOrigem?: string;
    CodMotivoCancelamento?: number;
    DataCancelamento?: Date;
    HoraCancelamento?: string;
    CodUsuarioCancelamento?: number;
    NomeUsuarioCancelamento?: string;
    ObservacaoCancelamento?: string;
  }) {
    return new ExpedicaoCancelamentoDto({
      CodEmpresa: params.CodEmpresa ?? this.CodEmpresa,
      CodCancelamento: params.CodCancelamento ?? this.CodCancelamento,
      Origem: params.Origem ?? this.Origem,
      CodOrigem: params.CodOrigem ?? this.CodOrigem,
      ItemOrigem: params.ItemOrigem ?? this.ItemOrigem,
      CodMotivoCancelamento: params.CodMotivoCancelamento ?? this.CodMotivoCancelamento,
      DataCancelamento: params.DataCancelamento ?? this.DataCancelamento,
      HoraCancelamento: params.HoraCancelamento ?? this.HoraCancelamento,
      CodUsuarioCancelamento: params.CodUsuarioCancelamento ?? this.CodUsuarioCancelamento,
      NomeUsuarioCancelamento: params.NomeUsuarioCancelamento ?? this.NomeUsuarioCancelamento,
      ObservacaoCancelamento: params.ObservacaoCancelamento ?? this.ObservacaoCancelamento,
    });
  }

  static fromObject(object: any): ExpedicaoCancelamentoDto {
    return new ExpedicaoCancelamentoDto({
      CodEmpresa: object.CodEmpresa,
      CodCancelamento: object.CodCancelamento,
      Origem: object.Origem,
      CodOrigem: object.CodOrigem,
      ItemOrigem: object.ItemOrigem,
      CodMotivoCancelamento: object.CodMotivoCancelamento,
      DataCancelamento: object.DataCancelamento,
      HoraCancelamento: object.HoraCancelamento,
      CodUsuarioCancelamento: object.CodUsuarioCancelamento,
      NomeUsuarioCancelamento: object.NomeUsuarioCancelamento,
      ObservacaoCancelamento: object.ObservacaoCancelamento,
    });
  }

  public toJson(): any {
    return {
      CodEmpresa: this.CodEmpresa,
      CodCancelamento: this.CodCancelamento,
      Origem: this.Origem,
      CodOrigem: this.CodOrigem,
      ItemOrigem: this.ItemOrigem,
      CodMotivoCancelamento: this.CodMotivoCancelamento,
      DataCancelamento: this.DataCancelamento,
      HoraCancelamento: this.HoraCancelamento,
      CodUsuarioCancelamento: this.CodUsuarioCancelamento,
      NomeUsuarioCancelamento: this.NomeUsuarioCancelamento,
      ObservacaoCancelamento: this.ObservacaoCancelamento,
    };
  }
}
