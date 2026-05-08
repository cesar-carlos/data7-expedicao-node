export default class ExpedicaoItemImpressoConsultaDto {
  CodEmpresa: number;
  CodSepararEstoque: number;
  Item: string;
  Origem: string | null;
  CodOrigem: number | null;
  ItemOrigem: string | null;
  CodProdutoVendido: number | null;
  DataSepararEstoque: Date;
  HoraSepararEstoque: string;
  Situacao: string;
  CodTipoOperacaoSaida: number | null;
  DescricaoTipoOperacaoSaida: string | null;
  CodVendedor: number | null;
  NomeVendedor: string | null;
  TipoEntidade: string;
  CodEntidade: string;
  NomeEntidade: string;
  CodPrioridade: number;
  DescricaoPrioridade: string;
  CodCliente: number | null;
  NomeCliente: string | null;
  NomeFantasiaCliente: string | null;
  CodTransportadora: number | null;
  NomeFantasiaTransportadora: string | null;
  RazaoSocialTransportadora: string | null;
  CodMunicipioEntrega: number | null;
  NomeMunicipioEntrega: string | null;
  CodLocalArmazenagem: number;
  NomeLocalArmazenagem: string;
  CodSetorEstoque: number | null;
  DescricaoSetorEstoque: string | null;
  CodProduto: number;
  NomeProduto: string;
  DescricaoProduto: string | null;
  CodGrupoProduto: number | null;
  NomeGrupoProduto: string | null;
  CodMarca: number | null;
  NomeMarca: string | null;
  CodigoFabricante: string | null;
  CodigoFornecedor: string | null;
  CodigoReferencia: string | null;
  CodigoBarras: string | null;
  DescricaoEnderecoProduto: string | null;
  CodUnidadeMedida: string;
  DescricaoUnidadeMedida: string;
  Quantidade: number;
  QuantidadeInterna: number;
  QuantidadeExterna: number;
  QuantidadeSeparacao: number;
  HistoricoSepararEstoque: string | null;
  ObservacaoSepararEstoque: string | null;
  OrcamentoObservacao: string | null;

  constructor(params: {
    CodEmpresa: number;
    CodSepararEstoque: number;
    Item: string;
    Origem: string | null;
    CodOrigem: number | null;
    ItemOrigem: string | null;
    CodProdutoVendido: number | null;
    DataSepararEstoque: Date;
    HoraSepararEstoque: string;
    Situacao: string;
    CodTipoOperacaoSaida: number | null;
    DescricaoTipoOperacaoSaida: string | null;
    CodVendedor: number | null;
    NomeVendedor: string | null;
    TipoEntidade: string;
    CodEntidade: string;
    NomeEntidade: string;
    CodPrioridade: number;
    DescricaoPrioridade: string;
    CodCliente: number | null;
    NomeCliente: string | null;
    NomeFantasiaCliente: string | null;
    CodTransportadora: number | null;
    NomeFantasiaTransportadora: string | null;
    RazaoSocialTransportadora: string | null;
    CodMunicipioEntrega: number | null;
    NomeMunicipioEntrega: string | null;
    CodLocalArmazenagem: number;
    NomeLocalArmazenagem: string;
    CodSetorEstoque: number | null;
    DescricaoSetorEstoque: string | null;
    CodProduto: number;
    NomeProduto: string;
    DescricaoProduto: string | null;
    CodGrupoProduto: number | null;
    NomeGrupoProduto: string | null;
    CodMarca: number | null;
    NomeMarca: string | null;
    CodigoFabricante: string | null;
    CodigoFornecedor: string | null;
    CodigoReferencia: string | null;
    CodigoBarras: string | null;
    DescricaoEnderecoProduto: string | null;
    CodUnidadeMedida: string;
    DescricaoUnidadeMedida: string;
    Quantidade: number;
    QuantidadeInterna: number;
    QuantidadeExterna: number;
    QuantidadeSeparacao: number;
    HistoricoSepararEstoque: string | null;
    ObservacaoSepararEstoque: string | null;
    OrcamentoObservacao: string | null;
  }) {
    this.CodEmpresa = params.CodEmpresa;
    this.CodSepararEstoque = params.CodSepararEstoque;
    this.Item = params.Item;
    this.Origem = params.Origem;
    this.CodOrigem = params.CodOrigem;
    this.ItemOrigem = params.ItemOrigem;
    this.CodProdutoVendido = params.CodProdutoVendido;
    this.DataSepararEstoque = params.DataSepararEstoque;
    this.HoraSepararEstoque = params.HoraSepararEstoque;
    this.Situacao = params.Situacao;
    this.CodTipoOperacaoSaida = params.CodTipoOperacaoSaida;
    this.DescricaoTipoOperacaoSaida = params.DescricaoTipoOperacaoSaida;
    this.CodVendedor = params.CodVendedor;
    this.NomeVendedor = params.NomeVendedor;
    this.TipoEntidade = params.TipoEntidade;
    this.CodEntidade = params.CodEntidade;
    this.NomeEntidade = params.NomeEntidade;
    this.CodPrioridade = params.CodPrioridade;
    this.DescricaoPrioridade = params.DescricaoPrioridade;
    this.CodCliente = params.CodCliente;
    this.NomeCliente = params.NomeCliente;
    this.NomeFantasiaCliente = params.NomeFantasiaCliente;
    this.CodTransportadora = params.CodTransportadora;
    this.NomeFantasiaTransportadora = params.NomeFantasiaTransportadora;
    this.RazaoSocialTransportadora = params.RazaoSocialTransportadora;
    this.CodMunicipioEntrega = params.CodMunicipioEntrega;
    this.NomeMunicipioEntrega = params.NomeMunicipioEntrega;
    this.CodLocalArmazenagem = params.CodLocalArmazenagem;
    this.NomeLocalArmazenagem = params.NomeLocalArmazenagem;
    this.CodSetorEstoque = params.CodSetorEstoque;
    this.DescricaoSetorEstoque = params.DescricaoSetorEstoque;
    this.CodProduto = params.CodProduto;
    this.NomeProduto = params.NomeProduto;
    this.DescricaoProduto = params.DescricaoProduto;
    this.CodGrupoProduto = params.CodGrupoProduto;
    this.NomeGrupoProduto = params.NomeGrupoProduto;
    this.CodMarca = params.CodMarca;
    this.NomeMarca = params.NomeMarca;
    this.CodigoFabricante = params.CodigoFabricante;
    this.CodigoFornecedor = params.CodigoFornecedor;
    this.CodigoReferencia = params.CodigoReferencia;
    this.CodigoBarras = params.CodigoBarras;
    this.DescricaoEnderecoProduto = params.DescricaoEnderecoProduto;
    this.CodUnidadeMedida = params.CodUnidadeMedida;
    this.DescricaoUnidadeMedida = params.DescricaoUnidadeMedida;
    this.Quantidade = params.Quantidade;
    this.QuantidadeInterna = params.QuantidadeInterna;
    this.QuantidadeExterna = params.QuantidadeExterna;
    this.QuantidadeSeparacao = params.QuantidadeSeparacao;
    this.HistoricoSepararEstoque = params.HistoricoSepararEstoque;
    this.ObservacaoSepararEstoque = params.ObservacaoSepararEstoque;
    this.OrcamentoObservacao = params.OrcamentoObservacao;
  }

  public copyWith(params: {
    CodEmpresa?: number;
    CodSepararEstoque?: number;
    Item?: string;
    Origem?: string | null;
    CodOrigem?: number | null;
    ItemOrigem?: string | null;
    CodProdutoVendido?: number | null;
    DataSepararEstoque?: Date;
    HoraSepararEstoque?: string;
    Situacao?: string;
    CodTipoOperacaoSaida?: number | null;
    DescricaoTipoOperacaoSaida?: string | null;
    CodVendedor?: number | null;
    NomeVendedor?: string | null;
    TipoEntidade?: string;
    CodEntidade?: string;
    NomeEntidade?: string;
    CodPrioridade?: number;
    DescricaoPrioridade?: string;
    CodCliente?: number | null;
    NomeCliente?: string | null;
    NomeFantasiaCliente?: string | null;
    CodTransportadora?: number | null;
    NomeFantasiaTransportadora?: string | null;
    RazaoSocialTransportadora?: string | null;
    CodMunicipioEntrega?: number | null;
    NomeMunicipioEntrega?: string | null;
    CodLocalArmazenagem?: number;
    NomeLocalArmazenagem?: string;
    CodSetorEstoque?: number | null;
    DescricaoSetorEstoque?: string | null;
    CodProduto?: number;
    NomeProduto?: string;
    DescricaoProduto?: string | null;
    CodGrupoProduto?: number | null;
    NomeGrupoProduto?: string | null;
    CodMarca?: number | null;
    NomeMarca?: string | null;
    CodigoFabricante?: string | null;
    CodigoFornecedor?: string | null;
    CodigoReferencia?: string | null;
    CodigoBarras?: string | null;
    DescricaoEnderecoProduto?: string | null;
    CodUnidadeMedida?: string;
    DescricaoUnidadeMedida?: string;
    Quantidade?: number;
    QuantidadeInterna?: number;
    QuantidadeExterna?: number;
    QuantidadeSeparacao?: number;
    HistoricoSepararEstoque?: string | null;
    ObservacaoSepararEstoque?: string | null;
    OrcamentoObservacao?: string | null;
  }) {
    return new ExpedicaoItemImpressoConsultaDto({
      CodEmpresa: params.CodEmpresa ?? this.CodEmpresa,
      CodSepararEstoque: params.CodSepararEstoque ?? this.CodSepararEstoque,
      Item: params.Item ?? this.Item,
      Origem: params.Origem ?? this.Origem,
      CodOrigem: params.CodOrigem ?? this.CodOrigem,
      ItemOrigem: params.ItemOrigem ?? this.ItemOrigem,
      CodProdutoVendido: params.CodProdutoVendido ?? this.CodProdutoVendido,
      DataSepararEstoque: params.DataSepararEstoque ?? this.DataSepararEstoque,
      HoraSepararEstoque: params.HoraSepararEstoque ?? this.HoraSepararEstoque,
      Situacao: params.Situacao ?? this.Situacao,
      CodTipoOperacaoSaida: params.CodTipoOperacaoSaida ?? this.CodTipoOperacaoSaida,
      DescricaoTipoOperacaoSaida: params.DescricaoTipoOperacaoSaida ?? this.DescricaoTipoOperacaoSaida,
      CodVendedor: params.CodVendedor ?? this.CodVendedor,
      NomeVendedor: params.NomeVendedor ?? this.NomeVendedor,
      TipoEntidade: params.TipoEntidade ?? this.TipoEntidade,
      CodEntidade: params.CodEntidade ?? this.CodEntidade,
      NomeEntidade: params.NomeEntidade ?? this.NomeEntidade,
      CodPrioridade: params.CodPrioridade ?? this.CodPrioridade,
      DescricaoPrioridade: params.DescricaoPrioridade ?? this.DescricaoPrioridade,
      CodCliente: params.CodCliente ?? this.CodCliente,
      NomeCliente: params.NomeCliente ?? this.NomeCliente,
      NomeFantasiaCliente: params.NomeFantasiaCliente ?? this.NomeFantasiaCliente,
      CodTransportadora: params.CodTransportadora ?? this.CodTransportadora,
      NomeFantasiaTransportadora: params.NomeFantasiaTransportadora ?? this.NomeFantasiaTransportadora,
      RazaoSocialTransportadora: params.RazaoSocialTransportadora ?? this.RazaoSocialTransportadora,
      CodMunicipioEntrega: params.CodMunicipioEntrega ?? this.CodMunicipioEntrega,
      NomeMunicipioEntrega: params.NomeMunicipioEntrega ?? this.NomeMunicipioEntrega,
      CodLocalArmazenagem: params.CodLocalArmazenagem ?? this.CodLocalArmazenagem,
      NomeLocalArmazenagem: params.NomeLocalArmazenagem ?? this.NomeLocalArmazenagem,
      CodSetorEstoque: params.CodSetorEstoque ?? this.CodSetorEstoque,
      DescricaoSetorEstoque: params.DescricaoSetorEstoque ?? this.DescricaoSetorEstoque,
      CodProduto: params.CodProduto ?? this.CodProduto,
      NomeProduto: params.NomeProduto ?? this.NomeProduto,
      DescricaoProduto: params.DescricaoProduto ?? this.DescricaoProduto,
      CodGrupoProduto: params.CodGrupoProduto ?? this.CodGrupoProduto,
      NomeGrupoProduto: params.NomeGrupoProduto ?? this.NomeGrupoProduto,
      CodMarca: params.CodMarca ?? this.CodMarca,
      NomeMarca: params.NomeMarca ?? this.NomeMarca,
      CodigoFabricante: params.CodigoFabricante ?? this.CodigoFabricante,
      CodigoFornecedor: params.CodigoFornecedor ?? this.CodigoFornecedor,
      CodigoReferencia: params.CodigoReferencia ?? this.CodigoReferencia,
      CodigoBarras: params.CodigoBarras ?? this.CodigoBarras,
      DescricaoEnderecoProduto: params.DescricaoEnderecoProduto ?? this.DescricaoEnderecoProduto,
      CodUnidadeMedida: params.CodUnidadeMedida ?? this.CodUnidadeMedida,
      DescricaoUnidadeMedida: params.DescricaoUnidadeMedida ?? this.DescricaoUnidadeMedida,
      Quantidade: params.Quantidade ?? this.Quantidade,
      QuantidadeInterna: params.QuantidadeInterna ?? this.QuantidadeInterna,
      QuantidadeExterna: params.QuantidadeExterna ?? this.QuantidadeExterna,
      QuantidadeSeparacao: params.QuantidadeSeparacao ?? this.QuantidadeSeparacao,
      HistoricoSepararEstoque: params.HistoricoSepararEstoque ?? this.HistoricoSepararEstoque,
      ObservacaoSepararEstoque: params.ObservacaoSepararEstoque ?? this.ObservacaoSepararEstoque,
      OrcamentoObservacao: params.OrcamentoObservacao ?? this.OrcamentoObservacao,
    });
  }

  static fromObject(object: any): ExpedicaoItemImpressoConsultaDto {
    return new ExpedicaoItemImpressoConsultaDto({
      CodEmpresa: object.CodEmpresa,
      CodSepararEstoque: object.CodSepararEstoque,
      Item: object.Item,
      Origem: object.Origem ?? null,
      CodOrigem: object.CodOrigem ?? null,
      ItemOrigem: object.ItemOrigem ?? null,
      CodProdutoVendido: object.CodProdutoVendido ?? null,
      DataSepararEstoque: object.DataSepararEstoque,
      HoraSepararEstoque: object.HoraSepararEstoque,
      Situacao: object.Situacao,
      CodTipoOperacaoSaida: object.CodTipoOperacaoSaida ?? null,
      DescricaoTipoOperacaoSaida: object.DescricaoTipoOperacaoSaida ?? null,
      CodVendedor: object.CodVendedor ?? null,
      NomeVendedor: object.NomeVendedor ?? null,
      TipoEntidade: object.TipoEntidade,
      CodEntidade: object.CodEntidade,
      NomeEntidade: object.NomeEntidade,
      CodPrioridade: object.CodPrioridade,
      DescricaoPrioridade: object.DescricaoPrioridade,
      CodCliente: object.CodCliente ?? null,
      NomeCliente: object.NomeCliente ?? null,
      NomeFantasiaCliente: object.NomeFantasiaCliente ?? null,
      CodTransportadora: object.CodTransportadora ?? null,
      NomeFantasiaTransportadora: object.NomeFantasiaTransportadora ?? null,
      RazaoSocialTransportadora: object.RazaoSocialTransportadora ?? null,
      CodMunicipioEntrega: object.CodMunicipioEntrega ?? null,
      NomeMunicipioEntrega: object.NomeMunicipioEntrega ?? null,
      CodLocalArmazenagem: object.CodLocalArmazenagem,
      NomeLocalArmazenagem: object.NomeLocalArmazenagem,
      CodSetorEstoque: object.CodSetorEstoque ?? null,
      DescricaoSetorEstoque: object.DescricaoSetorEstoque ?? null,
      CodProduto: object.CodProduto,
      NomeProduto: object.NomeProduto,
      DescricaoProduto: object.DescricaoProduto ?? null,
      CodGrupoProduto: object.CodGrupoProduto ?? null,
      NomeGrupoProduto: object.NomeGrupoProduto ?? null,
      CodMarca: object.CodMarca ?? null,
      NomeMarca: object.NomeMarca ?? null,
      CodigoFabricante: object.CodigoFabricante ?? null,
      CodigoFornecedor: object.CodigoFornecedor ?? null,
      CodigoReferencia: object.CodigoReferencia ?? null,
      CodigoBarras: object.CodigoBarras ?? null,
      DescricaoEnderecoProduto: object.DescricaoEnderecoProduto ?? null,
      CodUnidadeMedida: object.CodUnidadeMedida,
      DescricaoUnidadeMedida: object.DescricaoUnidadeMedida,
      Quantidade: object.Quantidade,
      QuantidadeInterna: object.QuantidadeInterna,
      QuantidadeExterna: object.QuantidadeExterna,
      QuantidadeSeparacao: object.QuantidadeSeparacao,
      HistoricoSepararEstoque: object.HistoricoSepararEstoque ?? null,
      ObservacaoSepararEstoque: object.ObservacaoSepararEstoque ?? null,
      OrcamentoObservacao: object.OrcamentoObservacao ?? null,
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
      CodProdutoVendido: this.CodProdutoVendido,
      DataSepararEstoque: this.DataSepararEstoque,
      HoraSepararEstoque: this.HoraSepararEstoque,
      Situacao: this.Situacao,
      CodTipoOperacaoSaida: this.CodTipoOperacaoSaida,
      DescricaoTipoOperacaoSaida: this.DescricaoTipoOperacaoSaida,
      CodVendedor: this.CodVendedor,
      NomeVendedor: this.NomeVendedor,
      TipoEntidade: this.TipoEntidade,
      CodEntidade: this.CodEntidade,
      NomeEntidade: this.NomeEntidade,
      CodPrioridade: this.CodPrioridade,
      DescricaoPrioridade: this.DescricaoPrioridade,
      CodCliente: this.CodCliente,
      NomeCliente: this.NomeCliente,
      NomeFantasiaCliente: this.NomeFantasiaCliente,
      CodTransportadora: this.CodTransportadora,
      NomeFantasiaTransportadora: this.NomeFantasiaTransportadora,
      RazaoSocialTransportadora: this.RazaoSocialTransportadora,
      CodMunicipioEntrega: this.CodMunicipioEntrega,
      NomeMunicipioEntrega: this.NomeMunicipioEntrega,
      CodLocalArmazenagem: this.CodLocalArmazenagem,
      NomeLocalArmazenagem: this.NomeLocalArmazenagem,
      CodSetorEstoque: this.CodSetorEstoque,
      DescricaoSetorEstoque: this.DescricaoSetorEstoque,
      CodProduto: this.CodProduto,
      NomeProduto: this.NomeProduto,
      DescricaoProduto: this.DescricaoProduto,
      CodGrupoProduto: this.CodGrupoProduto,
      NomeGrupoProduto: this.NomeGrupoProduto,
      CodMarca: this.CodMarca,
      NomeMarca: this.NomeMarca,
      CodigoFabricante: this.CodigoFabricante,
      CodigoFornecedor: this.CodigoFornecedor,
      CodigoReferencia: this.CodigoReferencia,
      CodigoBarras: this.CodigoBarras,
      DescricaoEnderecoProduto: this.DescricaoEnderecoProduto,
      CodUnidadeMedida: this.CodUnidadeMedida,
      DescricaoUnidadeMedida: this.DescricaoUnidadeMedida,
      Quantidade: this.Quantidade,
      QuantidadeInterna: this.QuantidadeInterna,
      QuantidadeExterna: this.QuantidadeExterna,
      QuantidadeSeparacao: this.QuantidadeSeparacao,
      HistoricoSepararEstoque: this.HistoricoSepararEstoque,
      ObservacaoSepararEstoque: this.ObservacaoSepararEstoque,
      OrcamentoObservacao: this.OrcamentoObservacao,
    };
  }
}
