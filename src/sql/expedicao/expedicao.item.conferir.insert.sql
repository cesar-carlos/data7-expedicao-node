SET NOCOUNT ON;

DECLARE @Out TABLE (
    CodEmpresa INT NOT NULL,
    CodConferir INT NOT NULL,
    Item VARCHAR(5) NOT NULL,
    CodCarrinhoPercurso INT NOT NULL,
    ItemCarrinhoPercurso VARCHAR(6) NOT NULL,
    CodProduto INT NOT NULL,
    CodUnidadeMedida VARCHAR(6) NOT NULL,
    Quantidade NUMERIC(18, 4) NOT NULL,
    QuantidadeConferida NUMERIC(18, 4) NOT NULL
  );

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
OUTPUT
    INSERTED.CodEmpresa,
    INSERTED.CodConferir,
    INSERTED.Item,
    INSERTED.CodCarrinhoPercurso,
    INSERTED.ItemCarrinhoPercurso,
    INSERTED.CodProduto,
    INSERTED.CodUnidadeMedida,
    INSERTED.Quantidade,
    INSERTED.QuantidadeConferida
  INTO @Out
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
  );

SELECT
    CodEmpresa,
    CodConferir,
    Item,
    CodCarrinhoPercurso,
    ItemCarrinhoPercurso,
    CodProduto,
    CodUnidadeMedida,
    Quantidade,
    QuantidadeConferida
FROM @Out
