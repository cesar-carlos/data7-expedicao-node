UPDATE Expedicao.Prioridade
SET Descricao = @Descricao,
  Prioridade = @Prioridade,
  Ativo = @Ativo
WHERE CodPrioridade = @CodPrioridade