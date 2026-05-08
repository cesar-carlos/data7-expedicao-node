UPDATE Expedicao.SeparacaoUsuarioSetor SET
	CodSetorEstoque = @CodSetorEstoque,
	DataLancamento = @DataLancamento,
	HoraLancamento = @HoraLancamento,
	CodUsuario = @CodUsuario,
	NomeUsuario = @NomeUsuario,
	EstacaoSeparacao = @EstacaoSeparacao
WHERE CodEmpresa = @CodEmpresa
  AND CodSepararEstoque = @CodSepararEstoque
  AND Item = @Item
