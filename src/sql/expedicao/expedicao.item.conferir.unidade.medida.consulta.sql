SELECT *
FROM (
    SELECT ic.CodEmpresa,
      ic.CodConferir,
      ic.Item,
      prod.CodProduto,
      '000' ItemUnidadeMedida,
      prod.CodUnidadeMedida,
      und.Descricao UnidadeMedidaDescricao,
      'S' UnidadeMedidaPadrao,
      'M' TipoFatorConversao,
      1.00 FatorConversao,
      prod.CodigoBarras1 CodigoBarras,
      NULL Observacao
    FROM Expedicao.ItemConferir ic
      INNER JOIN Produto prod ON prod.CodProduto = ic.CodProduto
      LEFT JOIN UnidadeMedida und ON und.CodUnidadeMedida = prod.CodUnidadeMedida
    UNION ALL
    SELECT ic.CodEmpresa,
      ic.CodConferir,
      ic.Item,
      cum.CodProduto,
      cum.Item ItemUnidadeMedida,
      cum.CodUnidadeMedida,
      und.Descricao UnidadeMedidaDescricao,
      'N' UnidadeMedidaPadrao,
      cum.TipoFatorConversao,
      cum.FatorConversao,
      cum.Codigo CodigoBarras,
      cum.Observacao
    FROM Expedicao.ItemConferir ic
      INNER JOIN ConversaoUnidadeMedida cum ON cum.CodProduto = ic.CodProduto
      INNER JOIN Produto prod ON prod.CodProduto = cum.CodProduto
      INNER JOIN UnidadeMedida und ON und.CodUnidadeMedida = cum.CodUnidadeMedida
  ) ConferirItemUnidadeConsulta