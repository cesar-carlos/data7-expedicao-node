UPDATE Expedicao.TipoOperacaoArmazenagem SET
  Descricao = @Descricao,
  Ativo = @Ativo,
  CodPrioridade = @CodPrioridade,
  CodRelatorio = @CodRelatorio,
  CodLocalArmazenagem = @CodLocalArmazenagem,
  CodSetorArmazenagem = @CodSetorArmazenagem,
  MovimentaEstoque = @MovimentaEstoque,
  CodTipoMovimentoEstoque = @CodTipoMovimentoEstoque,
  ControlaLote = @ControlaLote,
  ControlaSerie = @ControlaSerie
WHERE CodEmpresa = @CodEmpresa
  AND CodTipoOperacaoArmazenagem = @CodTipoOperacaoArmazenagem
