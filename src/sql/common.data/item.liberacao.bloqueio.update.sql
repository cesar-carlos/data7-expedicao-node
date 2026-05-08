UPDATE ItemLiberacaoBloqueio
SET Status = @Status,
  CodRegra = @CodRegra,
  Regra = Regra,
  MensagemBloqueio = @MensagemBloqueio,
  DescricaoBloqueio = @DescricaoBloqueio,
  ObservacaoBloqueio = @ObservacaoBloqueio,
  DataHoraSolicitacao = @DataHoraSolicitacao,
  CodUsuarioSolicitacao = @CodUsuarioSolicitacao,
  NomeUsuarioSolicitacao = @NomeUsuarioSolicitacao,
  EstacaoTrabalhoSolicitacao = @EstacaoTrabalhoSolicitacao,
  ObservacaoLiberacaoBloqueio = @ObservacaoLiberacaoBloqueio,
  MotivoRejeicaoLiberacaoBloqueio = @MotivoRejeicaoLiberacaoBloqueio
WHERE CodLiberacaoBloqueio = @CodLiberacaoBloqueio
  AND Item = @Item