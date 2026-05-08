UPDATE Expedicao.LoginApp SET
  Nome = @Nome,
	Ativo = @Ativo,
	Senha = @Senha,
	CodUsuario = @CodUsuario,
  FotoUsuario = @FotoUsuario
WHERE CodLoginApp = @CodLoginApp
