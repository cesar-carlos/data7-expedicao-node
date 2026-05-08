export default class ExpedicaoSeparacaoUsuarioSetorConsultaDto {
  CodEmpresa: number;
  CodSepararEstoque: number;
  SepararEstoqueSituacao: string;
  CodSetorEstoque: number;
  DescricaoSetorEstoque: string;
  CodPrioridade: number;
  DescricaoPrioridade: string;
  Prioridade: number;
  QuantidadeItens: number;
  QuantidadeItensSeparacao: number;
  QuantidadeItensSetor: number;
  QuantidadeItensSeparacaoSetor: number;
  CarrinhosAbertosUsuario: string;
  CodUsuario?: number;
  NomeUsuario?: string;
  EstacaoSeparacao?: string;

  constructor(params: {
    CodEmpresa: number;
    CodSepararEstoque: number;
    SepararEstoqueSituacao: string;
    CodSetorEstoque: number;
    DescricaoSetorEstoque: string;
    CodPrioridade: number;
    DescricaoPrioridade: string;
    Prioridade: number;
    QuantidadeItens: number;
    QuantidadeItensSeparacao: number;
    QuantidadeItensSetor: number;
    QuantidadeItensSeparacaoSetor: number;
    CarrinhosAbertosUsuario: string;
    CodUsuario?: number;
    NomeUsuario?: string;
    EstacaoSeparacao?: string;
  }) {
    this.CodEmpresa = params.CodEmpresa;
    this.CodSepararEstoque = params.CodSepararEstoque;
    this.SepararEstoqueSituacao = params.SepararEstoqueSituacao;
    this.CodSetorEstoque = params.CodSetorEstoque;
    this.DescricaoSetorEstoque = params.DescricaoSetorEstoque;
    this.CodPrioridade = params.CodPrioridade;
    this.DescricaoPrioridade = params.DescricaoPrioridade;
    this.Prioridade = params.Prioridade;
    this.QuantidadeItens = params.QuantidadeItens;
    this.QuantidadeItensSeparacao = params.QuantidadeItensSeparacao;
    this.QuantidadeItensSetor = params.QuantidadeItensSetor;
    this.QuantidadeItensSeparacaoSetor = params.QuantidadeItensSeparacaoSetor;
    this.CarrinhosAbertosUsuario = params.CarrinhosAbertosUsuario;
    this.CodUsuario = params.CodUsuario;
    this.NomeUsuario = params.NomeUsuario;
    this.EstacaoSeparacao = params.EstacaoSeparacao;
  }

  static fromObject(object: any): ExpedicaoSeparacaoUsuarioSetorConsultaDto {
    return new ExpedicaoSeparacaoUsuarioSetorConsultaDto({
      CodEmpresa: object.CodEmpresa,
      CodSepararEstoque: object.CodSepararEstoque,
      SepararEstoqueSituacao: object.SepararEstoqueSituacao,
      CodSetorEstoque: object.CodSetorEstoque,
      DescricaoSetorEstoque: object.DescricaoSetorEstoque,
      CodPrioridade: object.CodPrioridade,
      DescricaoPrioridade: object.DescricaoPrioridade,
      Prioridade: object.Prioridade,
      QuantidadeItens: object.QuantidadeItens,
      QuantidadeItensSeparacao: object.QuantidadeItensSeparacao,
      QuantidadeItensSetor: object.QuantidadeItensSetor,
      QuantidadeItensSeparacaoSetor: object.QuantidadeItensSeparacaoSetor,
      CarrinhosAbertosUsuario: object.CarrinhosAbertosUsuario,
      CodUsuario: object.CodUsuario,
      NomeUsuario: object.NomeUsuario,
      EstacaoSeparacao: object.EstacaoSeparacao,
    });
  }

  toJson(): any {
    return {
      CodEmpresa: this.CodEmpresa,
      CodSepararEstoque: this.CodSepararEstoque,
      SepararEstoqueSituacao: this.SepararEstoqueSituacao,
      CodSetorEstoque: this.CodSetorEstoque,
      DescricaoSetorEstoque: this.DescricaoSetorEstoque,
      CodPrioridade: this.CodPrioridade,
      DescricaoPrioridade: this.DescricaoPrioridade,
      Prioridade: this.Prioridade,
      QuantidadeItens: this.QuantidadeItens,
      QuantidadeItensSeparacao: this.QuantidadeItensSeparacao,
      QuantidadeItensSetor: this.QuantidadeItensSetor,
      QuantidadeItensSeparacaoSetor: this.QuantidadeItensSeparacaoSetor,
      CarrinhosAbertosUsuario: this.CarrinhosAbertosUsuario,
      CodUsuario: this.CodUsuario,
      NomeUsuario: this.NomeUsuario,
      EstacaoSeparacao: this.EstacaoSeparacao,
    };
  }
}
