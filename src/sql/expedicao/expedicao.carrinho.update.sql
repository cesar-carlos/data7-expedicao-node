UPDATE Expedicao.Carrinho
SET CodigoBarras = @CodigoBarras,
  Descricao = @Descricao,
  Situacao = @Situacao,
  Ativo = @Ativo
WHERE CodEmpresa = @CodEmpresa
  AND CodCarrinho = @CodCarrinho