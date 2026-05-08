SELECT *
FROM (
    SELECT ise.CodEmpresa,
      ise.CodSepararEstoque,
      ise.CodCarrinhoPercurso,
      ise.ItemCarrinhoPercurso,
      cpe.Situacao,
      cp.Origem,
      cp.CodOrigem,
      se.CodPrioridade,
      prio.Descricao NomePrioridade,
      cpe.CodCarrinho,
      cart.Descricao NomeCarrinho,
      cart.CodigoBarras CodigoBarrasCarrinho,
      cart.Situacao SituacaoCarrinho,
	    eise.CodLocalArmazenagem CodLocalArmazenagem,
      ise.CodProduto,
      prod.Nome NomeProduto,
      ise.CodUnidadeMedida,
      und.Descricao NomeUnidadeMedida,
      prod.CodGrupoProduto,
      gp.Nome NomeGrupoProduto,
      prod.CodMarca,
      m.Nome NomeMarca,
      eise.CodSetorEstoque,
      st.Descricao NomeSetorEstoque,
      prod.CodigoBarras1 CodigoBarras,
      prod.CodigoBarras2 CodigoBarras2,
      prod.CodigoReferencia,
      prod.CodigoFornecedor,
      prod.CodigoFabricante,
      prod.CodigoOriginal,
      prod.Endereco,
      pe.Descricao EnderecoDescricao,
      SUM(COALESCE(ise.Quantidade, 0)) QuantidadeSeparacao,
      se.Historico,
      se.Observacao
    FROM Expedicao.ItemSeparacaoEstoque ise
    INNER JOIN Expedicao.ItemSepararEstoque eise ON
		eise.CodEmpresa = ise.CodEmpresa
    AND eise.CodSepararEstoque = ise.CodSepararEstoque
    AND eise.CodProduto = ise.CodProduto
    INNER JOIN Expedicao.SepararEstoque se ON
		se.CodEmpresa = ise.CodEmpresa
    AND se.CodSepararEstoque = ise.CodSepararEstoque
    LEFT JOIN Expedicao.Prioridade prio ON
		prio.CodPrioridade = se.CodPrioridade
    INNER JOIN Expedicao.CarrinhoPercursoEstagio cpe ON
		cpe.CodEmpresa = ise.CodEmpresa
    AND cpe.CodCarrinhoPercurso = ise.CodCarrinhoPercurso
    AND cpe.Item = ise.ItemCarrinhoPercurso
    INNER JOIN Expedicao.CarrinhoPercurso cp ON
		cp.CodEmpresa = cpe.CodEmpresa
    AND cp.CodCarrinhoPercurso = cpe.CodCarrinhoPercurso
    INNER JOIN Expedicao.Carrinho cart ON
		cart.CodEmpresa = cpe.CodEmpresa
    AND cart.CodCarrinho = cpe.CodCarrinho
    INNER JOIN Produto prod ON
		prod.CodProduto = ise.CodProduto
    LEFT JOIN ProdutoEndereco pe ON
		pe.CodProdutoEndereco = prod.Endereco
    INNER JOIN UnidadeMedida und ON
		und.CodUnidadeMedida = prod.CodUnidadeMedida
    LEFT JOIN GrupoProduto gp ON
		gp.CodGrupoProduto = prod.CodGrupoProduto
    LEFT JOIN Marca m ON
		m.CodMarca = prod.CodMarca
    LEFT JOIN Expedicao.SetorEstoque st ON
		st.CodSetorEstoque = eise.CodSetorEstoque
    GROUP BY ise.CodEmpresa,
		ise.CodSepararEstoque,
		ise.CodCarrinhoPercurso,
		ise.ItemCarrinhoPercurso,
		cpe.Situacao,
		cp.Origem,
		cp.CodOrigem,
		se.CodPrioridade,
		prio.Descricao,
		cpe.CodCarrinho,
		cart.Descricao,
		cart.CodigoBarras,
		cart.Situacao,
		eise.CodLocalArmazenagem,
		ise.CodProduto,
		prod.Nome,
		ise.CodUnidadeMedida,
		und.Descricao,
		prod.CodGrupoProduto,
		gp.Nome,
		prod.CodMarca,
		m.Nome,
		eise.CodSetorEstoque,
		st.Descricao,
		prod.CodigoBarras1,
		prod.CodigoBarras2,
		prod.CodigoReferencia,
		prod.CodigoFornecedor,
		prod.CodigoFabricante,
		prod.CodigoOriginal,
		prod.Endereco,
		pe.Descricao,
		se.Historico,
		se.Observacao
  ) ConferirSeparacaoItemConsulta
