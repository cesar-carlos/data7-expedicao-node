SELECT *
FROM(
    SELECT ise.CodEmpresa,
      ise.CodSepararEstoque,
      ise.Item,
      ise.Origem,
      ise.CodOrigem,
      ise.ItemOrigem,
      ise.CodProduto,
      prod.Nome NomeProduto,
      prod.Ativo,
      prod.CodTipoProduto,
      ise.CodUnidadeMedida,
      und.Descricao NomeUnidadeMedida,
      prod.CodGrupoProduto,
      gp.Nome NomeGrupoProduto,
      prod.CodMarca,
      m.Nome NomeMarca,
      ise.CodSetorEstoque,
      se.Descricao NomeSetorEstoque,
      prod.NCM,
      prod.CodigoBarras1 CodigoBarras,
      prod.CodigoBarras2 CodigoBarras2,
      prod.CodigoReferencia,
      prod.CodigoFornecedor,
      prod.CodigoFabricante,
      prod.CodigoOriginal,
      prod.Endereco,
      pe.Descricao EnderecoDescricao,
      ise.CodLocalArmazenagem,
      la.Nome NomeLocaArmazenagem,
      ise.Quantidade,
      ise.QuantidadeInterna,
      ise.QuantidadeExterna,
      ise.QuantidadeSeparacao
    FROM Expedicao.ItemSepararEstoque ise
      INNER JOIN Produto prod ON prod.CodProduto = ise.CodProduto
      LEFT JOIN ProdutoEndereco pe ON pe.CodProdutoEndereco = prod.Endereco
      LEFT JOIN UnidadeMedida und ON und.CodUnidadeMedida = ise.CodUnidadeMedida
      LEFT JOIN GrupoProduto gp ON gp.CodGrupoProduto = prod.CodGrupoProduto
      LEFT JOIN Marca m ON m.CodMarca = prod.CodMarca
      LEFT JOIN Expedicao.SetorEstoque se ON se.CodSetorEstoque = ise.CodSetorEstoque
      LEFT JOIN LocalArmazenagem la ON la.CodLocalArmazenagem = ise.CodLocalArmazenagem
  ) SepararItemConsulta
