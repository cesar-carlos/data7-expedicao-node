SELECT *
FROM (
SELECT
    se.CodEmpresa,
    se.CodSepararEstoque,
    se.Situacao SepararEstoqueSituacao,
    ise.CodSetorEstoque,
	ese.Descricao DescricaoSetorEstoque,
    prio.CodPrioridade,
	prio.Descricao DescricaoPrioridade,
	prio.Prioridade,
   MAX(tot.QuantidadeItens) QuantidadeItens,
   MAX(tot.QuantidadeItensSeparacao) QuantidadeItensSeparacao,
    SUM(ise.Quantidade) QuantidadeItensSetor,
    SUM(ise.QuantidadeSeparacao) QuantidadeItensSeparacaoSetor,
   (SELECT CASE
        WHEN EXISTS (
          SELECT 1
          FROM Expedicao.CarrinhoPercursoEstagio cpe
          WHERE cpe.Origem = 'SE'
            AND cpe.CodEmpresa = se.CodEmpresa
            AND cpe.CodOrigem = se.CodSepararEstoque
            AND cpe.CodUsuarioInicio = sut.CodUsuario
            AND cpe.Situacao NOT IN ('CANCELADA')
            AND cpe.DataFinalizacao IS NULL
        ) THEN 'S'
        ELSE 'N'
      END
   ) CarrinhosAbertosUsuario,
    sut.CodUsuario,
    sut.NomeUsuario,
    sut.EstacaoSeparacao
FROM Expedicao.ItemSepararEstoque ise
INNER JOIN Expedicao.SepararEstoque se ON
    se.CodEmpresa = ise.CodEmpresa
AND se.CodSepararEstoque = ise.CodSepararEstoque
LEFT JOIN Expedicao.Prioridade prio ON
    prio.CodPrioridade = se.CodPrioridade
INNER JOIN Produto prod ON
    prod.CodProduto = ise.CodProduto
LEFT JOIN Expedicao.SeparacaoUsuarioSetor sut ON
    sut.CodEmpresa = ise.CodEmpresa
AND sut.CodSepararEstoque = ise.CodSepararEstoque
AND sut.CodSetorEstoque = ise.CodSetorEstoque
LEFT JOIN Expedicao.SetorEstoque ese ON
	ese.CodSetorEstoque = ise.CodSetorEstoque
LEFT JOIN (
    SELECT sise.CodEmpresa,
      sise.CodSepararEstoque,
      SUM(sise.Quantidade) QuantidadeItens,
      SUM(sise.QuantidadeSeparacao) QuantidadeItensSeparacao
    FROM Expedicao.ItemSepararEstoque sise
    GROUP BY sise.CodEmpresa,
      sise.CodSepararEstoque
  ) tot ON tot.CodEmpresa = se.CodEmpresa
  AND tot.CodSepararEstoque = se.CodSepararEstoque
GROUP By
    se.CodEmpresa,
    se.CodSepararEstoque,
    se.Situacao,
    ise.CodSetorEstoque,
	ese.Descricao,
    prio.CodPrioridade,
	prio.Descricao,
	prio.Prioridade,
    sut.CodUsuario,
    sut.NomeUsuario,
    sut.EstacaoSeparacao
) SeparacaoUsuarioSetorConsulta
