export default class EstoqueConversaoUnidadeDto {
  CodProduto: number;
  Item: string;
  CodUnidadeMedida: string;
  UnidadeMedidaPadrao: string;
  TipoFatorConversao: string;
  FatorConversao: number;
  CodigoBarras?: string;
  PrecoVenda?: number;
  PrecoVenda2?: number;
  PrecoVenda3?: number;
  PrecoVenda4?: number;
  PrecoVenda5?: number;
  Observacao?: number;

  constructor(params: {
    CodProduto: number;
    Item: string;
    CodUnidadeMedida: string;
    UnidadeMedidaPadrao: string;
    TipoFatorConversao: string;
    FatorConversao: number;
    CodigoBarras?: string;
    PrecoVenda?: number;
    PrecoVenda2?: number;
    PrecoVenda3?: number;
    PrecoVenda4?: number;
    PrecoVenda5?: number;
    Observacao?: number;
  }) {
    this.CodProduto = params.CodProduto;
    this.Item = params.Item;
    this.CodUnidadeMedida = params.CodUnidadeMedida;
    this.UnidadeMedidaPadrao = params.UnidadeMedidaPadrao;
    this.TipoFatorConversao = params.TipoFatorConversao;
    this.FatorConversao = params.FatorConversao;
    this.CodigoBarras = params.CodigoBarras;
    this.PrecoVenda = params.PrecoVenda ?? 0.0;
    this.PrecoVenda2 = params.PrecoVenda2 ?? 0.0;
    this.PrecoVenda3 = params.PrecoVenda3 ?? 0.0;
    this.PrecoVenda4 = params.PrecoVenda4 ?? 0.0;
    this.PrecoVenda5 = params.PrecoVenda5 ?? 0.0;
    this.Observacao = params.Observacao;
  }

  public copyWith(params: {
    CodProduto?: number;
    Item?: string;
    CodUnidadeMedida?: string;
    UnidadeMedidaPadrao?: string;
    TipoFatorConversao?: string;
    FatorConversao?: number;
    CodigoBarras?: string;
    PrecoVenda?: number;
    PrecoVenda2?: number;
    PrecoVenda3?: number;
    PrecoVenda4?: number;
    PrecoVenda5?: number;
    Observacao?: number;
  }) {
    return new EstoqueConversaoUnidadeDto({
      CodProduto: params.CodProduto ?? this.CodProduto,
      Item: params.Item ?? this.Item,
      CodUnidadeMedida: params.CodUnidadeMedida ?? this.CodUnidadeMedida,
      UnidadeMedidaPadrao: params.UnidadeMedidaPadrao ?? this.UnidadeMedidaPadrao,
      TipoFatorConversao: params.TipoFatorConversao ?? this.TipoFatorConversao,
      FatorConversao: params.FatorConversao ?? this.FatorConversao,
      CodigoBarras: params.CodigoBarras ?? this.CodigoBarras,
      PrecoVenda: params.PrecoVenda ?? this.PrecoVenda,
      PrecoVenda2: params.PrecoVenda2 ?? this.PrecoVenda2,
      PrecoVenda3: params.PrecoVenda3 ?? this.PrecoVenda3,
      PrecoVenda4: params.PrecoVenda4 ?? this.PrecoVenda4,
      PrecoVenda5: params.PrecoVenda5 ?? this.PrecoVenda5,
      Observacao: params.Observacao ?? this.Observacao,
    });
  }

  static fromObject(object: any): EstoqueConversaoUnidadeDto {
    return new EstoqueConversaoUnidadeDto({
      CodProduto: object.CodProduto,
      Item: object.Item,
      CodUnidadeMedida: object.CodUnidadeMedida,
      UnidadeMedidaPadrao: object.UnidadeMedidaPadrao,
      TipoFatorConversao: object.TipoFatorConversao,
      FatorConversao: object.FatorConversao,
      CodigoBarras: object.CodigoBarras,
      PrecoVenda: object.PrecoVenda ?? 0.0,
      PrecoVenda2: object.PrecoVenda2 ?? 0.0,
      PrecoVenda3: object.PrecoVenda3 ?? 0.0,
      PrecoVenda4: object.PrecoVenda4 ?? 0.0,
      PrecoVenda5: object.PrecoVenda5 ?? 0.0,
      Observacao: object.Observacao,
    });
  }

  toJson(): any {
    return {
      CodProduto: this.CodProduto,
      Item: this.Item,
      CodUnidadeMedida: this.CodUnidadeMedida,
      UnidadeMedidaPadrao: this.UnidadeMedidaPadrao,
      TipoFatorConversao: this.TipoFatorConversao,
      FatorConversao: Number(this.FatorConversao).toFixed(4),
      CodigoBarras: this.CodigoBarras,
      PrecoVenda: Number(this.PrecoVenda).toFixed(4),
      PrecoVenda2: Number(this.PrecoVenda2).toFixed(4),
      PrecoVenda3: Number(this.PrecoVenda3).toFixed(4),
      PrecoVenda4: Number(this.PrecoVenda4).toFixed(4),
      PrecoVenda5: Number(this.PrecoVenda5).toFixed(4),
      Observacao: this.Observacao,
    };
  }
}
