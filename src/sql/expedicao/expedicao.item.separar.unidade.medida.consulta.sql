SELECT *
FROM (
    SELECT ise.CodEmpresa,
      ise.CodSepararEstoque,
      ise.Item,
      prod.CodProduto,
      '000' ItemUnidadeMedida,
      prod.CodUnidadeMedida,
      und.Descricao UnidadeMedidaDescricao,
      'S' UnidadeMedidaPadrao,
      'M' TipoFatorConversao,
      1.00 FatorConversao,
      prod.CodigoBarras1 CodigoBarras,
      NULL Observacao
    FROM Expedicao.ItemSepararEstoque ise
      INNER JOIN Produto prod ON prod.CodProduto = ise.CodProduto
      LEFT JOIN UnidadeMedida und ON und.CodUnidadeMedida = prod.CodUnidadeMedida
    UNION ALL
    SELECT ise.CodEmpresa,
      ise.CodSepararEstoque,
      ise.Item,
      cum.CodProduto,
      cum.Item ItemUnidadeMedida,
      cum.CodUnidadeMedida,
      und.Descricao UnidadeMedidaDescricao,
      'N' UnidadeMedidaPadrao,
      cum.TipoFatorConversao,
      cum.FatorConversao,
      cum.Codigo CodigoBarras,
      cum.Observacao
    FROM Expedicao.ItemSepararEstoque ise
      INNER JOIN ConversaoUnidadeMedida cum ON cum.CodProduto = ise.CodProduto
      INNER JOIN Produto prod ON prod.CodProduto = cum.CodProduto
      INNER JOIN UnidadeMedida und ON und.CodUnidadeMedida = cum.CodUnidadeMedida
  ) SepararItemUnidadeConsulta
