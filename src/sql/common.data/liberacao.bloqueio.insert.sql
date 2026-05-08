INSERT INTO LiberacaoBloqueio (
    CodEmpresa,
    CodFilial,
    CodLiberacaoBloqueio,
    Origem,
    CodOrigem,
    CodCliente,
    DataHoraBloqueio,
    CodUsuarioBloqueio,
    NomeUsuarioBloqueio,
    EstacaoTrabalhoBloqueio
  )
VALUES (
    @CodEmpresa,
    @CodFilial,
    @CodLiberacaoBloqueio,
    @Origem,
    @CodOrigem,
    @CodCliente,
    @DataHoraBloqueio,
    @CodUsuarioBloqueio,
    @NomeUsuarioBloqueio,
    @EstacaoTrabalhoBloqueio
  )