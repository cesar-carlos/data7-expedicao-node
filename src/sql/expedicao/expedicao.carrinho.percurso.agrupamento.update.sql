UPDATE Expedicao.CarrinhoPercursoAgrupamento
SET Origem = @Origem,
  ItemCarrinhoPercurso = @ItemCarrinhoPercurso,
  Situacao = @Situacao,
  CodCarrinhoAgrupador = @CodCarrinhoAgrupador,
  DataLancamento = @DataLancamento,
  HoraLancamento = @HoraLancamento,
  CodUsuarioLancamento = @CodUsuarioLancamento,
  NomeUsuarioLancamento = @NomeUsuarioLancamento
WHERE CodEmpresa = @CodEmpresa
  AND CodCarrinhoPercurso = @CodCarrinhoPercurso
  AND Item = @Item