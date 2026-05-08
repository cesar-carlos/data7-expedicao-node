UPDATE Expedicao.TipoSolicitacao SET
  Descricao = @Descricao,
  Ativo = @Ativo
WHERE CodTipoSolicitacao = @CodTipoSolicitacao
