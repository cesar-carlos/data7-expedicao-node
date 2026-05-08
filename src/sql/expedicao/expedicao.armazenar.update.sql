UPDATE Expedicao.Armazenar SET
	Origem = @Origem,
	CodOrigem = @CodOrigem,
	NumeroDocumento = @NumeroDocumento,
  CodPrioridade = @CodPrioridade,
	DataLancamento = @DataLancamento,
	HoraLancamento = @HoraLancamento,
	CodUsuarioLancamento  = @CodUsuarioLancamento,
	NomeUsuarioLancamento = @NomeUsuarioLancamento,
	EstacaoLancamento = @EstacaoLancamento,
	Observacao = @Observacao
WHERE CodEmpresa = @CodEmpresa
  AND CodArmazenar = @CodArmazenar
