INSERT INTO integracao.CobrancaDigitalTitulo (
    CodEmpresa,
    CodCobrancaDigital,
    Item,
    SysId,
    Status,
    TipoCobranca,
    NumeroTitulo,
    Parcela,
    QtdParcelas,
    LiberacaoKey,
    DataLancamento,
    DataEmissao,
    DataVenda,
    DataVencimento,
    Valor,
    Observacao
  )
VALUES (
    @CodEmpresa,
    @CodCobrancaDigital,
    CASE
      WHEN @Item = '00000'
      OR @Item = '' THEN (
        SELECT FORMAT(ISNULL(MAX(CAST(Item AS INT)), 0) + 1, '00000')
        FROM integracao.CobrancaDigitalTitulo
        WHERE CodEmpresa = @CodEmpresa
          AND CodCobrancaDigital = @CodCobrancaDigital
      )
      ELSE @Item
    END,
    @SysId,
    @Status,
    @TipoCobranca,
    @NumeroTitulo,
    @Parcela,
    @QtdParcelas,
    @LiberacaoKey,
    @DataLancamento,
    @DataEmissao,
    @DataVenda,
    @DataVencimento,
    @Valor,
    @Observacao
  )