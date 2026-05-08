export default class ExpedicaoItemSeparacaoDto {
  CodEmpresa: number;
  CodSepararEstoque: number;
  Item: string;
  SessionId: string;
  Situacao: string;
  CodCarrinhoPercurso: number;
  ItemCarrinhoPercurso: string;
  CodSeparador: number;
  NomeSeparador: string;
  DataSeparacao: Date;
  HoraSeparacao: string;
  CodProduto: number;
  CodUnidadeMedida: string;
  Quantidade: number;

  constructor(params: {
    CodEmpresa: number;
    CodSepararEstoque: number;
    Item: string;
    SessionId: string;
    Situacao: string;
    CodCarrinhoPercurso: number;
    ItemCarrinhoPercurso: string;
    CodSeparador: number;
    NomeSeparador: string;
    DataSeparacao: Date;
    HoraSeparacao: string;
    CodProduto: number;
    CodUnidadeMedida: string;
    Quantidade: number;
  }) {
    this.CodEmpresa = params.CodEmpresa;
    this.CodSepararEstoque = params.CodSepararEstoque;
    this.Item = params.Item;
    this.SessionId = params.SessionId;
    this.Situacao = params.Situacao;
    this.CodCarrinhoPercurso = params.CodCarrinhoPercurso;
    this.ItemCarrinhoPercurso = params.ItemCarrinhoPercurso;
    this.CodSeparador = params.CodSeparador;
    this.NomeSeparador = params.NomeSeparador;
    this.DataSeparacao = params.DataSeparacao;
    this.HoraSeparacao = params.HoraSeparacao;
    this.CodProduto = params.CodProduto;
    this.CodUnidadeMedida = params.CodUnidadeMedida;
    this.Quantidade = params.Quantidade;
  }

  public copyWith({
    CodEmpresa,
    CodSepararEstoque,
    Item,
    SessionId,
    Situacao,
    CodCarrinhoPercurso,
    ItemCarrinhoPercurso,
    CodSeparador,
    NomeSeparador,
    DataSeparacao,
    HoraSeparacao,
    CodProduto,
    CodUnidadeMedida,
    Quantidade,
  }: {
    CodEmpresa?: number;
    CodSepararEstoque?: number;
    Item: string;
    SessionId?: string;
    Situacao?: string;
    CodCarrinhoPercurso?: number;
    ItemCarrinhoPercurso?: string;
    CodSeparador?: number;
    NomeSeparador?: string;
    DataSeparacao?: Date;
    HoraSeparacao?: string;
    CodProduto?: number;
    CodUnidadeMedida?: string;
    Quantidade?: number;
  }) {
    return new ExpedicaoItemSeparacaoDto({
      CodEmpresa: CodEmpresa ?? this.CodEmpresa,
      CodSepararEstoque: CodSepararEstoque ?? this.CodSepararEstoque,
      Item: Item ?? this.Item,
      SessionId: SessionId ?? this.SessionId,
      Situacao: Situacao ?? this.Situacao,
      CodCarrinhoPercurso: CodCarrinhoPercurso ?? this.CodCarrinhoPercurso,
      ItemCarrinhoPercurso: ItemCarrinhoPercurso ?? this.ItemCarrinhoPercurso,
      CodSeparador: CodSeparador ?? this.CodSeparador,
      NomeSeparador: NomeSeparador ?? this.NomeSeparador,
      DataSeparacao: DataSeparacao ?? this.DataSeparacao,
      HoraSeparacao: HoraSeparacao ?? this.HoraSeparacao,
      CodProduto: CodProduto ?? this.CodProduto,
      CodUnidadeMedida: CodUnidadeMedida ?? this.CodUnidadeMedida,
      Quantidade: Quantidade ?? this.Quantidade,
    });
  }

  static fromObject(object: any): ExpedicaoItemSeparacaoDto {
    return new ExpedicaoItemSeparacaoDto({
      CodEmpresa: object.CodEmpresa,
      CodSepararEstoque: object.CodSepararEstoque,
      Item: object.Item,
      SessionId: object.SessionId,
      Situacao: object.Situacao,
      CodCarrinhoPercurso: object.CodCarrinhoPercurso,
      ItemCarrinhoPercurso: object.ItemCarrinhoPercurso,
      CodSeparador: object.CodSeparador,
      NomeSeparador: object.NomeSeparador,
      DataSeparacao: object.DataSeparacao,
      HoraSeparacao: object.HoraSeparacao,
      CodProduto: object.CodProduto,
      CodUnidadeMedida: object.CodUnidadeMedida,
      Quantidade: object.Quantidade,
    });
  }

  public toJson(): any {
    return {
      CodEmpresa: this.CodEmpresa,
      CodSepararEstoque: this.CodSepararEstoque,
      Item: this.Item,
      SessionId: this.SessionId,
      Situacao: this.Situacao,
      CodCarrinhoPercurso: this.CodCarrinhoPercurso,
      ItemCarrinhoPercurso: this.ItemCarrinhoPercurso,
      CodSeparador: this.CodSeparador,
      NomeSeparador: this.NomeSeparador,
      DataSeparacao: this.DataSeparacao,
      HoraSeparacao: this.HoraSeparacao,
      CodProduto: this.CodProduto,
      CodUnidadeMedida: this.CodUnidadeMedida,
      Quantidade: Number(this.Quantidade).toFixed(4),
    };
  }
}
