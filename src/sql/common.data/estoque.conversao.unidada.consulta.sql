SELECT *
FROM (
    SELECT prod.CodProduto,
      prod.Nome NomeProduto,
      '000' Item,
      prod.CodUnidadeMedida,
      und.Descricao UnidadeMedidaDescricao,
      'S' UnidadeMedidaPadrao,
      'M' TipoFatorConversao,
      1.00 FatorConversao,
      prod.CodigoBarras1 CodigoBarras,
      prod.PrecoVenda,
      prod.PrecoVenda2,
      prod.PrecoVenda3,
      prod.PrecoVenda4,
      prod.PrecoVenda5,
      prod.Observacao
    FROM Produto prod
      LEFT JOIN UnidadeMedida und ON und.CodUnidadeMedida = prod.CodUnidadeMedida
    UNION ALL
    SELECT cum.CodProduto,
      prod.Nome NomeProduto,
      cum.Item,
      cum.CodUnidadeMedida,
      und.Descricao UnidadeMedidaDescricao,
      'N' UnidadeMedidaPadrao,
      cum.TipoFatorConversao,
      cum.FatorConversao,
      cum.Codigo CodigoBarras,
      cum.PrecoVenda,
      cum.PrecoVenda2,
      cum.PrecoVenda3,
      cum.PrecoVenda4,
      cum.PrecoVenda5,
      cum.Observacao
    FROM ConversaoUnidadeMedida cum
      INNER JOIN Produto prod ON prod.CodProduto = cum.CodProduto
      INNER JOIN UnidadeMedida und ON und.CodUnidadeMedida = cum.CodUnidadeMedida
  ) ConversaoUnidadeMedidaConsulta
