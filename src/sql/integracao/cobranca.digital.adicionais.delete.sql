DELETE integracao.CobrancaDigitalAdicionais
WHERE CodEmpresa = @CodEmpresa
  AND CodCobrancaDigital = @CodCobrancaDigital
  AND Item = @Item
  AND Sequencia = @Sequencia