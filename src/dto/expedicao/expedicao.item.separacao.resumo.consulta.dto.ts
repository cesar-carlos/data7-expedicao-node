export default class ExpedicaoItemSeparacaoResumoConsultaDto {
  CodEmpresa: number;
  CodSepararEstoque: number;
  Origem: String;
  CodOrigem: number;
  Situacao: string;
  CodCarrinhoPercurso: number;
  ItemCarrinhoPercurso: string;
  CodCarrinho: number;
  DescricaoCarrinho: string;
  CodLocalArmazenagem: number;
  CodProduto: number;
  NomeProduto: string;
  CodUnidadeMedida: string;
  DescricaoUnidadeMedida: string;
  CodigoBarras?: string;
  CodProdutoEndereco?: string;
  DescricaoProdutoEndereco?: string;
  Quantidade: number;

  constructor(params: {
    CodEmpresa: number;
    CodSepararEstoque: number;
    Origem: String;
    CodOrigem: number;
    Situacao: string;
    CodCarrinhoPercurso: number;
    ItemCarrinhoPercurso: string;
    CodCarrinho: number;
    DescricaoCarrinho: string;
    CodLocalArmazenagem: number;
    CodProduto: number;
    NomeProduto: string;
    CodUnidadeMedida: string;
    DescricaoUnidadeMedida: string;
    CodigoBarras?: string;
    CodProdutoEndereco?: string;
    DescricaoProdutoEndereco?: string;
    Quantidade: number;
  }) {
    this.CodEmpresa = params.CodEmpresa;
    this.CodSepararEstoque = params.CodSepararEstoque;
    this.Origem = params.Origem;
    this.CodOrigem = params.CodOrigem;
    this.Situacao = params.Situacao;
    this.CodCarrinhoPercurso = params.CodCarrinhoPercurso;
    this.ItemCarrinhoPercurso = params.ItemCarrinhoPercurso;
    this.CodCarrinho = params.CodCarrinho;
    this.DescricaoCarrinho = params.DescricaoCarrinho;
    this.CodLocalArmazenagem = params.CodLocalArmazenagem;
    this.CodProduto = params.CodProduto;
    this.NomeProduto = params.NomeProduto;
    this.CodUnidadeMedida = params.CodUnidadeMedida;
    this.DescricaoUnidadeMedida = params.DescricaoUnidadeMedida;
    this.CodigoBarras = params.CodigoBarras;
    this.CodProdutoEndereco = params.CodProdutoEndereco;
    this.DescricaoProdutoEndereco = params.DescricaoProdutoEndereco;
    this.Quantidade = params.Quantidade;
  }

  public copyWith(params: {
    CodEmpresa?: number;
    CodSepararEstoque?: number;
    Origem?: String;
    CodOrigem?: number;
    Situacao?: string;
    CodCarrinhoPercurso?: number;
    ItemCarrinhoPercurso?: string;
    CodCarrinho?: number;
    DescricaoCarrinho?: string;
    CodLocalArmazenagem?: number;
    CodProduto?: number;
    NomeProduto?: string;
    CodUnidadeMedida?: string;
    DescricaoUnidadeMedida?: string;
    CodigoBarras?: string;
    CodProdutoEndereco?: string;
    DescricaoProdutoEndereco?: string;
    Quantidade?: number;
  }): ExpedicaoItemSeparacaoResumoConsultaDto {
    return new ExpedicaoItemSeparacaoResumoConsultaDto({
      CodEmpresa: params.CodEmpresa ?? this.CodEmpresa,
      CodSepararEstoque: params.CodSepararEstoque ?? this.CodSepararEstoque,
      Origem: params.Origem ?? this.Origem,
      CodOrigem: params.CodOrigem ?? this.CodOrigem,
      Situacao: params.Situacao ?? this.Situacao,
      CodCarrinhoPercurso: params.CodCarrinhoPercurso ?? this.CodCarrinhoPercurso,
      ItemCarrinhoPercurso: params.ItemCarrinhoPercurso ?? this.ItemCarrinhoPercurso,
      CodCarrinho: params.CodCarrinho ?? this.CodCarrinho,
      DescricaoCarrinho: params.DescricaoCarrinho ?? this.DescricaoCarrinho,
      CodLocalArmazenagem: params.CodLocalArmazenagem ?? this.CodLocalArmazenagem,
      CodProduto: params.CodProduto ?? this.CodProduto,
      NomeProduto: params.NomeProduto ?? this.NomeProduto,
      CodUnidadeMedida: params.CodUnidadeMedida ?? this.CodUnidadeMedida,
      DescricaoUnidadeMedida: params.DescricaoUnidadeMedida ?? this.DescricaoUnidadeMedida,
      CodigoBarras: params.CodigoBarras ?? this.CodigoBarras,
      CodProdutoEndereco: params.CodProdutoEndereco ?? this.CodProdutoEndereco,
      DescricaoProdutoEndereco: params.DescricaoProdutoEndereco ?? this.DescricaoProdutoEndereco,
      Quantidade: params.Quantidade ?? this.Quantidade,
    });
  }

  public static fromObject(object: any): ExpedicaoItemSeparacaoResumoConsultaDto {
    return new ExpedicaoItemSeparacaoResumoConsultaDto({
      CodEmpresa: object.CodEmpresa,
      CodSepararEstoque: object.CodSepararEstoque,
      Origem: object.Origem,
      CodOrigem: object.CodOrigem,
      Situacao: object.Situacao,
      CodCarrinhoPercurso: object.CodCarrinhoPercurso,
      ItemCarrinhoPercurso: object.ItemCarrinhoPercurso,
      CodCarrinho: object.CodCarrinho,
      DescricaoCarrinho: object.DescricaoCarrinho,
      CodLocalArmazenagem: object.CodLocalArmazenagem,
      CodProduto: object.CodProduto,
      NomeProduto: object.NomeProduto,
      CodUnidadeMedida: object.CodUnidadeMedida,
      DescricaoUnidadeMedida: object.DescricaoUnidadeMedida,
      CodigoBarras: object.CodigoBarras,
      CodProdutoEndereco: object.CodProdutoEndereco,
      DescricaoProdutoEndereco: object.DescricaoProdutoEndereco,
      Quantidade: object.Quantidade,
    });
  }

  public toJson(): any {
    return {
      CodEmpresa: this.CodEmpresa,
      CodSepararEstoque: this.CodSepararEstoque,
      Origem: this.Origem,
      CodOrigem: this.CodOrigem,
      Situacao: this.Situacao,
      CodCarrinhoPercurso: this.CodCarrinhoPercurso,
      ItemCarrinhoPercurso: this.ItemCarrinhoPercurso,
      CodCarrinho: this.CodCarrinho,
      DescricaoCarrinho: this.DescricaoCarrinho,
      CodLocalArmazenagem: this.CodLocalArmazenagem,
      CodProduto: this.CodProduto,
      NomeProduto: this.NomeProduto,
      CodUnidadeMedida: this.CodUnidadeMedida,
      DescricaoUnidadeMedida: this.DescricaoUnidadeMedida,
      CodigoBarras: this.CodigoBarras,
      CodProdutoEndereco: this.CodProdutoEndereco,
      DescricaoProdutoEndereco: this.DescricaoProdutoEndereco,
      Quantidade: Number(this.Quantidade).toFixed(4),
    };
  }
}
