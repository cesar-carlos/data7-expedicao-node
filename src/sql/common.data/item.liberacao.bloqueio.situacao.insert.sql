INSERT INTO ItemLiberacaoBloqueio (
    CodLiberacaoBloqueio,
    Item,
    Status,
    RotinaLiberacao,
    DataHoraLiberacao,
    CodUsuarioLiberacao,
    EstacaoTrabalhoLiberacao,
    ObservacaoLiberacao,
    MotivoRejeicaoLiberacaoBloqueio,
    Complemento
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
    @RotinaLiberacao,
    @DataHoraLiberacao,
    @CodUsuarioLiberacao,
    @EstacaoTrabalhoLiberacao,
    @ObservacaoLiberacao,
    @MotivoRejeicaoLiberacaoBloqueio,
    @Complemento
  )