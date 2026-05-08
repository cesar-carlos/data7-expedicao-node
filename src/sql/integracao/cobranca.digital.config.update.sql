UPDATE integracao.CobrancaDigitalConfig
SET Ativo = @Ativo,
  Gerenciadora = @Gerenciadora,
  ClientId = @ClientId,
  ClientSecret = @ClientSecret,
  Certificado = @Certificado
WHERE CodEmpresa = @CodEmpresa
  AND CodConfiguracao = @CodConfiguracao