SELECT *
FROM (
    SELECT prod.CodProduto,
      prod.Nome NomeProduto,
      prod.Ativo,
      prod.CodTipoProduto,
      prod.CodUnidadeMedida,
      und.Descricao NomeUnidadeMedida,
      prod.CodGrupoProduto,
      gp.Nome NomeGrupoProduto,
      prod.CodMarca,
      m.Nome NomeMarca,
      COALESCE(prod.CodSetorEstoque, 0) CodSetorEstoque,
      prod.NCM,
      prod.CodigoBarras1 CodigoBarras,
      prod.CodigoBarras2 CodigoBarras2,
      prod.CodigoReferencia,
      prod.CodigoFornecedor,
      prod.CodigoFabricante,
      prod.CodigoOriginal,
      prod.Endereco,
      pe.Descricao EnderecoDescricao
    FROM Produto prod
      LEFT JOIN GrupoProduto gp ON gp.CodGrupoProduto = prod.CodGrupoProduto
      LEFT JOIN Marca m ON m.CodMarca = prod.CodMarca
      LEFT JOIN UnidadeMedida und ON und.CodUnidadeMedida = prod.CodUnidadeMedida
      LEFT JOIN ProdutoEndereco pe ON pe.CodProdutoEndereco = prod.Endereco
  ) ProdutoConsulta
