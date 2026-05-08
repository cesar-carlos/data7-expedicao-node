SELECT *
FROM (
    SELECT ic.CodEmpresa,
      ic.CodConferir,
      ic.Item,
      ic.SessionId,
      ic.Situacao,
      car.CodCarrinho,
      car.Descricao NomeCarrinho,
      car.CodigoBarras CodigoBarrasCarrinho,
      ic.CodCarrinhoPercurso,
      ic.ItemCarrinhoPercurso,
      ic.CodProduto,
      prod.Nome NomeProduto,
      ic.CodUnidadeMedida,
      und.Descricao NomeUnidadeMedida,
      prod.CodGrupoProduto,
      gp.Nome NomeGrupoProduto,
      prod.CodMarca,
      m.Nome NomeMarca,
      prod.CodigoBarras1 CodigoBarras,
      prod.CodigoBarras2 CodigoBarras2,
      prod.CodigoReferencia,
      prod.CodigoFornecedor,
      prod.CodigoFabricante,
      prod.CodigoOriginal,
      prod.Endereco,
      pe.Descricao EnderecoDescricao,
      ic.CodConferente,
      ic.NomeConferente,
      ic.DataConferencia,
      ic.HoraConferencia,
      ic.Quantidade
    FROM Expedicao.ItemConferencia ic
      LEFT JOIN Expedicao.CarrinhoPercursoEstagio cpe ON cpe.CodEmpresa = ic.CodEmpresa
      AND cpe.CodCarrinhoPercurso = ic.CodCarrinhoPercurso
      AND cpe.Item = ic.ItemCarrinhoPercurso
      LEFT JOIN Expedicao.Carrinho car ON car.CodCarrinho = cpe.CodCarrinho
      LEFT JOIN Produto prod ON prod.CodProduto = ic.CodProduto
      LEFT JOIN ProdutoEndereco pe ON pe.CodProdutoEndereco = prod.Endereco
      LEFT JOIN UnidadeMedida und ON und.CodUnidadeMedida = ic.CodUnidadeMedida
      LEFT JOIN GrupoProduto gp on gp.CodGrupoProduto = prod.CodGrupoProduto
      LEFT JOIN Marca m ON m.CodMarca = prod.CodMarca
  ) ConferenciaItemConsulta