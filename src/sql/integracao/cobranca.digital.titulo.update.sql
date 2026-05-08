UPDATE integracao.CobrancaDigitalTitulo
SET SysId = @SysId,
  Status = @Status,
  TipoCobranca = @TipoCobranca,
  NumeroTitulo = @NumeroTitulo,
  Parcela = @Parcela,
  QtdParcelas = @QtdParcelas,
  LiberacaoKey = @LiberacaoKey,
  DataLancamento = @DataLancamento,
  DataEmissao = @DataEmissao,
  DataVenda = @DataVenda,
  DataVencimento = @DataVencimento,
  Valor = @Valor,
  Observacao = @Observacao
WHERE CodEmpresa = @CodEmpresa
  AND CodCobrancaDigital = @CodCobrancaDigital
  AND Item = @Item