UPDATE Expedicao.ItemSeparacaoEstoque
SET CodCarrinhoPercurso = @CodCarrinhoPercurso,
  ItemCarrinhoPercurso = @ItemCarrinhoPercurso,
  SessionId = @SessionId,
  Situacao = @Situacao,
  CodSeparador = @CodSeparador,
  NomeSeparador = @NomeSeparador,
  DataSeparacao = @DataSeparacao,
  HoraSeparacao = @HoraSeparacao,
  CodProduto = @CodProduto,
  CodUnidadeMedida = @CodUnidadeMedida,
  Quantidade = @Quantidade
WHERE CodEmpresa = @CodEmpresa
  AND CodSepararEstoque = @CodSepararEstoque
  AND Item = @Item
