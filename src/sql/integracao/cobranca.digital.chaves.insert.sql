INSERT INTO integracao.CobrancaDigitalChave (
    CodEmpresa,
    CodFilial,
    CodCobrancaDigital,
    UUID,
    Status,
    DataCriacao,
    Chave
  )
VALUES (
    @CodEmpresa,
    @CodFilial,
    @CodCobrancaDigital,
    @UUID,
    @Status,
    @DataCriacao,
    @Chave
  )