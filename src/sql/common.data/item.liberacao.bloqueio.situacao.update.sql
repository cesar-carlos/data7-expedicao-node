UPDATE ItemLiberacaoBloqueio
SET Status = @Status,
  RotinaLiberacao = @RotinaLiberacao,
  DataHoraLiberacao = @DataHoraLiberacao,
  CodUsuarioLiberacao = @CodUsuarioLiberacao,
  EstacaoTrabalhoLiberacao = @EstacaoTrabalhoLiberacao,
  ObservacaoLiberacao = @ObservacaoLiberacao,
  MotivoRejeicaoLiberacaoBloqueio = @MotivoRejeicaoLiberacaoBloqueio,
  Complemento = @Complemento
WHERE CodLiberacaoBloqueio = @CodLiberacaoBloqueio
  AND Item = @Item