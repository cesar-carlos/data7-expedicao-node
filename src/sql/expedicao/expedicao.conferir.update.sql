UPDATE Expedicao.Conferir
SET Origem = @Origem,
  CodOrigem = @CodOrigem,
  CodPrioridade = @CodPrioridade,
  Situacao = @Situacao,
  Data = @Data,
  Hora = @Hora,
  Historico = @Historico,
  Observacao = @Observacao,
  CodMotivoCancelamento = @CodMotivoCancelamento,
  DataCancelamento = @DataCancelamento,
  HoraCancelamento = @HoraCancelamento,
  CodUsuarioCancelamento = @CodUsuarioCancelamento,
  NomeUsuarioCancelamento = @NomeUsuarioCancelamento,
  ObservacaoCancelamento = @ObservacaoCancelamento
WHERE CodEmpresa = @CodEmpresa
  AND CodConferir = @CodConferir