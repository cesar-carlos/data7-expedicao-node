SELECT *
FROM (
    SELECT ise.CodEmpresa,
      ise.CodSepararEstoque,
      ise.Item,
      ise.SessionId,
      ise.Situacao,
      car.CodCarrinho,
      car.Descricao NomeCarrinho,
      car.CodigoBarras CodigoBarrasCarrinho,
      ise.CodCarrinhoPercurso,
      ise.ItemCarrinhoPercurso,
      ise.CodProduto,
      prod.Nome NomeProduto,
      ise.CodUnidadeMedida,
      und.Descricao NomeUnidadeMedida,
      prod.CodGrupoProduto,
      gp.Nome NomeGrupoProduto,
      prod.CodMarca,
      m.Nome NomeMarca,
      eise.CodSetorEstoque,
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
      ise.CodSeparador,
      ise.NomeSeparador,
      ise.DataSeparacao,
      ise.HoraSeparacao,
      ise.Quantidade
    FROM Expedicao.ItemSeparacaoEstoque ise
      INNER JOIN Expedicao.ItemSepararEstoque eise ON eise.CodEmpresa = ise.CodEmpresa
      AND eise.CodSepararEstoque = ise.CodSepararEstoque
      AND eise.CodProduto = ise.CodProduto
      LEFT JOIN Expedicao.CarrinhoPercursoEstagio cpe ON cpe.CodEmpresa = ise.CodEmpresa
      AND cpe.CodCarrinhoPercurso = ise.CodCarrinhoPercurso
      AND cpe.Item = ise.ItemCarrinhoPercurso
      LEFT JOIN Expedicao.Carrinho car ON car.CodCarrinho = cpe.CodCarrinho
      LEFT JOIN Produto prod ON prod.CodProduto = ise.CodProduto
      LEFT JOIN ProdutoEndereco pe ON pe.CodProdutoEndereco = prod.Endereco
      LEFT JOIN UnidadeMedida und ON und.CodUnidadeMedida = ise.CodUnidadeMedida
      LEFT JOIN GrupoProduto gp on gp.CodGrupoProduto = prod.CodGrupoProduto
      LEFT JOIN Marca m ON m.CodMarca = prod.CodMarca
      LEFT JOIN Expedicao.SetorEstoque se ON se.CodSetorEstoque = eise.CodSetorEstoque
  ) SeparacaoItemConsulta
