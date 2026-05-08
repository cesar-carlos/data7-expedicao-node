import ExpedicaoItemConferenciaConsultaDto from './expedicao.item.conferencia.consulta.dto';

export default class ExpedicaoItemConferenciaDto {
  CodEmpresa: number;
  CodConferir: number;
  Item: string;
  SessionId: string;
  Situacao: string;
  CodCarrinhoPercurso: number;
  ItemCarrinhoPercurso: string;
  CodConferente: number;
  NomeConferente: string;
  DataConferencia: Date;
  HoraConferencia: string;
  CodProduto: number;
  CodUnidadeMedida: string;
  Quantidade: number;

  constructor(params: {
    CodEmpresa: number;
    CodConferir: number;
    Item: string;
    SessionId: string;
    Situacao: string;
    CodCarrinhoPercurso: number;
    ItemCarrinhoPercurso: string;
    CodConferente: number;
    NomeConferente: string;
    DataConferencia: Date;
    HoraConferencia: string;
    CodProduto: number;
    CodUnidadeMedida: string;
    Quantidade: number;
  }) {
    this.CodEmpresa = params.CodEmpresa;
    this.CodConferir = params.CodConferir;
    this.Item = params.Item;
    this.SessionId = params.SessionId;
    this.Situacao = params.Situacao;
    this.CodCarrinhoPercurso = params.CodCarrinhoPercurso;
    this.ItemCarrinhoPercurso = params.ItemCarrinhoPercurso;
    this.CodConferente = params.CodConferente;
    this.NomeConferente = params.NomeConferente;
    this.DataConferencia = params.DataConferencia;
    this.HoraConferencia = params.HoraConferencia;
    this.CodProduto = params.CodProduto;
    this.CodUnidadeMedida = params.CodUnidadeMedida;
    this.Quantidade = params.Quantidade;
  }

  public copyWith(params: {
    CodEmpresa?: number;
    CodConferir?: number;
    Item?: string;
    SessionId?: string;
    Situacao?: string;
    CodCarrinhoPercurso?: number;
    ItemCarrinhoPercurso?: string;
    CodConferente?: number;
    NomeConferente?: string;
    DataConferencia?: Date;
    HoraConferencia?: string;
    CodProduto?: number;
    CodUnidadeMedida?: string;
    Quantidade?: number;
  }) {
    return new ExpedicaoItemConferenciaDto({
      CodEmpresa: params.CodEmpresa ?? this.CodEmpresa,
      CodConferir: params.CodConferir ?? this.CodConferir,
      Item: params.Item ?? this.Item,
      SessionId: params.SessionId ?? this.SessionId,
      Situacao: params.Situacao ?? this.Situacao,
      CodCarrinhoPercurso: params.CodCarrinhoPercurso ?? this.CodCarrinhoPercurso,
      ItemCarrinhoPercurso: params.ItemCarrinhoPercurso ?? this.ItemCarrinhoPercurso,
      CodConferente: params.CodConferente ?? this.CodConferente,
      NomeConferente: params.NomeConferente ?? this.NomeConferente,
      DataConferencia: params.DataConferencia ?? this.DataConferencia,
      HoraConferencia: params.HoraConferencia ?? this.HoraConferencia,
      CodProduto: params.CodProduto ?? this.CodProduto,
      CodUnidadeMedida: params.CodUnidadeMedida ?? this.CodUnidadeMedida,
      Quantidade: params.Quantidade ?? this.Quantidade,
    });
  }

  static fromConsulta(item: ExpedicaoItemConferenciaConsultaDto): ExpedicaoItemConferenciaDto {
    return new ExpedicaoItemConferenciaDto({
      CodEmpresa: item.CodEmpresa,
      CodConferir: item.CodConferir,
      Item: item.Item,
      SessionId: item.SessionId,
      Situacao: item.Situacao,
      CodCarrinhoPercurso: item.CodCarrinhoPercurso,
      ItemCarrinhoPercurso: item.ItemCarrinhoPercurso,
      CodConferente: item.CodConferente,
      NomeConferente: item.NomeConferente,
      DataConferencia: item.DataConferencia,
      HoraConferencia: item.HoraConferencia,
      CodProduto: item.CodProduto,
      CodUnidadeMedida: item.CodUnidadeMedida,
      Quantidade: item.Quantidade,
    });
  }

  static fromObject(object: any): ExpedicaoItemConferenciaDto {
    return new ExpedicaoItemConferenciaDto({
      CodEmpresa: object.CodEmpresa,
      CodConferir: object.CodConferir,
      Item: object.Item,
      SessionId: object.SessionId,
      Situacao: object.Situacao,
      CodCarrinhoPercurso: object.CodCarrinhoPercurso,
      ItemCarrinhoPercurso: object.ItemCarrinhoPercurso,
      CodConferente: object.CodConferente,
      NomeConferente: object.NomeConferente,
      DataConferencia: object.DataConferencia,
      HoraConferencia: object.HoraConferencia,
      CodProduto: object.CodProduto,
      CodUnidadeMedida: object.CodUnidadeMedida,
      Quantidade: object.Quantidade,
    });
  }

  public toJson(): any {
    return {
      CodEmpresa: this.CodEmpresa,
      CodConferir: this.CodConferir,
      Item: this.Item,
      SessionId: this.SessionId,
      Situacao: this.Situacao,
      CodCarrinhoPercurso: this.CodCarrinhoPercurso,
      ItemCarrinhoPercurso: this.ItemCarrinhoPercurso,
      CodConferente: this.CodConferente,
      NomeConferente: this.NomeConferente,
      DataConferencia: this.DataConferencia,
      HoraConferencia: this.HoraConferencia,
      CodProduto: this.CodProduto,
      CodUnidadeMedida: this.CodUnidadeMedida,
      Quantidade: Number(this.Quantidade).toFixed(4),
    };
  }
}
