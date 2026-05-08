UPDATE Expedicao.ItemSepararEstoque
SET CodSetorEstoque = @CodSetorEstoque,
  Origem = @Origem,
  CodOrigem = @CodOrigem,
  ItemOrigem = @ItemOrigem,
  CodLocalArmazenagem = @CodLocalArmazenagem,
  CodProduto = @CodProduto,
  CodUnidadeMedida = @CodUnidadeMedida,
  Quantidade = @Quantidade,
  QuantidadeInterna = @QuantidadeInterna,
  QuantidadeExterna = @QuantidadeExterna,
  QuantidadeSeparacao = @QuantidadeSeparacao
WHERE CodEmpresa = @CodEmpresa
  AND CodSepararEstoque = @CodSepararEstoque
  AND Item = @Item
