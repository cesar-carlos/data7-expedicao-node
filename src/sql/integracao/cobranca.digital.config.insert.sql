INSERT INTO integracao.CobrancaDigitalConfig (
    CodEmpresa,
    CodConfiguracao,
    Ativo,
    Gerenciadora,
    ClientId,
    ClientSecret,
    Certificado
  )
VALUES (
    @CodEmpresa,
    @CodConfiguracao,
    @Ativo,
    @Gerenciadora,
    @ClientId,
    @ClientSecret,
    @Certificado
  )