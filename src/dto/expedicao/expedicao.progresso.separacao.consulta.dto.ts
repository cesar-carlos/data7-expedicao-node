export default class ExpedicaoProgressoSeparacaoConsultaDto {
  CodEmpresa: number;
  CodSepararEstoque: number;
  Origem: string;
  CodOrigem: number;
  Situacao: string;
  ProcessoSeparacao: string;
  QuantidadeItens: number;
  QuantidadeItensSeparado: number;
  QuantidadeItensRestante: number;

  constructor(params: {
    CodEmpresa: number;
    CodSepararEstoque: number;
    Origem: string;
    CodOrigem: number;
    Situacao: string;
    ProcessoSeparacao: string;
    QuantidadeItens: number;
    QuantidadeItensSeparado: number;
    QuantidadeItensRestante: number;
  }) {
    this.CodEmpresa = params.CodEmpresa;
    this.CodSepararEstoque = params.CodSepararEstoque;
    this.Origem = params.Origem;
    this.CodOrigem = params.CodOrigem;
    this.Situacao = params.Situacao;
    this.ProcessoSeparacao = params.ProcessoSeparacao;
    this.QuantidadeItens = params.QuantidadeItens;
    this.QuantidadeItensSeparado = params.QuantidadeItensSeparado;
    this.QuantidadeItensRestante = params.QuantidadeItensRestante;
  }

  public copyWith(params: {
    CodEmpresa?: number;
    CodSepararEstoque?: number;
    Origem?: string;
    CodOrigem?: number;
    Situacao?: string;
    ProcessoSeparacao?: string;
    QuantidadeItens?: number;
    QuantidadeItensSeparado?: number;
    QuantidadeItensRestante?: number;
  }): ExpedicaoProgressoSeparacaoConsultaDto {
    return new ExpedicaoProgressoSeparacaoConsultaDto({
      CodEmpresa: params.CodEmpresa ?? this.CodEmpresa,
      CodSepararEstoque: params.CodSepararEstoque ?? this.CodSepararEstoque,
      Origem: params.Origem ?? this.Origem,
      CodOrigem: params.CodOrigem ?? this.CodOrigem,
      Situacao: params.Situacao ?? this.Situacao,
      ProcessoSeparacao: params.ProcessoSeparacao ?? this.ProcessoSeparacao,
      QuantidadeItens: params.QuantidadeItens ?? this.QuantidadeItens,
      QuantidadeItensSeparado: params.QuantidadeItensSeparado ?? this.QuantidadeItensSeparado,
      QuantidadeItensRestante: params.QuantidadeItensRestante ?? this.QuantidadeItensRestante,
    });
  }

  public toObject(): any {
    return {
      CodEmpresa: this.CodEmpresa,
      CodSepararEstoque: this.CodSepararEstoque,
      Origem: this.Origem,
      CodOrigem: this.CodOrigem,
      Situacao: this.Situacao,
      ProcessoSeparacao: this.ProcessoSeparacao,
      QuantidadeItens: this.QuantidadeItens,
      QuantidadeItensSeparado: this.QuantidadeItensSeparado,
      QuantidadeItensRestante: this.QuantidadeItensRestante,
    };
  }

  public static fromObject(object: any): ExpedicaoProgressoSeparacaoConsultaDto {
    return new ExpedicaoProgressoSeparacaoConsultaDto({
      CodEmpresa: object.CodEmpresa,
      CodSepararEstoque: object.CodSepararEstoque,
      Origem: object.Origem,
      CodOrigem: object.CodOrigem,
      Situacao: object.Situacao,
      ProcessoSeparacao: object.ProcessoSeparacao,
      QuantidadeItens: object.QuantidadeItens,
      QuantidadeItensSeparado: object.QuantidadeItensSeparado,
      QuantidadeItensRestante: object.QuantidadeItensRestante,
    });
  }
}
