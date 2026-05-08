INSERT INTO Expedicao.CarrinhoPercurso(
    CodEmpresa,
    CodCarrinhoPercurso,
    Origem,
    CodOrigem,
    Situacao,
    DataInicio,
    HoraInicio,
    DataFinalizacao,
    HoraFinalizacao
  )
VALUES (
    @CodEmpresa,
    @CodCarrinhoPercurso,
    @Origem,
    @CodOrigem,
    @Situacao,
    @DataInicio,
    @HoraInicio,
    @DataFinalizacao,
    @HoraFinalizacao
  )