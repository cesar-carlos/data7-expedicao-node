UPDATE integracao.CobrancaDigitalChave
SET Status = @Status,
  DataCriacao = @DataCriacao,
  Chave = @Chave
WHERE CodEmpresa = @CodEmpresa
  AND CodFilial = @CodFilial
  AND CodCobrancaDigital = @CodCobrancaDigital