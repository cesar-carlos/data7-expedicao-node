export default class ExpedicaoTipoOperacaoExpedicaoDto {
  CodEmpresa: number;
  CodTipoOperacaoExpedicao: number;
  Descricao: string;
  Ativo: string;
  Tipo: string;
  CodSetorConferencia?: number;
  CodPrioridade?: number;
  CodRelatorio: number;
  CodLocalArmazenagem: number;
  MovimentaEstoque: string;
  CodTipoMovimentoEstoque: number;
  FazerConferencia: string;
  FazerArmazenamento: string;
  ControlaLote: string;
  ControlaNumeroSerie: string;

  constructor(params: {
    CodEmpresa: number;
    CodTipoOperacaoExpedicao: number;
    Descricao: string;
    Ativo: string;
    Tipo: string;
    CodSetorConferencia?: number;
    CodPrioridade?: number;
    CodRelatorio: number;
    CodLocalArmazenagem: number;
    MovimentaEstoque: string;
    CodTipoMovimentoEstoque: number;
    FazerConferencia: string;
    FazerArmazenamento: string;
    ControlaLote: string;
    ControlaNumeroSerie: string;
  }) {
    this.CodEmpresa = params.CodEmpresa;
    this.CodTipoOperacaoExpedicao = params.CodTipoOperacaoExpedicao;
    this.Descricao = params.Descricao;
    this.Ativo = params.Ativo;
    this.Tipo = params.Tipo;
    this.CodSetorConferencia = params.CodSetorConferencia;
    this.CodPrioridade = params.CodPrioridade;
    this.CodRelatorio = params.CodRelatorio;
    this.CodLocalArmazenagem = params.CodLocalArmazenagem;
    this.MovimentaEstoque = params.MovimentaEstoque;
    this.CodTipoMovimentoEstoque = params.CodTipoMovimentoEstoque;
    this.FazerConferencia = params.FazerConferencia;
    this.FazerArmazenamento = params.FazerArmazenamento;
    this.ControlaLote = params.ControlaLote;
    this.ControlaNumeroSerie = params.ControlaNumeroSerie;
  }

  public copyWith(params: {
    CodEmpresa: number;
    CodTipoOperacaoExpedicao: number;
    Descricao: string;
    Ativo: string;
    Tipo: string;
    CodSetorConferencia: number;
    CodPrioridade: number;
    CodRelatorio: number;
    CodLocalArmazenagem: number;
    MovimentaEstoque: string;
    CodTipoMovimentoEstoque: number;
    FazerConferencia: string;
    FazerArmazenamento: string;
    ControlaLote: string;
    ControlaNumeroSerie: string;
  }): ExpedicaoTipoOperacaoExpedicaoDto {
    return new ExpedicaoTipoOperacaoExpedicaoDto({
      CodEmpresa: params.CodEmpresa ?? this.CodEmpresa,
      CodTipoOperacaoExpedicao: params.CodTipoOperacaoExpedicao ?? this.CodTipoOperacaoExpedicao,
      Descricao: params.Descricao ?? this.Descricao,
      Ativo: params.Ativo ?? this.Ativo,
      Tipo: params.Tipo ?? this.Tipo,
      CodSetorConferencia: params.CodSetorConferencia ?? this.CodSetorConferencia,
      CodPrioridade: params.CodPrioridade ?? this.CodPrioridade,
      CodRelatorio: params.CodRelatorio ?? this.CodRelatorio,
      CodLocalArmazenagem: params.CodLocalArmazenagem ?? this.CodLocalArmazenagem,
      MovimentaEstoque: params.MovimentaEstoque ?? this.MovimentaEstoque,
      CodTipoMovimentoEstoque: params.CodTipoMovimentoEstoque ?? this.CodTipoMovimentoEstoque,
      FazerConferencia: params.FazerConferencia ?? this.FazerConferencia,
      FazerArmazenamento: params.FazerArmazenamento ?? this.FazerArmazenamento,
      ControlaLote: params.ControlaLote ?? this.ControlaLote,
      ControlaNumeroSerie: params.ControlaNumeroSerie ?? this.ControlaNumeroSerie,
    });
  }

  static fromObject(object: any): ExpedicaoTipoOperacaoExpedicaoDto {
    return new ExpedicaoTipoOperacaoExpedicaoDto({
      CodEmpresa: object.CodEmpresa,
      CodTipoOperacaoExpedicao: object.CodTipoOperacaoExpedicao,
      Descricao: object.Descricao,
      Ativo: object.Ativo,
      Tipo: object.Tipo,
      CodSetorConferencia: object.CodSetorConferencia,
      CodPrioridade: object.CodPrioridade,
      CodRelatorio: object.CodRelatorio,
      CodLocalArmazenagem: object.CodLocalArmazenagem,
      MovimentaEstoque: object.MovimentaEstoque,
      CodTipoMovimentoEstoque: object.CodTipoMovimentoEstoque,
      FazerConferencia: object.FazerConferencia,
      FazerArmazenamento: object.FazerArmazenamento,
      ControlaLote: object.ControlaLote,
      ControlaNumeroSerie: object.ControlaNumeroSerie,
    });
  }

  toJson(): any {
    return {
      CodEmpresa: this.CodEmpresa,
      CodTipoOperacaoExpedicao: this.CodTipoOperacaoExpedicao,
      Descricao: this.Descricao,
      Ativo: this.Ativo,
      Tipo: this.Tipo,
      CodSetorConferencia: this.CodSetorConferencia,
      CodPrioridade: this.CodPrioridade,
      CodRelatorio: this.CodRelatorio,
      CodLocalArmazenagem: this.CodLocalArmazenagem,
      MovimentaEstoque: this.MovimentaEstoque,
      CodTipoMovimentoEstoque: this.CodTipoMovimentoEstoque,
      FazerConferencia: this.FazerConferencia,
      FazerArmazenamento: this.FazerArmazenamento,
      ControlaLote: this.ControlaLote,
      ControlaNumeroSerie: this.ControlaNumeroSerie,
    };
  }
}
