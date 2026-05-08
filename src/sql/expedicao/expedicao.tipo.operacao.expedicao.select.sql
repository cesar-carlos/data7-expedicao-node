SELECT
  CodEmpresa,
  CodTipoOperacaoExpedicao,
  Descricao,
  Ativo,
  Tipo,
  CodSetorConferencia,
  CodPrioridade,
  CodRelatorio,
  CodLocalArmazenagem,
  MovimentaEstoque,
  CodTipoMovimentoEstoque,
  FazerConferencia,
  FazerArmazenamento,
  ControlaLote,
  ControlaNumeroSerie
FROM Expedicao.TipoOperacaoExpedicao
