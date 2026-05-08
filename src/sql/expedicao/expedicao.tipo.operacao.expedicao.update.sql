UPDATE Expedicao.TipoOperacaoExpedicao SET
  Descricao = @Descricao,
  Ativo = @Ativo,
  Tipo = @Tipo,
  CodSetorConferencia = @CodSetorConferencia,
  CodPrioridade = @CodPrioridade,
  CodRelatorio = @CodRelatorio,
  CodLocalArmazenagem = @CodLocalArmazenagem,
  MovimentaEstoque = @MovimentaEstoque,
  CodTipoMovimentoEstoque = @CodTipoMovimentoEstoque,
  FazerConferencia = @FazerConferencia,
  FazerArmazenamento = @FazerArmazenamento,
  ControlaLote = @ControlaLote,
  ControlaNumeroSerie = @ControlaNumeroSerie
WHERE CodEmpresa = @CodEmpresa
  AND CodTipoOperacaoExpedicao = @CodTipoOperacaoExpedicao
