INSERT INTO Expedicao.Cancelamento(
    CodEmpresa,
    CodCancelamento,
    Origem,
    CodOrigem,
    ItemOrigem,
    CodMotivoCancelamento,
    DataCancelamento,
    HoraCancelamento,
    CodUsuarioCancelamento,
    NomeUsuarioCancelamento,
    ObservacaoCancelamento
  )
VALUES (
    @CodEmpresa,
    @CodCancelamento,
    @Origem,
    @CodOrigem,
    @ItemOrigem,
    @CodMotivoCancelamento,
    @DataCancelamento,
    @HoraCancelamento,
    @CodUsuarioCancelamento,
    @NomeUsuarioCancelamento,
    @ObservacaoCancelamento
  )