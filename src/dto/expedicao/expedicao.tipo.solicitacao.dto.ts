export default class ExpedicaoTipoSolicitacaoDto {
  CodTipoSolicitacao: number;
  Descricao: string;
  Ativo: string;

  constructor(params: { CodTipoSolicitacao: number; Descricao: string; Ativo: string }) {
    this.CodTipoSolicitacao = params.CodTipoSolicitacao;
    this.Descricao = params.Descricao;
    this.Ativo = params.Ativo;
  }

  public copyWith(params: {
    CodTipoSolicitacao: number;
    Descricao: string;
    Ativo: string;
  }): ExpedicaoTipoSolicitacaoDto {
    return new ExpedicaoTipoSolicitacaoDto({
      CodTipoSolicitacao: params.CodTipoSolicitacao ?? this.CodTipoSolicitacao,
      Descricao: params.Descricao ?? this.Descricao,
      Ativo: params.Ativo ?? this.Ativo,
    });
  }

  static fromObject(object: any): ExpedicaoTipoSolicitacaoDto {
    return new ExpedicaoTipoSolicitacaoDto({
      CodTipoSolicitacao: object.CodTipoSolicitacao,
      Descricao: object.Descricao,
      Ativo: object.Ativo,
    });
  }

  toJson(): any {
    return {
      CodTipoSolicitacao: this.CodTipoSolicitacao,
      Descricao: this.Descricao,
      Ativo: this.Ativo,
    };
  }
}
