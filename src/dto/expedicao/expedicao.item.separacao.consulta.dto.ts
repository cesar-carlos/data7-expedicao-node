export default class ExpedicaoItemSeparacaoConsultaDto {
  CodEmpresa: number;
  CodSepararEstoque: number;
  Item: string;
  SessionId: string;
  Situacao: string;
  CodCarrinho: number;
  NomeCarrinho: string;
  CodigoBarrasCarrinho: string;
  CodCarrinhoPercurso: number;
  ItemCarrinhoPercurso: string;
  CodProduto: number;
  NomeProduto: string;
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
  CodSeparador: number;
  NomeSeparador: string;
  DataSeparacao: Date;
  HoraSeparacao: string;
  Quantidade: number;

  constructor(params: {
    CodEmpresa: number;
    CodSepararEstoque: number;
    Item: string;
    SessionId: string;
    Situacao: string;
    CodCarrinho: number;
    NomeCarrinho: string;
    CodigoBarrasCarrinho: string;
    CodCarrinhoPercurso: number;
    ItemCarrinhoPercurso: string;
    CodProduto: number;
    NomeProduto: string;
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
    CodSeparador: number;
    NomeSeparador: string;
    DataSeparacao: Date;
    HoraSeparacao: string;
    Quantidade: number;
  }) {
    this.CodEmpresa = params.CodEmpresa;
    this.CodSepararEstoque = params.CodSepararEstoque;
    this.Item = params.Item;
    this.SessionId = params.SessionId;
    this.Situacao = params.Situacao;
    this.CodCarrinho = params.CodCarrinho;
    this.NomeCarrinho = params.NomeCarrinho;
    this.CodigoBarrasCarrinho = params.CodigoBarrasCarrinho;
    this.CodCarrinhoPercurso = params.CodCarrinhoPercurso;
    this.ItemCarrinhoPercurso = params.ItemCarrinhoPercurso;
    this.CodProduto = params.CodProduto;
    this.NomeProduto = params.NomeProduto;
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
    this.CodSeparador = params.CodSeparador;
    this.NomeSeparador = params.NomeSeparador;
    this.DataSeparacao = params.DataSeparacao;
    this.HoraSeparacao = params.HoraSeparacao;
    this.Quantidade = params.Quantidade;
  }

  public copyWith(params: {
    CodEmpresa?: number;
    CodSepararEstoque?: number;
    Item?: string;
    SessionId?: string;
    Situacao?: string;
    CodCarrinho?: number;
    NomeCarrinho?: string;
    CodigoBarrasCarrinho?: string;
    CodCarrinhoPercurso?: number;
    ItemCarrinhoPercurso?: string;
    CodProduto?: number;
    NomeProduto?: string;
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
    CodSeparador?: number;
    NomeSeparador?: string;
    DataSeparacao?: Date;
    HoraSeparacao?: string;
    Quantidade?: number;
  }): ExpedicaoItemSeparacaoConsultaDto {
    return new ExpedicaoItemSeparacaoConsultaDto({
      CodEmpresa: params.CodEmpresa ?? this.CodEmpresa,
      CodSepararEstoque: params.CodSepararEstoque ?? this.CodSepararEstoque,
      Item: params.Item ?? this.Item,
      SessionId: params.SessionId ?? this.SessionId,
      Situacao: params.Situacao ?? this.Situacao,
      CodCarrinho: params.CodCarrinho ?? this.CodCarrinho,
      NomeCarrinho: params.NomeCarrinho ?? this.NomeCarrinho,
      CodigoBarrasCarrinho: params.CodigoBarrasCarrinho ?? this.CodigoBarrasCarrinho,
      CodCarrinhoPercurso: params.CodCarrinhoPercurso ?? this.CodCarrinhoPercurso,
      ItemCarrinhoPercurso: params.ItemCarrinhoPercurso ?? this.ItemCarrinhoPercurso,
      CodProduto: params.CodProduto ?? this.CodProduto,
      NomeProduto: params.NomeProduto ?? this.NomeProduto,
      CodUnidadeMedida: params.CodUnidadeMedida ?? this.CodUnidadeMedida,
      NomeUnidadeMedida: params.NomeUnidadeMedida ?? this.NomeUnidadeMedida,
      CodGrupoProduto: params.CodGrupoProduto ?? this.CodGrupoProduto,
      NomeGrupoProduto: params.NomeGrupoProduto ?? this.NomeGrupoProduto,
      CodMarca: params.CodMarca ?? this.CodMarca,
      NomeMarca: params.NomeMarca ?? this.NomeMarca,
      CodSetorEstoque: params.CodSetorEstoque ?? this.CodSetorEstoque,
      NomeSetorEstoque: params.NomeSetorEstoque ?? this.NomeSetorEstoque,
      NCM: params.NCM ?? this.NCM,
      CodigoBarras: params.CodigoBarras ?? this.CodigoBarras,
      CodigoBarras2: params.CodigoBarras2 ?? this.CodigoBarras2,
      CodigoReferencia: params.CodigoReferencia ?? this.CodigoReferencia,
      CodigoFornecedor: params.CodigoFornecedor ?? this.CodigoFornecedor,
      CodigoFabricante: params.CodigoFabricante ?? this.CodigoFabricante,
      CodigoOriginal: params.CodigoOriginal ?? this.CodigoOriginal,
      Endereco: params.Endereco ?? this.Endereco,
      EnderecoDescricao: params.EnderecoDescricao ?? this.EnderecoDescricao,
      CodSeparador: params.CodSeparador ?? this.CodSeparador,
      NomeSeparador: params.NomeSeparador ?? this.NomeSeparador,
      DataSeparacao: params.DataSeparacao ?? this.DataSeparacao,
      HoraSeparacao: params.HoraSeparacao ?? this.HoraSeparacao,
      Quantidade: params.Quantidade ?? this.Quantidade,
    });
  }

  static fromObject(object: any): ExpedicaoItemSeparacaoConsultaDto {
    return new ExpedicaoItemSeparacaoConsultaDto({
      CodEmpresa: object.CodEmpresa,
      CodSepararEstoque: object.CodSepararEstoque,
      Item: object.Item,
      SessionId: object.SessionId,
      Situacao: object.Situacao,
      CodCarrinho: object.CodCarrinho,
      NomeCarrinho: object.NomeCarrinho,
      CodigoBarrasCarrinho: object.CodigoBarrasCarrinho,
      CodCarrinhoPercurso: object.CodCarrinhoPercurso,
      ItemCarrinhoPercurso: object.ItemCarrinhoPercurso,
      CodProduto: object.CodProduto,
      NomeProduto: object.NomeProduto,
      CodUnidadeMedida: object.CodUnidadeMedida,
      NomeUnidadeMedida: object.NomeUnidadeMedida,
      CodGrupoProduto: object.CodGrupoProduto,
      NomeGrupoProduto: object.NomeGrupoProduto,
      CodMarca: object.CodMarca,
      NomeMarca: object.NomeMarca,
      CodSetorEstoque: object?.CodSetorEstoque,
      NomeSetorEstoque: object?.NomeSetorEstoque,
      NCM: object.NCM,
      CodigoBarras: object?.CodigoBarras,
      CodigoBarras2: object?.CodigoBarras2,
      CodigoReferencia: object?.CodigoReferencia,
      CodigoFornecedor: object?.CodigoFornecedor,
      CodigoFabricante: object?.CodigoFabricante,
      CodigoOriginal: object?.CodigoOriginal,
      Endereco: object.Endereco,
      EnderecoDescricao: object?.EnderecoDescricao,
      CodSeparador: object.CodSeparador,
      NomeSeparador: object.NomeSeparador,
      DataSeparacao: object.DataSeparacao,
      HoraSeparacao: object.HoraSeparacao,
      Quantidade: object.Quantidade,
    });
  }

  toJson(): any {
    return {
      CodEmpresa: this.CodEmpresa,
      CodSepararEstoque: this.CodSepararEstoque,
      Item: this.Item,
      SessionId: this.SessionId,
      Situacao: this.Situacao,
      CodCarrinho: this.CodCarrinho,
      NomeCarrinho: this.NomeCarrinho,
      CodigoBarrasCarrinho: this.CodigoBarrasCarrinho,
      CodCarrinhoPercurso: this.CodCarrinhoPercurso,
      ItemCarrinhoPercurso: this.ItemCarrinhoPercurso,
      CodProduto: this.CodProduto,
      NomeProduto: this.NomeProduto,
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
      CodSeparador: this.CodSeparador,
      NomeSeparador: this.NomeSeparador,
      DataSeparacao: this.DataSeparacao,
      HoraSeparacao: this.HoraSeparacao,
      Quantidade: Number(this.Quantidade).toFixed(4),
    };
  }
}
