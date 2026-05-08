UPDATE Expedicao.CarrinhoPercurso
SET Origem = @Origem,
  CodOrigem = @CodOrigem,
  Situacao = @Situacao,
  DataInicio = @DataInicio,
  HoraInicio = @HoraInicio,
  DataFinalizacao = @DataFinalizacao,
  HoraFinalizacao = @HoraFinalizacao
WHERE CodEmpresa = @CodEmpresa
  AND CodCarrinhoPercurso = @CodCarrinhoPercurso