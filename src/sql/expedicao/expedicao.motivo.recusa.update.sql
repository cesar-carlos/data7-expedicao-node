UPDATE Expedicao.MotivoRecusa
SET Descricao = @Descricao,
  Ativo = @Ativo
WHERE CodMotivoRecusa = @CodMotivoRecusa