DELETE integracao.CobrancaDigitalTitulo
WHERE CodEmpresa = @CodEmpresa
  AND CodCobrancaDigital = @CodCobrancaDigital
  AND Item = @Item