UPDATE integracao.CobrancaDigitalPagamento
SET Status = @Status,
  EndToEndId = @EndToEndId,
  Chave = @Chave,
  DataPagamento = @DataPagamento,
  Valor = @Valor,
  Observacao = @Observacao
WHERE SysId = @SysId
  AND Sequencia = @Sequencia