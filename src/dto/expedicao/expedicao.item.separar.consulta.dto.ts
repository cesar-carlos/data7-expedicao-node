import ExpedicaoItemSepararUnidadeMedidaConsultaDto from './expedicao.item.separar.unidade.medida.consulta.dto';

export default class ExpedicaoItemSepararConsultaDto {
  CodEmpresa: number;
  CodSepararEstoque: number;
  Item: string;
  Origem: string;
  CodOrigem: number;
  ItemOrigem?: string;
  CodProduto: number;
  NomeProduto: string;
  Ativo: string;
  CodTipoProduto: string;
  CodUnidadeMedida: string;
  NomeUnidadeMedida: string;
  CodGrupoProduto: number;
  NomeGrupoProduto: string;
  CodMarca?: number;
  NomeMarca?: string;
  CodSetorEstoque?: number;
  NomeSetorEstoque?: string;
  NCM?: string;
  CodigoBarras?: string;
  CodigoBarras2?: string;
  CodigoReferencia?: string;
  CodigoFornecedor?: string;
  CodigoFabricante?: string;
  CodigoOriginal?: string;
  Endereco?: string;
  EnderecoDescricao?: string;
  CodLocalArmazenagem: number;
  NomeLocaArmazenagem: string;
  Quantidade: number;
  QuantidadeInterna: number;
  QuantidadeExterna: number;
  QuantidadeSeparacao: number;
  UnidadeMedidas: ExpedicaoItemSepararUnidadeMedidaConsultaDto[];

  constructor(params: {
    CodEmpresa: number;
    CodSepararEstoque: number;
    Item: string;
    Origem: string;
    CodOrigem: number;
    ItemOrigem?: string;
    CodProduto: number;
    NomeProduto: string;
    Ativo: string;
    CodTipoProduto: string;
    CodUnidadeMedida: string;
    NomeUnidadeMedida: string;
    CodGrupoProduto: number;
    NomeGrupoProduto: string;
    CodMarca?: number;
    NomeMarca?: string;
    CodSetorEstoque?: number;
    NomeSetorEstoque?: string;
    NCM?: string;
    CodigoBarras?: string;
    CodigoBarras2?: string;
    CodigoReferencia?: string;
    CodigoFornecedor?: string;
    CodigoFabricante?: string;
    CodigoOriginal?: string;
    Endereco?: string;
    EnderecoDescricao?: string;
    CodLocalArmazenagem: number;
    NomeLocaArmazenagem: string;
    Quantidade: number;
    QuantidadeInterna: number;
    QuantidadeExterna: number;
    QuantidadeSeparacao: number;
    UnidadeMedidas: ExpedicaoItemSepararUnidadeMedidaConsultaDto[] | [];
  }) {
    this.CodEmpresa = params.CodEmpresa;
    this.CodSepararEstoque = params.CodSepararEstoque;
    this.Item = params.Item;
    this.Origem = params.Origem;
    this.CodOrigem = params.CodOrigem;
    this.ItemOrigem = params.ItemOrigem;
    this.CodProduto = params.CodProduto;
    this.NomeProduto = params.NomeProduto;
    this.Ativo = params.Ativo;
    this.CodTipoProduto = params.CodTipoProduto;
    this.CodUnidadeMedida = params.CodUnidadeMedida;
    this.NomeUnidadeMedida = params.NomeUnidadeMedida;
    this.CodGrupoProduto = params.CodGrupoProduto;
    this.NomeGrupoProduto = params.NomeGrupoProduto;
    this.CodMarca = params.CodMarca;
    this.NomeMarca = params.NomeMarca;
    this.CodSetorEstoque = params.CodSetorEstoque;
    this.NomeSetorEstoque = params.NomeSetorEstoque;
    this.NCM = params.NCM;
    this.CodigoBarras = params.CodigoBarras;
    this.CodigoBarras2 = params.CodigoBarras2;
    this.CodigoReferencia = params.CodigoReferencia;
    this.CodigoFornecedor = params.CodigoFornecedor;
    this.CodigoFabricante = params.CodigoFabricante;
    this.CodigoOriginal = params.CodigoOriginal;
    this.Endereco = params.Endereco;
    this.EnderecoDescricao = params.EnderecoDescricao;
    this.CodLocalArmazenagem = params.CodLocalArmazenagem;
    this.NomeLocaArmazenagem = params.NomeLocaArmazenagem;
    this.Quantidade = params.Quantidade;
    this.QuantidadeInterna = params.QuantidadeInterna;
    this.QuantidadeExterna = params.QuantidadeExterna;
    this.QuantidadeSeparacao = params.QuantidadeSeparacao;
    this.UnidadeMedidas = params.UnidadeMedidas || [];
  }

  public copyWith(params: {
    CodEmpresa?: number;
    CodSepararEstoque?: number;
    Item?: string;
    Origem?: string;
    CodOrigem?: number;
    ItemOrigem?: string;
    CodProduto?: number;
    NomeProduto?: string;
    Ativo?: string;
    CodTipoProduto?: string;
    CodUnidadeMedida?: string;
    NomeUnidadeMedida?: string;
    CodGrupoProduto?: number;
    NomeGrupoProduto?: string;
    CodMarca?: number;
    NomeMarca?: string;
    CodSetorEstoque?: number;
    NomeSetorEstoque?: string;
    NCM?: string;
    CodigoBarras?: string;
    CodigoBarras2?: string;
    CodigoReferencia?: string;
    CodigoFornecedor?: string;
    CodigoFabricante?: string;
    CodigoOriginal?: string;
    Endereco?: string;
    EnderecoDescricao?: string;
    CodLocalArmazenagem?: number;
    NomeLocaArmazenagem?: string;
    Quantidade?: number;
    QuantidadeInterna?: number;
    QuantidadeExterna?: number;
    QuantidadeSeparacao?: number;
    UnidadeMedidas?: ExpedicaoItemSepararUnidadeMedidaConsultaDto[];
  }) {
    this.CodEmpresa = params.CodEmpresa ?? this.CodEmpresa;
    this.CodSepararEstoque = params.CodSepararEstoque ?? this.CodSepararEstoque;
    this.Item = params.Item ?? this.Item;
    this.Origem = params.Origem ?? this.Origem;
    this.CodOrigem = params.CodOrigem ?? this.CodOrigem;
    this.ItemOrigem = params.ItemOrigem ?? this.ItemOrigem;
    this.CodProduto = params.CodProduto ?? this.CodProduto;
    this.NomeProduto = params.NomeProduto ?? this.NomeProduto;
    this.Ativo = params.Ativo ?? this.Ativo;
    this.CodTipoProduto = params.CodTipoProduto ?? this.CodTipoProduto;
    this.CodUnidadeMedida = params.CodUnidadeMedida ?? this.CodUnidadeMedida;
    this.NomeUnidadeMedida = params.NomeUnidadeMedida ?? this.NomeUnidadeMedida;
    this.CodGrupoProduto = params.CodGrupoProduto ?? this.CodGrupoProduto;
    this.NomeGrupoProduto = params.NomeGrupoProduto ?? this.NomeGrupoProduto;
    this.CodMarca = params.CodMarca ?? this.CodMarca;
    this.NomeMarca = params.NomeMarca ?? this.NomeMarca;
    this.CodSetorEstoque = params.CodSetorEstoque ?? this.CodSetorEstoque;
    this.NomeSetorEstoque = params.NomeSetorEstoque ?? this.NomeSetorEstoque;
    this.NCM = params.NCM ?? this.NCM;
    this.CodigoBarras = params.CodigoBarras ?? this.CodigoBarras;
    this.CodigoBarras2 = params.CodigoBarras2 ?? this.CodigoBarras2;
    this.CodigoReferencia = params.CodigoReferencia ?? this.CodigoReferencia;
    this.CodigoFornecedor = params.CodigoFornecedor ?? this.CodigoFornecedor;
    this.CodigoFabricante = params.CodigoFabricante ?? this.CodigoFabricante;
    this.CodigoOriginal = params.CodigoOriginal ?? this.CodigoOriginal;
    this.Endereco = params.Endereco ?? this.Endereco;
    this.EnderecoDescricao = params.EnderecoDescricao ?? this.EnderecoDescricao;
    this.CodLocalArmazenagem = params.CodLocalArmazenagem ?? this.CodLocalArmazenagem;
    this.NomeLocaArmazenagem = params.NomeLocaArmazenagem ?? this.NomeLocaArmazenagem;
    this.Quantidade = params.Quantidade ?? this.Quantidade;
    this.QuantidadeInterna = params.QuantidadeInterna ?? this.QuantidadeInterna;
    this.QuantidadeExterna = params.QuantidadeExterna ?? this.QuantidadeExterna;
    this.QuantidadeSeparacao = params.QuantidadeSeparacao ?? this.QuantidadeSeparacao;
    this.UnidadeMedidas = params.UnidadeMedidas ?? this.UnidadeMedidas;
  }

  static fromObject(object: any): ExpedicaoItemSepararConsultaDto {
    return new ExpedicaoItemSepararConsultaDto({
      CodEmpresa: object.CodEmpresa,
      CodSepararEstoque: object.CodSepararEstoque,
      Item: object.Item,
      Origem: object.Origem,
      CodOrigem: object.CodOrigem,
      ItemOrigem: object.ItemOrigem,
      CodProduto: object.CodProduto,
      NomeProduto: object.NomeProduto,
      Ativo: object.Ativo,
      CodTipoProduto: object.CodTipoProduto,
      CodUnidadeMedida: object.CodUnidadeMedida,
      NomeUnidadeMedida: object.NomeUnidadeMedida,
      CodGrupoProduto: object.CodGrupoProduto,
      NomeGrupoProduto: object.NomeGrupoProduto,
      CodMarca: object.CodMarca,
      NomeMarca: object.NomeMarca,
      CodSetorEstoque: object.CodSetorEstoque,
      NomeSetorEstoque: object.NomeSetorEstoque,
      NCM: object.NCM,
      CodigoBarras: object.CodigoBarras,
      CodigoBarras2: object.CodigoBarras2,
      CodigoReferencia: object.CodigoReferencia,
      CodigoFornecedor: object.CodigoFornecedor,
      CodigoFabricante: object.CodigoFabricante,
      CodigoOriginal: object.CodigoOriginal,
      Endereco: object.Endereco,
      EnderecoDescricao: object.EnderecoDescricao,
      CodLocalArmazenagem: object.CodLocalArmazenagem,
      NomeLocaArmazenagem: object.NomeLocaArmazenagem,
      Quantidade: object.Quantidade ?? 0.0,
      QuantidadeInterna: object.QuantidadeInterna ?? 0.0,
      QuantidadeExterna: object.QuantidadeExterna ?? 0.0,
      QuantidadeSeparacao: object.QuantidadeSeparacao ?? 0.0,
      UnidadeMedidas: object.UnidadeMedidas || [],
    });
  }

  public toJson(): any {
    return {
      CodEmpresa: this.CodEmpresa,
      CodSepararEstoque: this.CodSepararEstoque,
      Item: this.Item,
      Origem: this.Origem,
      CodOrigem: this.CodOrigem,
      ItemOrigem: this.ItemOrigem,
      CodProduto: this.CodProduto,
      NomeProduto: this.NomeProduto,
      Ativo: this.Ativo,
      CodTipoProduto: this.CodTipoProduto,
      CodUnidadeMedida: this.CodUnidadeMedida,
      NomeUnidadeMedida: this.NomeUnidadeMedida,
      CodGrupoProduto: this.CodGrupoProduto,
      NomeGrupoProduto: this.NomeGrupoProduto,
      CodMarca: this.CodMarca,
      NomeMarca: this.NomeMarca,
      CodSetorEstoque: this.CodSetorEstoque,
      NomeSetorEstoque: this.NomeSetorEstoque,
      NCM: this.NCM,
      CodigoBarras: this.CodigoBarras,
      CodigoBarras2: this.CodigoBarras2,
      CodigoReferencia: this.CodigoReferencia,
      CodigoFornecedor: this.CodigoFornecedor,
      CodigoFabricante: this.CodigoFabricante,
      CodigoOriginal: this.CodigoOriginal,
      Endereco: this.Endereco,
      EnderecoDescricao: this.EnderecoDescricao,
      CodLocalArmazenagem: this.CodLocalArmazenagem,
      NomeLocaArmazenagem: this.NomeLocaArmazenagem,
      Quantidade: Number(this.Quantidade).toFixed(4),
      QuantidadeInterna: Number(this.QuantidadeInterna).toFixed(4),
      QuantidadeExterna: Number(this.QuantidadeExterna).toFixed(4),
      QuantidadeSeparacao: Number(this.QuantidadeSeparacao).toFixed(4),
      UnidadeMedidas: this.UnidadeMedidas.map((unidadeMedida) => unidadeMedida.toJson()),
    };
  }
}
