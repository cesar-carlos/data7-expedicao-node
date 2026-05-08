export default class ExpedicaoItemArmazenarConsultaDto {
  CodEmpresa: number;
  CodArmazenar: number;
  Item: string;
  Situacao: string;
  CodcarrinhoPercurso?: number;
  ItemcarrinhoPercurso?: string;
  CodLocalArmazenagem: number;
  CodProduto: number;
  NomeProduto: string;
  CodUnidadeMedida: string;
  NomeUnidadeMedida: string;
  CodProdutoEndereco: string;
  NomeProdutoEndereco: string;
  CodigoBarras?: string;
  Quantidade: number;

  constructor(params: {
    CodEmpresa: number;
    CodArmazenar: number;
    Item: string;
    Situacao: string;
    CodcarrinhoPercurso?: number;
    ItemcarrinhoPercurso?: string;
    CodLocalArmazenagem: number;
    CodProduto: number;
    NomeProduto: string;
    CodUnidadeMedida: string;
    NomeUnidadeMedida: string;
    CodProdutoEndereco: string;
    NomeProdutoEndereco: string;
    CodigoBarras?: string;
    Quantidade: number;
  }) {
    this.CodEmpresa = params.CodEmpresa;
    this.CodArmazenar = params.CodArmazenar;
    this.Item = params.Item;
    this.Situacao = params.Situacao;
    this.CodcarrinhoPercurso = params.CodcarrinhoPercurso;
    this.ItemcarrinhoPercurso = params.ItemcarrinhoPercurso;
    this.CodLocalArmazenagem = params.CodLocalArmazenagem;
    this.CodProduto = params.CodProduto;
    this.NomeProduto = params.NomeProduto;
    this.CodUnidadeMedida = params.CodUnidadeMedida;
    this.NomeUnidadeMedida = params.NomeUnidadeMedida;
    this.CodProdutoEndereco = params.CodProdutoEndereco;
    this.NomeProdutoEndereco = params.NomeProdutoEndereco;
    this.CodigoBarras = params.CodigoBarras;
    this.Quantidade = params.Quantidade;
  }

  public copyWith(params: {
    CodEmpresa?: number;
    CodArmazenar?: number;
    Item?: string;
    Situacao?: string;
    CodcarrinhoPercurso?: number;
    ItemcarrinhoPercurso?: string;
    CodLocalArmazenagem?: number;
    CodProduto?: number;
    NomeProduto?: string;
    CodUnidadeMedida?: string;
    NomeUnidadeMedida?: string;
    CodProdutoEndereco?: string;
    NomeProdutoEndereco?: string;
    CodigoBarras?: string;
    Quantidade?: number;
  }): ExpedicaoItemArmazenarConsultaDto {
    return new ExpedicaoItemArmazenarConsultaDto({
      CodEmpresa: params.CodEmpresa ?? this.CodEmpresa,
      CodArmazenar: params.CodArmazenar ?? this.CodArmazenar,
      Item: params.Item ?? this.Item,
      Situacao: params.Situacao ?? this.Situacao,
      CodcarrinhoPercurso: params.CodcarrinhoPercurso ?? this.CodcarrinhoPercurso,
      ItemcarrinhoPercurso: params.ItemcarrinhoPercurso ?? this.ItemcarrinhoPercurso,
      CodLocalArmazenagem: params.CodLocalArmazenagem ?? this.CodLocalArmazenagem,
      CodProduto: params.CodProduto ?? this.CodProduto,
      NomeProduto: params.NomeProduto ?? this.NomeProduto,
      CodUnidadeMedida: params.CodUnidadeMedida ?? this.CodUnidadeMedida,
      NomeUnidadeMedida: params.NomeUnidadeMedida ?? this.NomeUnidadeMedida,
      CodProdutoEndereco: params.CodProdutoEndereco ?? this.CodProdutoEndereco,
      NomeProdutoEndereco: params.NomeProdutoEndereco ?? this.NomeProdutoEndereco,
      CodigoBarras: params.CodigoBarras ?? this.CodigoBarras,
      Quantidade: params.Quantidade ?? this.Quantidade,
    });
  }

  static fromObject(object: any): ExpedicaoItemArmazenarConsultaDto {
    return new ExpedicaoItemArmazenarConsultaDto({
      CodEmpresa: object.CodEmpresa,
      CodArmazenar: object.CodArmazenar,
      Item: object.Item,
      Situacao: object.Situacao,
      CodcarrinhoPercurso: object.CodcarrinhoPercurso,
      ItemcarrinhoPercurso: object.ItemcarrinhoPercurso,
      CodLocalArmazenagem: object.CodLocalArmazenagem,
      CodProduto: object.CodProduto,
      NomeProduto: object.NomeProduto,
      CodUnidadeMedida: object.CodUnidadeMedida,
      NomeUnidadeMedida: object.NomeUnidadeMedida,
      CodProdutoEndereco: object.CodProdutoEndereco,
      NomeProdutoEndereco: object.NomeProdutoEndereco,
      CodigoBarras: object.CodigoBarras,
      Quantidade: object.Quantidade,
    });
  }

  toJson(): any {
    return {
      CodEmpresa: this.CodEmpresa,
      CodArmazenar: this.CodArmazenar,
      Item: this.Item,
      Situacao: this.Situacao,
      CodcarrinhoPercurso: this.CodcarrinhoPercurso,
      ItemcarrinhoPercurso: this.ItemcarrinhoPercurso,
      CodLocalArmazenagem: this.CodLocalArmazenagem,
      CodProduto: this.CodProduto,
      NomeProduto: this.NomeProduto,
      CodUnidadeMedida: this.CodUnidadeMedida,
      NomeUnidadeMedida: this.NomeUnidadeMedida,
      CodProdutoEndereco: this.CodProdutoEndereco,
      NomeProdutoEndereco: this.NomeProdutoEndereco,
      CodigoBarras: this.CodigoBarras,
      Quantidade: Number(this.Quantidade).toFixed(4),
    };
  }
}
