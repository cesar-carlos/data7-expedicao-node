INSERT INTO ItemLiberacaoBloqueio (
    CodLiberacaoBloqueio,
    Item,
    Status,
    CodRegra,
    Regra,
    MensagemBloqueio,
    DescricaoBloqueio,
    ObservacaoBloqueio,
    DataHoraSolicitacao,
    CodUsuarioSolicitacao,
    NomeUsuarioSolicitacao,
    EstacaoTrabalhoSolicitacao,
    ObservacaoLiberacaoBloqueio,
    MotivoRejeicaoLiberacaoBloqueio
  )
VALUES (
    @CodLiberacaoBloqueio,
    CASE
      WHEN @Item = '00000'
      OR @Item = '' THEN (
        SELECT FORMAT(ISNULL(MAX(CAST(Item AS INT)), 0) + 1, '00000')
        FROM ItemLiberacaoBloqueio
        WHERE CodLiberacaoBloqueio = @CodLiberacaoBloqueio
      )
      ELSE @Item
    END,
    @Status,
    @CodRegra,
    @Regra,
    @MensagemBloqueio,
    @DescricaoBloqueio,
    @ObservacaoBloqueio,
    @DataHoraSolicitacao,
    @CodUsuarioSolicitacao,
    @NomeUsuarioSolicitacao,
    @EstacaoTrabalhoSolicitacao,
    @ObservacaoLiberacaoBloqueio,
    @MotivoRejeicaoLiberacaoBloqueio
  )