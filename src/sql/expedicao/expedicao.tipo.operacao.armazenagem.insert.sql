INSERT INTO Expedicao.TipoOperacaoArmazenagem(
	CodEmpresa,
	CodTipoOperacaoArmazenagem,
	Descricao,
	Ativo,
	CodPrioridade,
	CodRelatorio,
	CodLocalArmazenagem,
	CodSetorArmazenagem,
	MovimentaEstoque,
	CodTipoMovimentoEstoque,
	ControlaLote,
	ControlaSerie
  ) VALUES (
	@CodEmpresa,
	@CodTipoOperacaoArmazenagem,
	@Descricao,
	@Ativo,
	@CodPrioridade,
	@CodRelatorio,
	@CodLocalArmazenagem,
	@CodSetorArmazenagem,
	@MovimentaEstoque,
	@CodTipoMovimentoEstoque,
	@ControlaLote,
	@ControlaSerie
  )
