export default class ExpedicaoTipoOperacaoArmazenagemDto {
  CodEmpresa: number;
  CodTipoOperacaoArmazenagem: number;
  Descricao: string;
  Ativo: string;
  CodPrioridade: number;
  CodRelatorio: number;
  CodLocalArmazenagem: number;
  CodSetorArmazenagem?: number;
  MovimentaEstoque: string;
  CodTipoMovimentoEstoque: number;
  ControlaLote: string;
  ControlaSerie: string;

  constructor(params: {
    CodEmpresa: number;
    CodTipoOperacaoArmazenagem: number;
    Descricao: string;
    Ativo: string;
    CodPrioridade: number;
    CodRelatorio: number;
    CodLocalArmazenagem: number;
    CodSetorArmazenagem?: number;
    MovimentaEstoque: string;
    CodTipoMovimentoEstoque: number;
    ControlaLote: string;
    ControlaSerie: string;
  }) {
    this.CodEmpresa = params.CodEmpresa;
    this.CodTipoOperacaoArmazenagem = params.CodTipoOperacaoArmazenagem;
    this.Descricao = params.Descricao;
    this.Ativo = params.Ativo;
    this.CodPrioridade = params.CodPrioridade;
    this.CodRelatorio = params.CodRelatorio;
    this.CodLocalArmazenagem = params.CodLocalArmazenagem;
    this.CodSetorArmazenagem = params.CodSetorArmazenagem;
    this.MovimentaEstoque = params.MovimentaEstoque;
    this.CodTipoMovimentoEstoque = params.CodTipoMovimentoEstoque;
    this.ControlaLote = params.ControlaLote;
    this.ControlaSerie = params.ControlaSerie;
  }

  public copyWith(params: {
    CodEmpresa: number;
    CodTipoOperacaoArmazenagem: number;
    Descricao: string;
    Ativo: string;
    CodPrioridade: number;
    CodRelatorio: number;
    CodLocalArmazenagem: number;
    CodSetorArmazenagem: number;
    MovimentaEstoque: string;
    CodTipoMovimentoEstoque: number;
    ControlaLote: string;
    ControlaSerie: string;
  }): ExpedicaoTipoOperacaoArmazenagemDto {
    return new ExpedicaoTipoOperacaoArmazenagemDto({
      CodEmpresa: params.CodEmpresa ?? this.CodEmpresa,
      CodTipoOperacaoArmazenagem: params.CodTipoOperacaoArmazenagem ?? this.CodTipoOperacaoArmazenagem,
      Descricao: params.Descricao ?? this.Descricao,
      Ativo: params.Ativo ?? this.Ativo,
      CodPrioridade: params.CodPrioridade ?? this.CodPrioridade,
      CodRelatorio: params.CodRelatorio ?? this.CodRelatorio,
      CodLocalArmazenagem: params.CodLocalArmazenagem ?? this.CodLocalArmazenagem,
      CodSetorArmazenagem: params.CodSetorArmazenagem ?? this.CodSetorArmazenagem,
      MovimentaEstoque: params.MovimentaEstoque ?? this.MovimentaEstoque,
      CodTipoMovimentoEstoque: params.CodTipoMovimentoEstoque ?? this.CodTipoMovimentoEstoque,
      ControlaLote: params.ControlaLote ?? this.ControlaLote,
      ControlaSerie: params.ControlaSerie ?? this.ControlaSerie,
    });
  }

  static fromObject(object: any): ExpedicaoTipoOperacaoArmazenagemDto {
    return new ExpedicaoTipoOperacaoArmazenagemDto({
      CodEmpresa: object.CodEmpresa,
      CodTipoOperacaoArmazenagem: object.CodTipoOperacaoArmazenagem,
      Descricao: object.Descricao,
      Ativo: object.Ativo,
      CodPrioridade: object.CodPrioridade,
      CodRelatorio: object.CodRelatorio,
      CodLocalArmazenagem: object.CodLocalArmazenagem,
      CodSetorArmazenagem: object.CodSetorArmazenagem,
      MovimentaEstoque: object.MovimentaEstoque,
      CodTipoMovimentoEstoque: object.CodTipoMovimentoEstoque,
      ControlaLote: object.ControlaLote,
      ControlaSerie: object.ControlaSerie,
    });
  }

  public toJson(): any {
    return {
      CodEmpresa: this.CodEmpresa,
      CodTipoOperacaoArmazenagem: this.CodTipoOperacaoArmazenagem,
      Descricao: this.Descricao,
      Ativo: this.Ativo,
      CodPrioridade: this.CodPrioridade,
      CodRelatorio: this.CodRelatorio,
      CodLocalArmazenagem: this.CodLocalArmazenagem,
      CodSetorArmazenagem: this.CodSetorArmazenagem,
      MovimentaEstoque: this.MovimentaEstoque,
      CodTipoMovimentoEstoque: this.CodTipoMovimentoEstoque,
      ControlaLote: this.ControlaLote,
      ControlaSerie: this.ControlaSerie,
    };
  }
}
