SELECT *
FROM (
SELECT
	lapp.CodLoginApp,
  lapp.Nome,
	lapp.Ativo,
	lapp.CodUsuario,
	lapp.FotoUsuario,
	co.PermiteSepararForaSequencia,
	co.PermiteConferirForaSequencia,
	co.VisualizaTodasSeparacoes,
	co.VisualizaTodasConferencias,
	co.VisualizaTodasArmazenagem,
	co.CodSetorEstoque,
	co.CodSetorConferencia,
	co.CodSetorArmazenagem,
	co.SalvaCarrinhoOutroUsuario,
	co.EditaCarrinhoOutroUsuario,
	co.ExcluiCarrinhoOutroUsuario,
	co.PermiteDevolverItemEntregaBalcao,
	co.PermiteDevolverItemEmbalagem
FROM Expedicao.LoginApp lapp
LEFT JOIN Usuario u ON
	u.CodUsuario = lapp.CodUsuario
LEFT JOIN CaixaOperador co ON
	co.CodUsuario = lapp.CodUsuario
)LoginAppConsulta
