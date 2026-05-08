INSERT INTO Expedicao.ItemSepararEstoque(
    CodEmpresa,
    CodSepararEstoque,
    Item,
    CodSetorEstoque,
    Origem,
    CodOrigem,
    ItemOrigem,
    CodLocalArmazenagem,
    CodProduto,
    CodUnidadeMedida,
    Quantidade,
    QuantidadeInterna,
    QuantidadeExterna,
    QuantidadeSeparacao
  )
OUTPUT INSERTED.*
VALUES (
    @CodEmpresa,
    @CodSepararEstoque,
    CASE
      WHEN @Item = '00000'
      OR @Item = '' THEN (
        SELECT FORMAT(ISNULL(MAX(CAST(Item AS INT)), 0) + 1, '00000')
        FROM Expedicao.ItemSepararEstoque
        WHERE CodEmpresa = @CodEmpresa
          AND CodSepararEstoque = @CodSepararEstoque
      )
      ELSE @Item
    END,
    @CodSetorEstoque,
    @Origem,
    @CodOrigem,
    @ItemOrigem,
    @CodLocalArmazenagem,
    @CodProduto,
    @CodUnidadeMedida,
    @Quantidade,
    @QuantidadeInterna,
    @QuantidadeExterna,
    @QuantidadeSeparacao
  )
