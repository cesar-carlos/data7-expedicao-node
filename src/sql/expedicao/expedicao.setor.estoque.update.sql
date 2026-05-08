UPDATE Expedicao.SetorEstoque SET
  Descricao = @Descricao,
  Ativo = @Ativo
WHERE CodSetorEstoque = @CodSetorEstoque
