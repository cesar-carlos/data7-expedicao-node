export default class ExpedicaoItemConferenciaConsultaDto {
  CodEmpresa: number;
  CodConferir: number;
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
  CodigoBarras?: string;
  CodigoBarras2?: string;
  CodigoReferencia?: string;
  CodigoFornecedor?: string;
  CodigoFabricante?: string;
  CodigoOriginal?: string;
  Endereco?: string;
  EnderecoDescricao?: string;
  CodConferente: number;
  NomeConferente: string;
  DataConferencia: Date;
  HoraConferencia: string;
  Quantidade: number;

  constructor(params: {
    CodEmpresa: number;
    CodConferir: number;
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
    CodigoBarras?: string;
    CodigoBarras2?: string;
    CodigoReferencia?: string;
    CodigoFornecedor?: string;
    CodigoFabricante?: string;
    CodigoOriginal?: string;
    Endereco?: string;
    EnderecoDescricao?: string;
    CodConferente: number;
    NomeConferente: string;
    DataConferencia: Date;
    HoraConferencia: string;
    Quantidade: number;
  }) {
    this.CodEmpresa = params.CodEmpresa;
    this.CodConferir = params.CodConferir;
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
    this.CodMarca = params?.CodMarca;
    this.NomeMarca = params?.NomeMarca;
    this.CodigoBarras = params?.CodigoBarras;
    this.CodigoBarras2 = params?.CodigoBarras2;
    this.CodigoReferencia = params?.CodigoReferencia;
    this.CodigoFornecedor = params?.CodigoFornecedor;
    this.CodigoFabricante = params?.CodigoFabricante;
    this.CodigoOriginal = params?.CodigoOriginal;
    this.Endereco = params?.Endereco;
    this.EnderecoDescricao = params?.EnderecoDescricao;
    this.CodConferente = params.CodConferente;
    this.NomeConferente = params.NomeConferente;
    this.DataConferencia = params.DataConferencia;
    this.HoraConferencia = params.HoraConferencia;
    this.Quantidade = params.Quantidade;
  }

  public copyWith(params: {
    CodEmpresa?: number;
    CodConferir?: number;
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
    CodigoBarras?: string;
    CodigoBarras2?: string;
    CodigoReferencia?: string;
    CodigoFornecedor?: string;
    CodigoFabricante?: string;
    CodigoOriginal?: string;
    Endereco?: string;
    EnderecoDescricao?: string;
    CodConferente?: number;
    NomeConferente?: string;
    DataConferencia?: Date;
    HoraConferencia?: string;
    Quantidade?: number;
  }): ExpedicaoItemConferenciaConsultaDto {
    return new ExpedicaoItemConferenciaConsultaDto({
      CodEmpresa: params?.CodEmpresa ?? this.CodEmpresa,
      CodConferir: params?.CodConferir ?? this.CodConferir,
      Item: params?.Item ?? this.Item,
      SessionId: params?.SessionId ?? this.SessionId,
      Situacao: params?.Situacao ?? this.Situacao,
      CodCarrinho: params?.CodCarrinho ?? this.CodCarrinho,
      NomeCarrinho: params?.NomeCarrinho ?? this.NomeCarrinho,
      CodigoBarrasCarrinho: params?.CodigoBarrasCarrinho ?? this.CodigoBarrasCarrinho,
      CodCarrinhoPercurso: params?.CodCarrinhoPercurso ?? this.CodCarrinhoPercurso,
      ItemCarrinhoPercurso: params?.ItemCarrinhoPercurso ?? this.ItemCarrinhoPercurso,
      CodProduto: params?.CodProduto ?? this.CodProduto,
      NomeProduto: params?.NomeProduto ?? this.NomeProduto,
      CodUnidadeMedida: params?.CodUnidadeMedida ?? this.CodUnidadeMedida,
      NomeUnidadeMedida: params?.NomeUnidadeMedida ?? this.NomeUnidadeMedida,
      CodGrupoProduto: params?.CodGrupoProduto ?? this.CodGrupoProduto,
      NomeGrupoProduto: params?.NomeGrupoProduto ?? this.NomeGrupoProduto,
      CodMarca: params?.CodMarca ?? this.CodMarca,
      NomeMarca: params?.NomeMarca ?? this.NomeMarca,
      CodigoBarras: params?.CodigoBarras ?? this.CodigoBarras,
      CodigoBarras2: params?.CodigoBarras2 ?? this.CodigoBarras2,
      CodigoReferencia: params?.CodigoReferencia ?? this.CodigoReferencia,
      CodigoFornecedor: params?.CodigoFornecedor ?? this.CodigoFornecedor,
      CodigoFabricante: params?.CodigoFabricante ?? this.CodigoFabricante,
      CodigoOriginal: params?.CodigoOriginal ?? this.CodigoOriginal,
      Endereco: params?.Endereco ?? this.Endereco,
      EnderecoDescricao: params?.EnderecoDescricao ?? this.EnderecoDescricao,
      CodConferente: params?.CodConferente ?? this.CodConferente,
      NomeConferente: params?.NomeConferente ?? this.NomeConferente,
      DataConferencia: params?.DataConferencia ?? this.DataConferencia,
      HoraConferencia: params?.HoraConferencia ?? this.HoraConferencia,
      Quantidade: params?.Quantidade ?? this.Quantidade,
    });
  }

  static fromObject(object: any): ExpedicaoItemConferenciaConsultaDto {
    return new ExpedicaoItemConferenciaConsultaDto({
      CodEmpresa: object.CodEmpresa,
      CodConferir: object.CodConferir,
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
      CodMarca: object?.CodMarca,
      NomeMarca: object?.NomeMarca,
      CodigoBarras: object?.CodigoBarras,
      CodigoBarras2: object?.CodigoBarras2,
      CodigoReferencia: object?.CodigoReferencia,
      CodigoFornecedor: object?.CodigoFornecedor,
      CodigoFabricante: object?.CodigoFabricante,
      CodigoOriginal: object?.CodigoOriginal,
      Endereco: object?.Endereco,
      EnderecoDescricao: object?.EnderecoDescricao,
      CodConferente: object.CodConferente,
      NomeConferente: object.NomeConferente,
      DataConferencia: object.DataConferencia,
      HoraConferencia: object.HoraConferencia,
      Quantidade: object.Quantidade,
    });
  }

  toJson(): any {
    return {
      CodEmpresa: this.CodEmpresa,
      CodConferir: this.CodConferir,
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
      CodigoBarras: this.CodigoBarras,
      CodigoBarras2: this.CodigoBarras2,
      CodigoReferencia: this.CodigoReferencia,
      CodigoFornecedor: this.CodigoFornecedor,
      CodigoFabricante: this.CodigoFabricante,
      CodigoOriginal: this.CodigoOriginal,
      Endereco: this.Endereco,
      EnderecoDescricao: this.EnderecoDescricao,
      CodConferente: this.CodConferente,
      NomeConferente: this.NomeConferente,
      DataConferencia: this.DataConferencia,
      HoraConferencia: this.HoraConferencia,
      Quantidade: Number(this.Quantidade).toFixed(4),
    };
  }
}
