export default class ExpedicaoLoginAppDtoConsulta {
  CodLoginApp: number;
  Ativo: string;
  Nome: string;
  CodUsuario?: number;
  PermiteSepararForaSequencia?: string;
  PermiteConferirForaSequencia?: string;
  VisualizaTodasSeparacoes?: string;
  VisualizaTodasConferencias?: string;
  VisualizaTodasArmazenagem?: string;
  CodSetorEstoque?: number;
  CodSetorConferencia?: number;
  CodSetorArmazenagem?: number;
  SalvaCarrinhoOutroUsuario?: string;
  EditaCarrinhoOutroUsuario?: string;
  ExcluiCarrinhoOutroUsuario?: string;
  PermiteDevolverItemEntregaBalcao?: string;
  PermiteDevolverItemEmbalagem?: string;

  constructor(params: {
    CodLoginApp: number;
    Ativo: string;
    Nome: string;
    CodUsuario?: number;
    PermiteSepararForaSequencia?: string;
    PermiteConferirForaSequencia?: string;
    VisualizaTodasSeparacoes?: string;
    VisualizaTodasConferencias?: string;
    VisualizaTodasArmazenagem?: string;
    CodSetorEstoque?: number;
    CodSetorConferencia?: number;
    CodSetorArmazenagem?: number;
    SalvaCarrinhoOutroUsuario?: string;
    EditaCarrinhoOutroUsuario?: string;
    ExcluiCarrinhoOutroUsuario?: string;
    PermiteDevolverItemEntregaBalcao?: string;
    PermiteDevolverItemEmbalagem?: string;
  }) {
    this.CodLoginApp = params.CodLoginApp;
    this.Ativo = params.Ativo;
    this.Nome = params.Nome;
    this.CodUsuario = params.CodUsuario;
    this.PermiteSepararForaSequencia = params.PermiteSepararForaSequencia;
    this.PermiteConferirForaSequencia = params.PermiteConferirForaSequencia;
    this.VisualizaTodasSeparacoes = params.VisualizaTodasSeparacoes;
    this.VisualizaTodasConferencias = params.VisualizaTodasConferencias;
    this.VisualizaTodasArmazenagem = params.VisualizaTodasArmazenagem;
    this.CodSetorEstoque = params.CodSetorEstoque;
    this.CodSetorConferencia = params.CodSetorConferencia;
    this.CodSetorArmazenagem = params.CodSetorArmazenagem;
    this.SalvaCarrinhoOutroUsuario = params.SalvaCarrinhoOutroUsuario;
    this.EditaCarrinhoOutroUsuario = params.EditaCarrinhoOutroUsuario;
    this.ExcluiCarrinhoOutroUsuario = params.ExcluiCarrinhoOutroUsuario;
    this.PermiteDevolverItemEntregaBalcao = params.PermiteDevolverItemEntregaBalcao;
    this.PermiteDevolverItemEmbalagem = params.PermiteDevolverItemEmbalagem;
  }

  public copyWith(params: {
    CodLoginApp?: number;
    Ativo?: string;
    Nome?: string;
    CodUsuario?: number;
    PermiteSepararForaSequencia?: string;
    PermiteConferirForaSequencia?: string;
    VisualizaTodasSeparacoes?: string;
    VisualizaTodasConferencias?: string;
    VisualizaTodasArmazenagem?: string;
    CodSetorEstoque?: number;
    CodSetorConferencia?: number;
    CodSetorArmazenagem?: number;
    SalvaCarrinhoOutroUsuario?: string;
    EditaCarrinhoOutroUsuario?: string;
    ExcluiCarrinhoOutroUsuario?: string;
    PermiteDevolverItemEntregaBalcao?: string;
    PermiteDevolverItemEmbalagem?: string;
  }) {
    return new ExpedicaoLoginAppDtoConsulta({
      CodLoginApp: params.CodLoginApp ?? this.CodLoginApp,
      Ativo: params.Ativo ?? this.Ativo,
      Nome: params.Nome ?? this.Nome,
      CodUsuario: params.CodUsuario ?? this.CodUsuario,
      PermiteSepararForaSequencia: params.PermiteSepararForaSequencia ?? this.PermiteSepararForaSequencia,
      PermiteConferirForaSequencia: params.PermiteConferirForaSequencia ?? this.PermiteConferirForaSequencia,
      VisualizaTodasSeparacoes: params.VisualizaTodasSeparacoes ?? this.VisualizaTodasSeparacoes,
      VisualizaTodasConferencias: params.VisualizaTodasConferencias ?? this.VisualizaTodasConferencias,
      VisualizaTodasArmazenagem: params.VisualizaTodasArmazenagem ?? this.VisualizaTodasArmazenagem,
      CodSetorEstoque: params.CodSetorEstoque ?? this.CodSetorEstoque,
      CodSetorConferencia: params.CodSetorConferencia ?? this.CodSetorConferencia,
      CodSetorArmazenagem: params.CodSetorArmazenagem ?? this.CodSetorArmazenagem,
      SalvaCarrinhoOutroUsuario: params.SalvaCarrinhoOutroUsuario ?? this.SalvaCarrinhoOutroUsuario,
      EditaCarrinhoOutroUsuario: params.EditaCarrinhoOutroUsuario ?? this.EditaCarrinhoOutroUsuario,
      ExcluiCarrinhoOutroUsuario: params.ExcluiCarrinhoOutroUsuario ?? this.ExcluiCarrinhoOutroUsuario,
      PermiteDevolverItemEntregaBalcao:
        params.PermiteDevolverItemEntregaBalcao ?? this.PermiteDevolverItemEntregaBalcao,
      PermiteDevolverItemEmbalagem: params.PermiteDevolverItemEmbalagem ?? this.PermiteDevolverItemEmbalagem,
    });
  }

  public static fromObject(json: any): ExpedicaoLoginAppDtoConsulta {
    return new ExpedicaoLoginAppDtoConsulta({
      CodLoginApp: json.CodLoginApp,
      Ativo: json.Ativo,
      Nome: json.Nome,
      CodUsuario: json.CodUsuario,
      PermiteSepararForaSequencia: json.PermiteSepararForaSequencia,
      PermiteConferirForaSequencia: json.PermiteConferirForaSequencia,
      VisualizaTodasSeparacoes: json.VisualizaTodasSeparacoes,
      VisualizaTodasConferencias: json.VisualizaTodasConferencias,
      VisualizaTodasArmazenagem: json.VisualizaTodasArmazenagem,
      CodSetorEstoque: json.CodSetorEstoque,
      CodSetorConferencia: json.CodSetorConferencia,
      CodSetorArmazenagem: json.CodSetorArmazenagem,
      SalvaCarrinhoOutroUsuario: json.SalvaCarrinhoOutroUsuario,
      EditaCarrinhoOutroUsuario: json.EditaCarrinhoOutroUsuario,
      ExcluiCarrinhoOutroUsuario: json.ExcluiCarrinhoOutroUsuario,
      PermiteDevolverItemEntregaBalcao: json.PermiteDevolverItemEntregaBalcao,
      PermiteDevolverItemEmbalagem: json.PermiteDevolverItemEmbalagem,
    });
  }

  toJson(): any {
    return {
      CodLoginApp: this.CodLoginApp,
      Ativo: this.Ativo,
      Nome: this.Nome,
      CodUsuario: this.CodUsuario,
      PermiteSepararForaSequencia: this.PermiteSepararForaSequencia,
      PermiteConferirForaSequencia: this.PermiteConferirForaSequencia,
      VisualizaTodasSeparacoes: this.VisualizaTodasSeparacoes,
      VisualizaTodasConferencias: this.VisualizaTodasConferencias,
      VisualizaTodasArmazenagem: this.VisualizaTodasArmazenagem,
      CodSetorEstoque: this.CodSetorEstoque,
      CodSetorConferencia: this.CodSetorConferencia,
      CodSetorArmazenagem: this.CodSetorArmazenagem,
      SalvaCarrinhoOutroUsuario: this.SalvaCarrinhoOutroUsuario,
      EditaCarrinhoOutroUsuario: this.EditaCarrinhoOutroUsuario,
      ExcluiCarrinhoOutroUsuario: this.ExcluiCarrinhoOutroUsuario,
      PermiteDevolverItemEntregaBalcao: this.PermiteDevolverItemEntregaBalcao,
      PermiteDevolverItemEmbalagem: this.PermiteDevolverItemEmbalagem,
    };
  }
}
