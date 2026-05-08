SELECT *
FROM (
	SELECT
		ese.CodEmpresa,
		ese.CodSepararEstoque,
		ese.Origem,
		ese.CodOrigem,
		ese.Situacao,
		CASE WHEN ese.Situacao IN('AGUARDANDO') THEN 'S'
			WHEN ese.Situacao IN('SEPARADO') THEN 'N'
			WHEN
				(SELECT COUNT(*)
				 FROM Expedicao.ItemSeparacaoEstoque eise
				 LEFT JOIN Expedicao.CarrinhoPercursoEstagio ecpe ON
		 			ecpe.CodEmpresa = eise.CodEmpresa
				 AND ecpe.CodCarrinhoPercurso = eise.CodCarrinhoPercurso
				 AND ecpe.Item = eise.ItemCarrinhoPercurso
				 WHERE eise.CodEmpresa = ese.CodEmpresa
				 AND eise.CodSepararEstoque = ese.CodSepararEstoque
				 AND ecpe.Situacao NOT IN('SEPARADO', 'AGRUPADO', 'CANCELADA', 'CONFERIDO', 'EMBALADO', 'ENTREGUE')
				 AND eise.Situacao IN('FN')
			) > 0 THEN 'S'
		ELSE 'S' END ProcessoSeparacao,

		COALESCE(SUM(eise.Quantidade), 0.00) QuantidadeItens,
		COALESCE(SUM(eise.QuantidadeSeparacao), 0.00) QuantidadeItensSeparado,
	   (COALESCE(SUM(eise.Quantidade), 0.00) - COALESCE(SUM(eise.QuantidadeSeparacao), 0.00)) QuantidadeItensRestante
	FROM Expedicao.SepararEstoque ese
	LEFT JOIN Expedicao.ItemSepararEstoque eise ON
		eise.CodEmpresa = ese.CodEmpresa
	AND eise.CodSepararEstoque = ese.CodSepararEstoque
	GROUP BY
		ese.CodEmpresa,
		ese.CodSepararEstoque,
		ese.Origem,
		ese.CodOrigem,
		ese.Situacao
) ProgressoSeparacaoConsulta
