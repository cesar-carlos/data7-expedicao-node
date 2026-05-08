UPDATE integracao.CobrancaDigitalAdicionais
SET Adicional = @Adicional
WHERE CodEmpresa = @CodEmpresa
  AND CodCobrancaDigital = @CodCobrancaDigital
  AND Item = @Item
  AND Sequencia = @Sequencia