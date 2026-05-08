SELECT *
FROM(
    SELECT ice.CodEmpresa,
      ice.CodConferir,
      ice.Item,
      cf.Origem,
      cf.CodOrigem,
      ice.CodCarrinhoPercurso,
      ice.ItemCarrinhoPercurso,
	  cpe.Situacao SituacaoCarrinhoPercurso,
      cpe.CodCarrinho,
      cart.Descricao NomeCarrinho,
      ice.CodProduto,
      prod.Nome NomeProduto,
      ice.CodUnidadeMedida,
      und.Descricao NomeUnidadeMedida,
      prod.CodGrupoProduto,
      gp.Nome NomeGrupoProduto,
      prod.CodMarca,
      m.Nome NomeMarca,
      prod.CodSetorEstoque,
      se.Descricao NomeSetorEstoque,
      prod.CodigoBarras1 CodigoBarras,
      prod.CodigoBarras2 CodigoBarras2,
      prod.CodigoReferencia,
      prod.CodigoFornecedor,
      prod.CodigoFabricante,
      prod.CodigoOriginal,
      prod.Endereco,
      pe.Descricao EnderecoDescricao,
      ice.Quantidade,
      ice.QuantidadeConferida
    FROM Expedicao.ItemConferir ice
    INNER JOIN Expedicao.Conferir cf ON
		cf.CodEmpresa = ice.CodEmpresa
    AND cf.CodConferir = ice.CodConferir
    INNER JOIN Expedicao.CarrinhoPercurso cp ON
		cp.CodEmpresa = ice.CodEmpresa
    AND cp.CodCarrinhoPercurso = ice.CodCarrinhoPercurso
    LEFT JOIN Expedicao.CarrinhoPercursoEstagio cpe ON
		cpe.CodEmpresa = ice.CodEmpresa
    AND cpe.CodCarrinhoPercurso = ice.CodCarrinhoPercurso
    AND cpe.Item = ice.ItemCarrinhoPercurso
    LEFT JOIN Expedicao.Carrinho cart ON
		cart.CodEmpresa = cpe.CodEmpresa
    AND cart.CodCarrinho = cpe.CodCarrinho
    INNER JOIN Produto prod ON
		prod.CodProduto = ice.CodProduto
    LEFT JOIN ProdutoEndereco pe ON
		pe.CodProdutoEndereco = prod.Endereco
    LEFT JOIN UnidadeMedida und ON
		und.CodUnidadeMedida = ice.CodUnidadeMedida
    LEFT JOIN GrupoProduto gp ON
		gp.CodGrupoProduto = prod.CodGrupoProduto
    LEFT JOIN Marca m ON
		m.CodMarca = prod.CodMarca
    LEFT JOIN Expedicao.SetorEstoque se ON
		se.CodSetorEstoque = prod.CodSetorEstoque
  ) ConferirItemConsulta
