export default class ExpedicaoSepararConsultaDto {
  CodEmpresa: number;
  CodSepararEstoque: number;
  Origem: string;
  CodOrigem: number;
  CodTipoOperacaoExpedicao: number;
  NomeTipoOperacaoExpedicao: string;
  Situacao: string;
  TipoEntidade: string;
  DataEmissao: Date;
  HoraEmissao: string;
  CodEntidade: number;
  NomeEntidade: string;
  CodPrioridade: number;
  NomePrioridade: string;
  CodSetoresEstoque?: string;
  CodUsuariosSeparacao?: string;
  Historico?: string;
  Observacao?: string;

  constructor(params: {
    CodEmpresa: number;
    CodSepararEstoque: number;
    Origem: string;
    CodOrigem: number;
    CodTipoOperacaoExpedicao: number;
    NomeTipoOperacaoExpedicao: string;
    Situacao: string;
    TipoEntidade: string;
    DataEmissao: Date;
    HoraEmissao: string;
    CodEntidade: number;
    NomeEntidade: string;
    CodPrioridade: number;
    NomePrioridade: string;
    CodSetoresEstoque?: string;
    CodUsuariosSeparacao?: string;
    Historico?: string;
    Observacao?: string;
  }) {
    this.CodEmpresa = params.CodEmpresa;
    this.CodSepararEstoque = params.CodSepararEstoque;
    this.Origem = params.Origem;
    this.CodOrigem = params.CodOrigem;
    this.CodTipoOperacaoExpedicao = params.CodTipoOperacaoExpedicao;
    this.NomeTipoOperacaoExpedicao = params.NomeTipoOperacaoExpedicao;
    this.Situacao = params.Situacao;
    this.TipoEntidade = params.TipoEntidade;
    this.DataEmissao = params.DataEmissao;
    this.HoraEmissao = params.HoraEmissao;
    this.CodEntidade = params.CodEntidade;
    this.NomeEntidade = params.NomeEntidade;
    this.CodPrioridade = params.CodPrioridade;
    this.NomePrioridade = params.NomePrioridade;
    this.CodSetoresEstoque = params?.CodSetoresEstoque;
    this.CodUsuariosSeparacao = params?.CodUsuariosSeparacao;
    this.Historico = params?.Historico;
    this.Observacao = params?.Observacao;
  }

  static fromObject(object: any): ExpedicaoSepararConsultaDto {
    return new ExpedicaoSepararConsultaDto({
      CodEmpresa: object.CodEmpresa,
      CodSepararEstoque: object.CodSepararEstoque,
      Origem: object.Origem,
      CodOrigem: object.CodOrigem,
      CodTipoOperacaoExpedicao: object.CodTipoOperacaoExpedicao,
      NomeTipoOperacaoExpedicao: object.NomeTipoOperacaoExpedicao,
      Situacao: object.Situacao,
      TipoEntidade: object.TipoEntidade,
      DataEmissao: object.DataEmissao,
      HoraEmissao: object.HoraEmissao,
      CodEntidade: object.CodEntidade,
      NomeEntidade: object.NomeEntidade,
      CodPrioridade: object.CodPrioridade,
      NomePrioridade: object.NomePrioridade,
      CodSetoresEstoque: object?.CodSetoresEstoque,
      CodUsuariosSeparacao: object?.CodUsuariosSeparacao,
      Historico: object?.Historico,
      Observacao: object?.Observacao,
    });
  }

  toJson(): any {
    return {
      CodEmpresa: this.CodEmpresa,
      CodSepararEstoque: this.CodSepararEstoque,
      Origem: this.Origem,
      CodOrigem: this.CodOrigem,
      CodTipoOperacaoExpedicao: this.CodTipoOperacaoExpedicao,
      NomeTipoOperacaoExpedicao: this.NomeTipoOperacaoExpedicao,
      Situacao: this.Situacao,
      TipoEntidade: this.TipoEntidade,
      DataEmissao: this.DataEmissao,
      HoraEmissao: this.HoraEmissao,
      CodEntidade: this.CodEntidade,
      NomeEntidade: this.NomeEntidade,
      CodPrioridade: this.CodPrioridade,
      NomePrioridade: this.NomePrioridade,
      CodSetoresEstoque: this.CodSetoresEstoque ?? null,
      CodUsuariosSeparacao: this.CodUsuariosSeparacao ?? null,
      Historico: this.Historico,
      Observacao: this.Observacao,
    };
  }
}
