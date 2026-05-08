SELECT *
FROM (
    SELECT
      usa.CodUsuario,
      usa.NomeLegivel NomeUsuario,
      COALESCE(usa.Ativo, 'S') Ativo,
	  co.CodEmpresa,
	  e.Nome NomeEmpresa,
	  co.CodVendedor,
      COALESCE(v.NomeReduzido, v.Nome) NomeVendedor,
      co.CodLocalArmazenagem,
	  la.Nome NomeLocalArmazenagem,
      co.CodContaFinanceira,
      cf.Nome NomeContaFinanceira,
      co.Nome NomeCaixaOperador,
      co.CodSetorEstoque,
      ese.Descricao NomeSetorEstoque,
	  COALESCE(co.PermiteSepararForaSequencia, 'N') PermiteSepararForaSequencia,
	  COALESCE(co.VisualizaTodasSeparacoes, 'N') VisualizaTodasSeparacoes,
	  COALESCE(co.ExpedicaoObrigaEscanearPrateleira, 'N') ExpedicaoObrigaEscanearPrateleira,
      co.CodSetorConferencia,
      esc.Descricao NomeSetorConferencia,
      COALESCE(co.PermiteConferirForaSequencia, 'N') PermiteConferirForaSequencia,
      COALESCE(co.VisualizaTodasConferencias, 'N') VisualizaTodasConferencias,
	  co.CodSetorArmazenagem,
	  esa.Descricao NomeSetorArmazenagem,
	  COALESCE(co.PermiteArmazenarForaSequencia, 'N') PermiteArmazenarForaSequencia,
	  COALESCE(co.VisualizaTodasArmazenagem, 'N') VisualizaTodasArmazenagem,
      COALESCE(co.EditaCarrinhoOutroUsuario, 'N') EditaCarrinhoOutroUsuario,
	  COALESCE(co.SalvaCarrinhoOutroUsuario, 'N') SalvaCarrinhoOutroUsuario,
      COALESCE(co.ExcluiCarrinhoOutroUsuario, 'N') ExcluiCarrinhoOutroUsuario,
	  COALESCE(co.ExpedicaoEntregaBalcaoPreVenda, 'N') ExpedicaoEntregaBalcaoPreVenda,
	  lapp.CodLoginApp
    FROM Usuario usa
      LEFT JOIN CaixaOperador co ON co.CodUsuario = usa.CodUsuario
	  LEFT JOIN Empresa e ON e.CodEmpresa = co.CodEmpresa
      LEFT JOIN Vendedor v ON v.CodVendedor = co.CodVendedor
      LEFT JOIN LocalArmazenagem la ON la.CodLocalArmazenagem = co.CodLocalArmazenagem
      LEFT JOIN Expedicao.SetorEstoque ese ON ese.CodSetorEstoque = co.CodSetorEstoque
      LEFT JOIN Expedicao.SetorConferencia esc ON esc.CodSetorConferencia = co.CodSetorConferencia
	  LEFT JOIN Expedicao.SetorArmazenagem esa ON esa.CodSetorArmazenagem = co.CodSetorArmazenagem
      LEFT JOIN ContaFinanceira cf ON cf.CodContaFinanceira = co.CodContaFinanceira
	  LEFT JOIN Expedicao.LoginApp lapp ON
		lapp.CodUsuario = usa.CodUsuario
	WHERE usa.Grupo = 'N'
) UsuarioConsulta



