SET NOCOUNT ON;

DECLARE @Out TABLE (
    CodEmpresa INT NOT NULL,
    CodArmazenar INT NOT NULL,
    Item VARCHAR(5) NOT NULL,
    Situacao VARCHAR(30) NOT NULL,
    CodCarrinhoPercurso INT NULL,
    ItemCarrinhoPercurso VARCHAR(5) NULL,
    CodLocalArmazenagem INT NOT NULL,
    CodProduto INT NOT NULL,
    NomeProduto VARCHAR(120) NOT NULL,
    CodUnidadeMedida VARCHAR(6) NOT NULL,
    CodProdutoEndereco VARCHAR(60) NULL,
    CodigoBarras VARCHAR(30) NULL,
    Quantidade NUMERIC(18, 4) NOT NULL
  );

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
OUTPUT
    INSERTED.CodEmpresa,
    INSERTED.CodArmazenar,
    INSERTED.Item,
    INSERTED.Situacao,
    INSERTED.CodCarrinhoPercurso,
    INSERTED.ItemCarrinhoPercurso,
    INSERTED.CodLocalArmazenagem,
    INSERTED.CodProduto,
    INSERTED.NomeProduto,
    INSERTED.CodUnidadeMedida,
    INSERTED.CodProdutoEndereco,
    INSERTED.CodigoBarras,
    INSERTED.Quantidade
  INTO @Out
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
  );

SELECT
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
FROM @Out
