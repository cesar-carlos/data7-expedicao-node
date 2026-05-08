INSERT INTO Expedicao.Armazenar(
	CodEmpresa,
	CodArmazenar,
	Origem,
	CodOrigem,
	NumeroDocumento,
  CodPrioridade,
	DataLancamento,
	HoraLancamento,
	CodUsuarioLancamento,
	NomeUsuarioLancamento,
	EstacaoLancamento,
	Observacao
  )
VALUES (
	@CodEmpresa,
	@CodArmazenar,
	@Origem,
	@CodOrigem,
	@NumeroDocumento,
  @CodPrioridade,
	@DataLancamento,
	@HoraLancamento,
	@CodUsuarioLancamento,
	@NomeUsuarioLancamento,
	@EstacaoLancamento,
	@Observacao
  )
