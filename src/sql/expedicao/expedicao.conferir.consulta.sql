SELECT *
FROM (
SELECT
	cf.CodEmpresa,
	cf.CodConferir,
	cf.Origem,
	cf.CodOrigem,

   (SELECT TOP 1 CodCarrinhoPercurso
	FROM Expedicao.ItemConferir sic
	WHERE sic.CodEmpresa = cf.CodEmpresa
	  AND sic.CodConferir = cf.CodConferir
	) CodCarrinhoPercurso,

	cf.Situacao,
	cf.Data DataLancamento,
	cf.Hora HoraLancamento,
	se.TipoEntidade,
	se.CodEntidade,
	se.NomeEntidade,
	cf.CodPrioridade,
	pri.Descricao NomePrioridade,
	cf.Historico,
	cf.Observacao
FROM Expedicao.Conferir cf
LEFT JOIN Expedicao.SepararEstoque se ON
	se.CodEmpresa = cf.CodEmpresa
AND se.CodSepararEstoque = cf.CodOrigem
AND cf.Origem = 'SE'
LEFT JOIN Expedicao.Prioridade pri ON
	pri.CodPrioridade = cf.CodPrioridade
) ConferirConsulta
