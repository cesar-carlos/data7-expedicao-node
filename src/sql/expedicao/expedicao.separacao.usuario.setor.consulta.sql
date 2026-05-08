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
   (SELECT SUM(sise.Quantidade)
    FROM Expedicao.ItemSepararEstoque sise
    WHERE sise.CodEmpresa = se.CodEmpresa
    AND sise.CodSepararEstoque = se.CodSepararEstoque)
    QuantidadeItens,
   (SELECT SUM(sise.QuantidadeSeparacao)
    FROM Expedicao.ItemSepararEstoque sise
    WHERE sise.CodEmpresa = se.CodEmpresa
      AND sise.CodSepararEstoque = se.CodSepararEstoque
   )QuantidadeItensSeparacao,
    SUM(ise.Quantidade) QuantidadeItensSetor,
    SUM(ise.QuantidadeSeparacao) QuantidadeItensSeparacaoSetor,
   (SELECT CASE WHEN COUNT(*) > 0 THEN 'S' ELSE 'N' END
    FROM Expedicao.CarrinhoPercursoEstagio cpe
    WHERE cpe.CodEmpresa = se.CodEmpresa
      AND cpe.CodOrigem = se.CodSepararEstoque
      AND cpe.CodUsuarioInicio = sut.CodUsuario
      AND cpe.Situacao NOT IN ('CANCELADA')
	  AND cpe.DataFinalizacao IS NULL
	  AND cpe.Origem = 'SE'
   )CarrinhosAbertosUsuario,
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
