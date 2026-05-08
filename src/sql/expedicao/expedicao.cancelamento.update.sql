UPDATE Expedicao.Cancelamento
SET Origem = @Origem,
  CodOrigem = @CodOrigem,
  ItemOrigem = @ItemOrigem,
  CodMotivoCancelamento = @CodMotivoCancelamento,
  DataCancelamento = @DataCancelamento,
  HoraCancelamento = @HoraCancelamento,
  CodUsuarioCancelamento = @CodUsuarioCancelamento,
  NomeUsuarioCancelamento = @NomeUsuarioCancelamento,
  ObservacaoCancelamento = @ObservacaoCancelamento
WHERE CodEmpresa = @CodEmpresa
  AND CodCancelamento = @CodCancelamento