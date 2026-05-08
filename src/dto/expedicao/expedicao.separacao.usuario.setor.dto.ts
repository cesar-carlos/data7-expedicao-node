export default class ExpedicaoSeparacaoUsuarioSetorDto {
  CodEmpresa: number;
  CodSepararEstoque: number;
  Item: string;
  CodSetorEstoque: number;
  DataLancamento: Date;
  HoraLancamento: string;
  CodUsuario: number;
  NomeUsuario: string;
  EstacaoSeparacao: string;

  constructor(params: {
    CodEmpresa: number;
    CodSepararEstoque: number;
    Item: string;
    CodSetorEstoque: number;
    DataLancamento: Date;
    HoraLancamento: string;
    CodUsuario: number;
    NomeUsuario: string;
    EstacaoSeparacao: string;
  }) {
    this.CodEmpresa = params.CodEmpresa;
    this.CodSepararEstoque = params.CodSepararEstoque;
    this.Item = params.Item;
    this.CodSetorEstoque = params.CodSetorEstoque;
    this.DataLancamento = params.DataLancamento;
    this.HoraLancamento = params.HoraLancamento;
    this.CodUsuario = params.CodUsuario;
    this.NomeUsuario = params.NomeUsuario;
    this.EstacaoSeparacao = params.EstacaoSeparacao;
  }

  public copyWith(params: {
    CodEmpresa?: number;
    CodSepararEstoque?: number;
    Item?: string;
    CodSetorEstoque?: number;
    DataLancamento?: Date;
    HoraLancamento?: string;
    CodUsuario?: number;
    NomeUsuario?: string;
    EstacaoSeparacao?: string;
  }): ExpedicaoSeparacaoUsuarioSetorDto {
    return new ExpedicaoSeparacaoUsuarioSetorDto({
      CodEmpresa: params.CodEmpresa ?? this.CodEmpresa,
      CodSepararEstoque: params.CodSepararEstoque ?? this.CodSepararEstoque,
      Item: params.Item ?? this.Item,
      CodSetorEstoque: params.CodSetorEstoque ?? this.CodSetorEstoque,
      DataLancamento: params.DataLancamento ?? this.DataLancamento,
      HoraLancamento: params.HoraLancamento ?? this.HoraLancamento,
      CodUsuario: params.CodUsuario ?? this.CodUsuario,
      NomeUsuario: params.NomeUsuario ?? this.NomeUsuario,
      EstacaoSeparacao: params.EstacaoSeparacao ?? this.EstacaoSeparacao,
    });
  }

  static fromObject(object: any): ExpedicaoSeparacaoUsuarioSetorDto {
    return new ExpedicaoSeparacaoUsuarioSetorDto({
      CodEmpresa: object.CodEmpresa,
      CodSepararEstoque: object.CodSepararEstoque,
      Item: object.Item,
      CodSetorEstoque: object.CodSetorEstoque,
      DataLancamento: object.DataLancamento,
      HoraLancamento: object.HoraLancamento,
      CodUsuario: object.CodUsuario,
      NomeUsuario: object.NomeUsuario,
      EstacaoSeparacao: object.EstacaoSeparacao,
    });
  }

  toJson(): any {
    return {
      CodEmpresa: this.CodEmpresa,
      CodSepararEstoque: this.CodSepararEstoque,
      Item: this.Item,
      CodSetorEstoque: this.CodSetorEstoque,
      DataLancamento: this.DataLancamento,
      HoraLancamento: this.HoraLancamento,
      CodUsuario: this.CodUsuario,
      NomeUsuario: this.NomeUsuario,
      EstacaoSeparacao: this.EstacaoSeparacao,
    };
  }
}
