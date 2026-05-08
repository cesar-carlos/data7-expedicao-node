import ExpedicaoItemConferirConsultaDto from './expedicao.item.conferir.consulta.dto';

export default class ExpedicaoItemConferirDto {
  CodEmpresa: number;
  CodConferir: number;
  Item: string;
  CodCarrinhoPercurso: number;
  ItemCarrinhoPercurso: string;
  CodProduto: number;
  CodUnidadeMedida: string;
  Quantidade: number;
  QuantidadeConferida: number;

  constructor(params: {
    CodEmpresa: number;
    CodConferir: number;
    Item: string;
    CodCarrinhoPercurso: number;
    ItemCarrinhoPercurso: string;
    CodProduto: number;
    CodUnidadeMedida: string;
    Quantidade: number;
    QuantidadeConferida: number;
  }) {
    this.CodEmpresa = params.CodEmpresa;
    this.CodConferir = params.CodConferir;
    this.Item = params.Item;
    this.CodCarrinhoPercurso = params.CodCarrinhoPercurso;
    this.ItemCarrinhoPercurso = params.ItemCarrinhoPercurso;
    this.CodProduto = params.CodProduto;
    this.CodUnidadeMedida = params.CodUnidadeMedida;
    this.Quantidade = params.Quantidade;
    this.QuantidadeConferida = params.QuantidadeConferida;
  }

  public copyWith(params: {
    CodEmpresa?: number;
    CodConferir?: number;
    Item?: string;
    CodCarrinhoPercurso?: number;
    ItemCarrinhoPercurso?: string;
    CodProduto?: number;
    CodUnidadeMedida?: string;
    Quantidade?: number;
    QuantidadeConferida?: number;
  }) {
    return new ExpedicaoItemConferirDto({
      CodEmpresa: params.CodEmpresa ?? this.CodEmpresa,
      CodConferir: params.CodConferir ?? this.CodConferir,
      Item: params.Item ?? this.Item,
      CodCarrinhoPercurso: params.CodCarrinhoPercurso ?? this.CodCarrinhoPercurso,
      ItemCarrinhoPercurso: params.ItemCarrinhoPercurso ?? this.ItemCarrinhoPercurso,
      CodProduto: params.CodProduto ?? this.CodProduto,
      CodUnidadeMedida: params.CodUnidadeMedida ?? this.CodUnidadeMedida,
      Quantidade: params.Quantidade ?? this.Quantidade,
      QuantidadeConferida: params.QuantidadeConferida ?? this.QuantidadeConferida,
    });
  }

  static fromConsulta(item: ExpedicaoItemConferirConsultaDto): ExpedicaoItemConferirDto {
    return new ExpedicaoItemConferirDto({
      CodEmpresa: item.CodEmpresa,
      CodConferir: item.CodConferir,
      Item: item.Item,
      CodCarrinhoPercurso: item.CodCarrinhoPercurso,
      ItemCarrinhoPercurso: item.ItemCarrinhoPercurso,
      CodProduto: item.CodProduto,
      CodUnidadeMedida: item.CodUnidadeMedida,
      Quantidade: item.Quantidade,
      QuantidadeConferida: item.QuantidadeConferida,
    });
  }

  static fromObject(object: any): ExpedicaoItemConferirDto {
    return new ExpedicaoItemConferirDto({
      CodEmpresa: object.CodEmpresa,
      CodConferir: object.CodConferir,
      Item: object.Item,
      CodCarrinhoPercurso: object.CodCarrinhoPercurso,
      ItemCarrinhoPercurso: object.ItemCarrinhoPercurso,
      CodProduto: object.CodProduto,
      CodUnidadeMedida: object.CodUnidadeMedida,
      Quantidade: Number.parseFloat(object.Quantidade),
      QuantidadeConferida: Number.parseFloat(object.QuantidadeConferida),
    });
  }

  toJson(): any {
    return {
      CodEmpresa: this.CodEmpresa,
      CodConferir: this.CodConferir,
      Item: this.Item,
      CodCarrinhoPercurso: this.CodCarrinhoPercurso,
      ItemCarrinhoPercurso: this.ItemCarrinhoPercurso,
      CodProduto: this.CodProduto,
      CodUnidadeMedida: this.CodUnidadeMedida,
      Quantidade: Number(this.Quantidade).toFixed(4),
      QuantidadeConferida: Number(this.QuantidadeConferida).toFixed(4),
    };
  }
}
