UPDATE integracao.CobrancaDigitalDataBase
SET Provedor = @Provedor,
  Usuario = @Usuario,
  Senha = @Senha,
  Servidor = @Servidor,
  Base = @Base,
  Porta = @Porta
WHERE CodCobrancaDigitalDataBase = @CodCobrancaDigitalDataBase