export default class UsuarioConsultaDto {
  readonly CodUsuario: number;
  readonly NomeUsuario: string;
  readonly Ativo: string;
  readonly CodEmpresa?: number;
  readonly NomeEmpresa?: string;
  readonly CodVendedor?: number;
  readonly NomeVendedor?: string;
  readonly CodLocalArmazenagem?: number;
  readonly NomeLocalArmazenagem?: string;
  readonly CodContaFinanceira?: string;
  readonly NomeContaFinanceira?: string;
  readonly NomeCaixaOperador?: string;
  readonly CodSetorEstoque?: number;
  readonly NomeSetorEstoque?: string;
  readonly PermiteSepararForaSequencia: string;
  readonly VisualizaTodasSeparacoes: string;
  readonly ExpedicaoObrigaEscanearPrateleira: string;
  readonly CodSetorConferencia?: number;
  readonly NomeSetorConferencia?: string;
  readonly PermiteConferirForaSequencia: string;
  readonly VisualizaTodasConferencias: string;
  readonly CodSetorArmazenagem?: number;
  readonly NomeSetorArmazenagem?: string;
  readonly PermiteArmazenarForaSequencia: string;
  readonly VisualizaTodasArmazenagem: string;
  readonly EditaCarrinhoOutroUsuario: string;
  readonly SalvaCarrinhoOutroUsuario: string;
  readonly ExcluiCarrinhoOutroUsuario: string;
  readonly ExpedicaoEntregaBalcaoPreVenda: string;
  readonly CodLoginApp?: number;

  constructor(params: {
    CodUsuario: number;
    NomeUsuario: string;
    Ativo: string;
    CodEmpresa?: number;
    NomeEmpresa?: string;
    CodVendedor?: number;
    NomeVendedor?: string;
    CodLocalArmazenagem?: number;
    NomeLocalArmazenagem?: string;
    CodContaFinanceira?: string;
    NomeContaFinanceira?: string;
    NomeCaixaOperador?: string;
    CodSetorEstoque?: number;
    NomeSetorEstoque?: string;
    PermiteSepararForaSequencia: string;
    VisualizaTodasSeparacoes: string;
    ExpedicaoObrigaEscanearPrateleira: string;
    CodSetorConferencia?: number;
    NomeSetorConferencia?: string;
    PermiteConferirForaSequencia: string;
    VisualizaTodasConferencias: string;
    CodSetorArmazenagem?: number;
    NomeSetorArmazenagem?: string;
    PermiteArmazenarForaSequencia: string;
    VisualizaTodasArmazenagem: string;
    EditaCarrinhoOutroUsuario: string;
    SalvaCarrinhoOutroUsuario: string;
    ExcluiCarrinhoOutroUsuario: string;
    ExpedicaoEntregaBalcaoPreVenda: string;
    CodLoginApp?: number;
  }) {
    this.CodUsuario = params.CodUsuario;
    this.NomeUsuario = params.NomeUsuario;
    this.Ativo = params.Ativo;
    this.CodEmpresa = params.CodEmpresa;
    this.NomeEmpresa = params.NomeEmpresa;
    this.CodVendedor = params.CodVendedor;
    this.NomeVendedor = params.NomeVendedor;
    this.CodLocalArmazenagem = params.CodLocalArmazenagem;
    this.NomeLocalArmazenagem = params.NomeLocalArmazenagem;
    this.CodContaFinanceira = params.CodContaFinanceira;
    this.NomeContaFinanceira = params.NomeContaFinanceira;
    this.NomeCaixaOperador = params.NomeCaixaOperador;
    this.CodSetorEstoque = params.CodSetorEstoque;
    this.NomeSetorEstoque = params.NomeSetorEstoque;
    this.PermiteSepararForaSequencia = params.PermiteSepararForaSequencia;
    this.VisualizaTodasSeparacoes = params.VisualizaTodasSeparacoes;
    this.ExpedicaoObrigaEscanearPrateleira = params.ExpedicaoObrigaEscanearPrateleira;
    this.CodSetorConferencia = params.CodSetorConferencia;
    this.NomeSetorConferencia = params.NomeSetorConferencia;
    this.PermiteConferirForaSequencia = params.PermiteConferirForaSequencia;
    this.VisualizaTodasConferencias = params.VisualizaTodasConferencias;
    this.CodSetorArmazenagem = params.CodSetorArmazenagem;
    this.NomeSetorArmazenagem = params.NomeSetorArmazenagem;
    this.PermiteArmazenarForaSequencia = params.PermiteArmazenarForaSequencia;
    this.VisualizaTodasArmazenagem = params.VisualizaTodasArmazenagem;
    this.EditaCarrinhoOutroUsuario = params.EditaCarrinhoOutroUsuario;
    this.SalvaCarrinhoOutroUsuario = params.SalvaCarrinhoOutroUsuario;
    this.ExcluiCarrinhoOutroUsuario = params.ExcluiCarrinhoOutroUsuario;
    this.ExpedicaoEntregaBalcaoPreVenda = params.ExpedicaoEntregaBalcaoPreVenda;
    this.CodLoginApp = params.CodLoginApp;
  }

  static fromObject(object: any) {
    return new UsuarioConsultaDto({
      CodUsuario: object.CodUsuario || object.codUsuario,
      NomeUsuario: object.NomeUsuario || object.nomeUsuario,
      Ativo: object.Ativo || object.ativo,
      CodEmpresa: object.CodEmpresa || object.codEmpresa,
      NomeEmpresa: object.NomeEmpresa || object.nomeEmpresa,
      CodVendedor: object.CodVendedor || object.codVendedor,
      NomeVendedor: object.NomeVendedor || object.nomeVendedor,
      CodLocalArmazenagem: object.CodLocalArmazenagem || object.codLocalArmazenagem,
      NomeLocalArmazenagem: object.NomeLocalArmazenagem || object.nomeLocalArmazenagem,
      CodContaFinanceira: object.CodContaFinanceira || object.codContaFinanceira,
      NomeContaFinanceira: object.NomeContaFinanceira || object.nomeContaFinanceira,
      NomeCaixaOperador: object.NomeCaixaOperador || object.nomeCaixaOperador,
      CodSetorEstoque: object.CodSetorEstoque || object.codSetorEstoque,
      NomeSetorEstoque: object.NomeSetorEstoque || object.nomeSetorEstoque,
      PermiteSepararForaSequencia: object.PermiteSepararForaSequencia || object.permiteSepararForaSequencia || '',
      VisualizaTodasSeparacoes: object.VisualizaTodasSeparacoes || object.visualizaTodasSeparacoes || '',
      ExpedicaoObrigaEscanearPrateleira:
        object.ExpedicaoObrigaEscanearPrateleira || object.expedicaoObrigaEscanearPrateleira || 'N',
      CodSetorConferencia: object.CodSetorConferencia || object.codSetorConferencia,
      NomeSetorConferencia: object.NomeSetorConferencia || object.nomeSetorConferencia,
      PermiteConferirForaSequencia: object.PermiteConferirForaSequencia || object.permiteConferirForaSequencia || '',
      VisualizaTodasConferencias: object.VisualizaTodasConferencias || object.visualizaTodasConferencias || '',
      CodSetorArmazenagem: object.CodSetorArmazenagem || object.codSetorArmazenagem,
      NomeSetorArmazenagem: object.NomeSetorArmazenagem || object.nomeSetorArmazenagem,
      PermiteArmazenarForaSequencia: object.PermiteArmazenarForaSequencia || object.permiteArmazenarForaSequencia || '',
      VisualizaTodasArmazenagem: object.VisualizaTodasArmazenagem || object.visualizaTodasArmazenagem || '',
      EditaCarrinhoOutroUsuario: object.EditaCarrinhoOutroUsuario || object.editaCarrinhoOutroUsuario || '',
      SalvaCarrinhoOutroUsuario: object.SalvaCarrinhoOutroUsuario || object.salvaCarrinhoOutroUsuario || '',
      ExcluiCarrinhoOutroUsuario: object.ExcluiCarrinhoOutroUsuario || object.excluiCarrinhoOutroUsuario || '',
      ExpedicaoEntregaBalcaoPreVenda:
        object.ExpedicaoEntregaBalcaoPreVenda || object.expedicaoEntregaBalcaoPreVenda || '',
      CodLoginApp: object.CodLoginApp || object.codLoginApp,
    });
  }

  public toJson(): any {
    return {
      CodUsuario: this.CodUsuario,
      NomeUsuario: this.NomeUsuario,
      Ativo: this.Ativo,
      CodEmpresa: this.CodEmpresa ?? null,
      NomeEmpresa: this.NomeEmpresa ?? null,
      CodVendedor: this.CodVendedor ?? null,
      NomeVendedor: this.NomeVendedor ?? null,
      CodLocalArmazenagem: this.CodLocalArmazenagem ?? null,
      NomeLocalArmazenagem: this.NomeLocalArmazenagem ?? null,
      CodContaFinanceira: this.CodContaFinanceira ?? null,
      NomeContaFinanceira: this.NomeContaFinanceira ?? null,
      NomeCaixaOperador: this.NomeCaixaOperador ?? null,
      CodSetorEstoque: this.CodSetorEstoque ?? null,
      NomeSetorEstoque: this.NomeSetorEstoque ?? null,
      PermiteSepararForaSequencia: this.PermiteSepararForaSequencia,
      VisualizaTodasSeparacoes: this.VisualizaTodasSeparacoes,
      ExpedicaoObrigaEscanearPrateleira: this.ExpedicaoObrigaEscanearPrateleira,
      CodSetorConferencia: this.CodSetorConferencia ?? null,
      NomeSetorConferencia: this.NomeSetorConferencia ?? null,
      PermiteConferirForaSequencia: this.PermiteConferirForaSequencia,
      VisualizaTodasConferencias: this.VisualizaTodasConferencias,
      CodSetorArmazenagem: this.CodSetorArmazenagem ?? null,
      NomeSetorArmazenagem: this.NomeSetorArmazenagem ?? null,
      PermiteArmazenarForaSequencia: this.PermiteArmazenarForaSequencia,
      VisualizaTodasArmazenagem: this.VisualizaTodasArmazenagem,
      EditaCarrinhoOutroUsuario: this.EditaCarrinhoOutroUsuario,
      SalvaCarrinhoOutroUsuario: this.SalvaCarrinhoOutroUsuario,
      ExcluiCarrinhoOutroUsuario: this.ExcluiCarrinhoOutroUsuario,
      ExpedicaoEntregaBalcaoPreVenda: this.ExpedicaoEntregaBalcaoPreVenda,
      CodLoginApp: this.CodLoginApp ?? null,
    };
  }
}
