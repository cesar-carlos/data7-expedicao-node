UPDATE Expedicao.ItemConferir
SET CodCarrinhoPercurso = @CodCarrinhoPercurso,
  ItemCarrinhoPercurso = @ItemCarrinhoPercurso,
  CodProduto = @CodProduto,
  CodUnidadeMedida = @CodUnidadeMedida,
  Quantidade = @Quantidade,
  QuantidadeConferida = @QuantidadeConferida
WHERE CodEmpresa = @CodEmpresa
  AND CodConferir = @CodConferir
  AND Item = @Item