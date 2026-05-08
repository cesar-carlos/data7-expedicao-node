UPDATE Expedicao.CarrinhoPercursoEstagio SET
  Origem = @Origem,
  CodOrigem = @CodOrigem,
  CodPercursoEstagio = @CodPercursoEstagio,
  CodCarrinho = @CodCarrinho,
  Situacao = @Situacao,
  DataInicio = @DataInicio,
  HoraInicio = @HoraInicio,
  CodUsuarioInicio = @CodUsuarioInicio,
  NomeUsuarioInicio = @NomeUsuarioInicio,
  DataFinalizacao = @DataFinalizacao,
  HoraFinalizacao = @HoraFinalizacao,
  CodUsuarioFinalizacao = @CodUsuarioFinalizacao,
  NomeUsuarioFinalizacao = @NomeUsuarioFinalizacao
WHERE CodEmpresa = @CodEmpresa
  AND CodCarrinhoPercurso = @CodCarrinhoPercurso
  AND Item = @Item
