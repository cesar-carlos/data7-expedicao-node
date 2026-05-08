SELECT *
FROM (
    SELECT ia.CodEmpresa,
      ia.CodArmazenar,
      ia.Item,
      ia.Situacao,
      ia.CodcarrinhoPercurso,
      ia.ItemcarrinhoPercurso,
      ia.CodLocalArmazenagem,
      ia.CodProduto,
      ia.NomeProduto,
      ia.CodUnidadeMedida,
      und.Descricao NomeUnidadeMedida,
      ia.CodProdutoEndereco,
      pe.Descricao NomeProdutoEndereco,
      ia.CodigoBarras,
      ia.Quantidade
    FROM Expedicao.ItemArmazenar ia
      LEFT JOIN UnidadeMedida und ON und.CodUnidadeMedida = ia.CodUnidadeMedida
      LEFT JOIN ProdutoEndereco pe ON pe.CodProdutoEndereco = ia.CodProdutoEndereco
  ) ItemArmazenarConsulta
