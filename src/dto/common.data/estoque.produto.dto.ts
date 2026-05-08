export default class EstoqueProdutoDto {
  CodProduto: number;
  Nome: string;
  Descricao: string;
  Ativo: string;
  CodTipoProduto: string;
  CodUnidadeMedida: string;
  DataCadastro: Date;
  CodGrupoProduto: number;
  CodMarca?: number;
  CodClasseProduto?: string;
  CodConceitoProduto?: string;
  ProdutoComposto: string;
  CodigoReferencia?: string;
  CodigoOriginal?: string;
  CodigoFabricante?: string;
  CodLocalArmazenagem?: number;
  CodSetorEstoque?: number;
  MovimentaEstoque: string;
  OrigemMercadoria: string;
  PontoPedido: number;
  Endereco?: string;
  Pesavel: string;
  PesoBruto: number;
  PesoLiquido: number;
  PossuiNumeroSerie: string;
  ControlaLote: string;
  NCM?: string;
  PermiteVenda: string;
  CodGrupoTributacao?: number;
  PermiteNotaFiscal: string;
  PermiteDesconto: string;
  MargemLucro: number;
  PrecoVenda: number;

  constructor(params: {
    CodProduto: number;
    Nome: string;
    Descricao: string;
    Ativo: string;
    CodTipoProduto: string;
    CodUnidadeMedida: string;
    DataCadastro: Date;
    CodGrupoProduto: number;
    CodMarca?: number;
    CodClasseProduto?: string;
    CodConceitoProduto?: string;
    ProdutoComposto: string;
    CodigoReferencia?: string;
    CodigoOriginal?: string;
    CodigoFabricante?: string;
    CodLocalArmazenagem?: number;
    CodSetorEstoque?: number;
    MovimentaEstoque: string;
    OrigemMercadoria: string;
    PontoPedido: number;
    Endereco?: string;
    Pesavel: string;
    PesoBruto: number;
    PesoLiquido: number;
    PossuiNumeroSerie: string;
    ControlaLote: string;
    NCM?: string;
    PermiteVenda: string;
    CodGrupoTributacao?: number;
    PermiteNotaFiscal: string;
    PermiteDesconto: string;
    MargemLucro: number;
    PrecoVenda: number;
  }) {
    this.CodProduto = params.CodProduto;
    this.Nome = params.Nome;
    this.Descricao = params.Descricao;
    this.Ativo = params.Ativo;
    this.CodTipoProduto = params.CodTipoProduto;
    this.CodUnidadeMedida = params.CodUnidadeMedida;
    this.DataCadastro = params.DataCadastro;
    this.CodGrupoProduto = params.CodGrupoProduto;
    this.CodMarca = params.CodMarca;
    this.CodClasseProduto = params.CodClasseProduto;
    this.CodConceitoProduto = params.CodConceitoProduto;
    this.ProdutoComposto = params.ProdutoComposto;
    this.CodigoReferencia = params.CodigoReferencia;
    this.CodigoOriginal = params.CodigoOriginal;
    this.CodigoFabricante = params.CodigoFabricante;
    this.CodLocalArmazenagem = params.CodLocalArmazenagem;
    this.CodSetorEstoque = params.CodSetorEstoque;
    this.MovimentaEstoque = params.MovimentaEstoque;
    this.OrigemMercadoria = params.OrigemMercadoria;
    this.PontoPedido = params.PontoPedido;
    this.Endereco = params.Endereco;
    this.Pesavel = params.Pesavel;
    this.PesoBruto = params.PesoBruto;
    this.PesoLiquido = params.PesoLiquido;
    this.PossuiNumeroSerie = params.PossuiNumeroSerie;
    this.ControlaLote = params.ControlaLote;
    this.NCM = params.NCM;
    this.PermiteVenda = params.PermiteVenda;
    this.CodGrupoTributacao = params.CodGrupoTributacao;
    this.PermiteNotaFiscal = params.PermiteNotaFiscal;
    this.PermiteDesconto = params.PermiteDesconto;
    this.MargemLucro = params.MargemLucro;
    this.PrecoVenda = params.PrecoVenda;
  }

  public copyWith(params: {
    CodProduto?: number;
    Nome?: string;
    Descricao?: string;
    Ativo?: string;
    CodTipoProduto?: string;
    CodUnidadeMedida?: string;
    DataCadastro?: Date;
    CodGrupoProduto?: number;
    CodMarca?: number;
    CodClasseProduto?: string;
    CodConceitoProduto?: string;
    ProdutoComposto?: string;
    CodigoReferencia?: string;
    CodigoOriginal?: string;
    CodigoFabricante?: string;
    CodLocalArmazenagem?: number;
    CodSetorEstoque?: number;
    MovimentaEstoque?: string;
    OrigemMercadoria?: string;
    PontoPedido?: number;
    Endereco?: string;
    Pesavel?: string;
    PesoBruto?: number;
    PesoLiquido?: number;
    PossuiNumeroSerie?: string;
    ControlaLote?: string;
    NCM?: string;
    PermiteVenda?: string;
    CodGrupoTributacao?: number;
    PermiteNotaFiscal?: string;
    PermiteDesconto?: string;
    MargemLucro?: number;
    PrecoVenda?: number;
  }) {
    return new EstoqueProdutoDto({
      CodProduto: params.CodProduto ?? this.CodProduto,
      Nome: params.Nome ?? this.Nome,
      Descricao: params.Descricao ?? this.Descricao,
      Ativo: params.Ativo ?? this.Ativo,
      CodTipoProduto: params.CodTipoProduto ?? this.CodTipoProduto,
      CodUnidadeMedida: params.CodUnidadeMedida ?? this.CodUnidadeMedida,
      DataCadastro: params.DataCadastro ?? this.DataCadastro,
      CodGrupoProduto: params.CodGrupoProduto ?? this.CodGrupoProduto,
      CodMarca: params.CodMarca ?? this.CodMarca,
      CodClasseProduto: params.CodClasseProduto ?? this.CodClasseProduto,
      CodConceitoProduto: params.CodConceitoProduto ?? this.CodConceitoProduto,
      ProdutoComposto: params.ProdutoComposto ?? this.ProdutoComposto,
      CodigoReferencia: params.CodigoReferencia ?? this.CodigoReferencia,
      CodigoOriginal: params.CodigoOriginal ?? this.CodigoOriginal,
      CodigoFabricante: params.CodigoFabricante ?? this.CodigoFabricante,
      CodLocalArmazenagem: params.CodLocalArmazenagem ?? this.CodLocalArmazenagem,
      CodSetorEstoque: params.CodSetorEstoque ?? this.CodSetorEstoque,
      MovimentaEstoque: params.MovimentaEstoque ?? this.MovimentaEstoque,
      OrigemMercadoria: params.OrigemMercadoria ?? this.OrigemMercadoria,
      PontoPedido: params.PontoPedido ?? this.PontoPedido,
      Endereco: params.Endereco ?? this.Endereco,
      Pesavel: params.Pesavel ?? this.Pesavel,
      PesoBruto: params.PesoBruto ?? this.PesoBruto,
      PesoLiquido: params.PesoLiquido ?? this.PesoLiquido,
      PossuiNumeroSerie: params.PossuiNumeroSerie ?? this.PossuiNumeroSerie,
      ControlaLote: params.ControlaLote ?? this.ControlaLote,
      NCM: params.NCM ?? this.NCM,
      PermiteVenda: params.PermiteVenda ?? this.PermiteVenda,
      CodGrupoTributacao: params.CodGrupoTributacao ?? this.CodGrupoTributacao,
      PermiteNotaFiscal: params.PermiteNotaFiscal ?? this.PermiteNotaFiscal,
      PermiteDesconto: params.PermiteDesconto ?? this.PermiteDesconto,
      MargemLucro: params.MargemLucro ?? this.MargemLucro,
      PrecoVenda: params.PrecoVenda ?? this.PrecoVenda,
    });
  }

  static fromObject(object: any): EstoqueProdutoDto {
    return new EstoqueProdutoDto({
      CodProduto: object.CodProduto,
      Nome: object.Nome,
      Descricao: object.Descricao,
      Ativo: object.Ativo,
      CodTipoProduto: object.CodTipoProduto,
      CodUnidadeMedida: object.CodUnidadeMedida,
      DataCadastro: object.DataCadastro,
      CodGrupoProduto: object.CodGrupoProduto,
      CodMarca: object.CodMarca,
      CodClasseProduto: object.CodClasseProduto,
      CodConceitoProduto: object.CodConceitoProduto,
      ProdutoComposto: object.ProdutoComposto,
      CodigoReferencia: object.CodigoReferencia,
      CodigoOriginal: object.CodigoOriginal,
      CodigoFabricante: object.CodigoFabricante,
      CodLocalArmazenagem: object.CodLocalArmazenagem,
      CodSetorEstoque: object.CodSetorEstoque,
      MovimentaEstoque: object.MovimentaEstoque,
      OrigemMercadoria: object.OrigemMercadoria,
      PontoPedido: object.PontoPedido,
      Endereco: object.Endereco,
      Pesavel: object.Pesavel,
      PesoBruto: object.PesoBruto,
      PesoLiquido: object.PesoLiquido,
      PossuiNumeroSerie: object.PossuiNumeroSerie,
      ControlaLote: object.ControlaLote,
      NCM: object.NCM,
      PermiteVenda: object.PermiteVenda,
      CodGrupoTributacao: object.CodGrupoTributacao,
      PermiteNotaFiscal: object.PermiteNotaFiscal,
      PermiteDesconto: object.PermiteDesconto,
      MargemLucro: object.MargemLucro,
      PrecoVenda: object.PrecoVenda,
    });
  }

  toJson(): any {
    return {
      CodProduto: this.CodProduto,
      Nome: this.Nome,
      Descricao: this.Descricao,
      Ativo: this.Ativo,
      CodTipoProduto: this.CodTipoProduto,
      CodUnidadeMedida: this.CodUnidadeMedida,
      DataCadastro: this.DataCadastro,
      CodGrupoProduto: this.CodGrupoProduto,
      CodMarca: this.CodMarca,
      CodClasseProduto: this.CodClasseProduto,
      CodConceitoProduto: this.CodConceitoProduto,
      ProdutoComposto: this.ProdutoComposto,
      CodigoReferencia: this.CodigoReferencia,
      CodigoOriginal: this.CodigoOriginal,
      CodigoFabricante: this.CodigoFabricante,
      CodLocalArmazenagem: this.CodLocalArmazenagem,
      CodSetorEstoque: this.CodSetorEstoque,
      MovimentaEstoque: this.MovimentaEstoque,
      OrigemMercadoria: this.OrigemMercadoria,
      PontoPedido: this.PontoPedido.toFixed(4),
      Endereco: this.Endereco,
      Pesavel: this.Pesavel,
      PesoBruto: this.PesoBruto.toFixed(4),
      PesoLiquido: this.PesoLiquido.toFixed(4),
      PossuiNumeroSerie: this.PossuiNumeroSerie,
      ControlaLote: this.ControlaLote,
      NCM: this.NCM,
      PermiteVenda: this.PermiteVenda,
      CodGrupoTributacao: this.CodGrupoTributacao,
      PermiteNotaFiscal: this.PermiteNotaFiscal,
      PermiteDesconto: this.PermiteDesconto,
      MargemLucro: this.MargemLucro,
      PrecoVenda: Number(this.PrecoVenda).toFixed(4),
    };
  }
}
