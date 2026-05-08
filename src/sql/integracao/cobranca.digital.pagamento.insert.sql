INSERT INTO integracao.CobrancaDigitalPagamento (
    SysId,
    Sequencia,
    Status,
    EndToEndId,
    Chave,
    DataPagamento,
    Valor,
    Observacao
  )
VALUES (
    @SysId,
    @Sequencia,
    @Status,
    @EndToEndId,
    @Chave,
    @DataPagamento,
    @Valor,
    @Observacao
  )