SELECT *
FROM (
    SELECT
      se.CodEmpresa,
      se.CodSepararEstoque,
      se.Origem,
      se.CodOrigem,
      se.CodTipoOperacaoExpedicao,
      toe.Descricao NomeTipoOperacaoExpedicao,
      se.Situacao,
      se.TipoEntidade,
      se.Data DataEmissao,
      se.Hora HoraEmissao,
      se.CodEntidade,
      se.NomeEntidade,
      se.CodPrioridade,
      pri.Descricao NomePrioridade,
	 (SELECT STRING_AGG(sub.CodSetorEstoque, ',')
	  FROM(SELECT seise.CodSetorEstoque
		   FROM Expedicao.ItemSepararEstoque seise
		   WHERE seise.CodEmpresa = se.CodEmpresa
		     AND seise.CodSepararEstoque = se.CodSepararEstoque
		   GROUP BY seise.CodEmpresa, seise.CodSepararEstoque, seise.CodSetorEstoque
		) sub
	 )CodSetoresEstoque,
	 (SELECT STRING_AGG(subu.CodUsuario, ',')
	  FROM(SELECT esus.CodUsuario
		   FROM Expedicao.SeparacaoUsuarioSetor esus
		   WHERE esus.CodEmpresa = se.CodEmpresa
			 AND esus.CodSepararEstoque = se.CodSepararEstoque
		   GROUP BY esus.CodEmpresa, esus.CodSepararEstoque, esus.CodUsuario
	   ) subu
	  )CodUsuariosSeparacao,
      se.Historico,
      se.Observacao
    FROM Expedicao.SepararEstoque se
    INNER JOIN Expedicao.TipoOperacaoExpedicao toe ON
		toe.CodEmpresa = se.CodEmpresa
      AND toe.CodTipoOperacaoExpedicao = se.CodTipoOperacaoExpedicao
    INNER JOIN Expedicao.Prioridade pri ON
		pri.CodPrioridade = se.CodPrioridade
  ) SepararConsulta



