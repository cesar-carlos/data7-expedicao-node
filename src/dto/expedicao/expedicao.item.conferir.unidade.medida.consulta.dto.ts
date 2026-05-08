export default class ExpedicaoItemConferirUnidadeMedidaConsultaDto {
  CodEmpresa: number;
  CodConferir: number;
  Item: string;
  CodProduto: number;
  ItemUnidadeMedida: string;
  CodUnidadeMedida: string;
  UnidadeMedidaDescricao: string;
  UnidadeMedidaPadrao: string;
  TipoFatorConversao: string;
  FatorConversao: number;
  CodigoBarras?: string;
  Observacao?: number;

  constructor(params: {
    CodEmpresa: number;
    CodConferir: number;
    Item: string;
    CodProduto: number;
    ItemUnidadeMedida: string;
    CodUnidadeMedida: string;
    UnidadeMedidaDescricao: string;
    UnidadeMedidaPadrao: string;
    TipoFatorConversao: string;
    FatorConversao: number;
    CodigoBarras?: string;
    Observacao?: number;
  }) {
    this.CodEmpresa = params.CodEmpresa;
    this.CodConferir = params.CodConferir;
    this.Item = params.Item;
    this.CodProduto = params.CodProduto;
    this.ItemUnidadeMedida = params.ItemUnidadeMedida;
    this.CodUnidadeMedida = params.CodUnidadeMedida;
    this.UnidadeMedidaDescricao = params.UnidadeMedidaDescricao;
    this.UnidadeMedidaPadrao = params.UnidadeMedidaPadrao;
    this.TipoFatorConversao = params.TipoFatorConversao;
    this.FatorConversao = params.FatorConversao;
    this.CodigoBarras = params.CodigoBarras;
    this.Observacao = params.Observacao;
  }

  public copyWith(params: {
    CodEmpresa?: number;
    CodConferir?: number;
    Item?: string;
    CodProduto?: number;
    ItemUnidadeMedida?: string;
    CodUnidadeMedida?: string;
    UnidadeMedidaDescricao?: string;
    UnidadeMedidaPadrao?: string;
    TipoFatorConversao?: string;
    FatorConversao?: number;
    CodigoBarras?: string;
    Observacao?: number;
  }) {
    return new ExpedicaoItemConferirUnidadeMedidaConsultaDto({
      CodEmpresa: params.CodEmpresa ?? this.CodEmpresa,
      CodConferir: params.CodConferir ?? this.CodConferir,
      Item: params.Item ?? this.Item,
      CodProduto: params.CodProduto ?? this.CodProduto,
      ItemUnidadeMedida: params.ItemUnidadeMedida ?? this.ItemUnidadeMedida,
      CodUnidadeMedida: params.CodUnidadeMedida ?? this.CodUnidadeMedida,
      UnidadeMedidaDescricao: params.UnidadeMedidaDescricao ?? this.UnidadeMedidaDescricao,
      UnidadeMedidaPadrao: params.UnidadeMedidaPadrao ?? this.UnidadeMedidaPadrao,
      TipoFatorConversao: params.TipoFatorConversao ?? this.TipoFatorConversao,
      FatorConversao: params.FatorConversao ?? this.FatorConversao,
      CodigoBarras: params.CodigoBarras ?? this.CodigoBarras,
      Observacao: params.Observacao ?? this.Observacao,
    });
  }

  static fromObject(object: any): ExpedicaoItemConferirUnidadeMedidaConsultaDto {
    return new ExpedicaoItemConferirUnidadeMedidaConsultaDto({
      CodEmpresa: object.CodEmpresa,
      CodConferir: object.CodConferir,
      Item: object.Item,
      CodProduto: object.CodProduto,
      ItemUnidadeMedida: object.ItemUnidadeMedida,
      CodUnidadeMedida: object.CodUnidadeMedida,
      UnidadeMedidaDescricao: object.UnidadeMedidaDescricao,
      UnidadeMedidaPadrao: object.UnidadeMedidaPadrao,
      TipoFatorConversao: object.TipoFatorConversao,
      FatorConversao: object.FatorConversao,
      CodigoBarras: object.CodigoBarras,
      Observacao: object.Observacao,
    });
  }

  toJson(): any {
    return {
      CodEmpresa: this.CodEmpresa,
      CodConferir: this.CodConferir,
      Item: this.Item,
      CodProduto: this.CodProduto,
      ItemUnidadeMedida: this.ItemUnidadeMedida,
      CodUnidadeMedida: this.CodUnidadeMedida,
      UnidadeMedidaDescricao: this.UnidadeMedidaDescricao,
      UnidadeMedidaPadrao: this.UnidadeMedidaPadrao,
      TipoFatorConversao: this.TipoFatorConversao,
      FatorConversao: Number(this.FatorConversao).toFixed(4),
      CodigoBarras: this.CodigoBarras,
      Observacao: this.Observacao,
    };
  }
}
