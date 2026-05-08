INSERT INTO Expedicao.ItemConferir(
    CodEmpresa,
    CodConferir,
    Item,
    CodCarrinhoPercurso,
    ItemCarrinhoPercurso,
    CodProduto,
    CodUnidadeMedida,
    Quantidade,
    QuantidadeConferida
  )
OUTPUT INSERTED.*
VALUES (
    @CodEmpresa,
    @CodConferir,
    CASE
      WHEN @Item = '00000'
      OR @Item = '' THEN (
        SELECT FORMAT(ISNULL(MAX(CAST(Item AS INT)), 0) + 1, '00000')
        FROM Expedicao.ItemConferir
        WHERE CodEmpresa = @CodEmpresa
          AND CodConferir = @CodConferir
      )
      ELSE @Item
    END,
    @CodCarrinhoPercurso,
    @ItemCarrinhoPercurso,
    @CodProduto,
    @CodUnidadeMedida,
    @Quantidade,
    @QuantidadeConferida
  )
