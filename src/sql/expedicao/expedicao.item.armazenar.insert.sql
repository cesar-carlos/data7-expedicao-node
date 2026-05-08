INSERT INTO Expedicao.ItemArmazenar(
	CodEmpresa,
	CodArmazenar,
	Item,
	Situacao,
	CodCarrinhoPercurso,
	ItemCarrinhoPercurso,
  CodLocalArmazenagem,
	CodProduto,
	NomeProduto,
	CodUnidadeMedida,
	CodProdutoEndereco,
	CodigoBarras,
	Quantidade
  )
OUTPUT INSERTED.*
VALUES (
	@CodEmpresa,
	@CodArmazenar,
    CASE
      WHEN @Item = '00000'
      OR @Item = '' THEN (
        SELECT FORMAT(ISNULL(MAX(CAST(Item AS INT)), 0) + 1, '00000')
        FROM Expedicao.ItemArmazenar
        WHERE CodEmpresa = @CodEmpresa
          AND CodArmazenar = @CodArmazenar
      )
      ELSE @Item
    END,
  @Situacao,
  @CodcarrinhoPercurso,
  @ItemcarrinhoPercurso,
  @CodLocalArmazenagem,
	@CodProduto,
	@NomeProduto,
	@CodUnidadeMedida,
  @CodProdutoEndereco,
	@CodigoBarras,
	@Quantidade
  )
