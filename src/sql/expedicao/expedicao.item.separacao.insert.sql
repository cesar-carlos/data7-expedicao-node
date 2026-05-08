INSERT INTO Expedicao.ItemSeparacaoEstoque(
    CodEmpresa,
    CodSepararEstoque,
    Item,
    SessionId,
    Situacao,
    CodCarrinhoPercurso,
    ItemCarrinhoPercurso,
    CodSeparador,
    NomeSeparador,
    DataSeparacao,
    HoraSeparacao,
    CodProduto,
    CodUnidadeMedida,
    Quantidade
  )
OUTPUT INSERTED.*
VALUES (
    @CodEmpresa,
    @CodSepararEstoque,
    CASE
      WHEN @Item = '00000'
      OR @Item = '' THEN (
        SELECT FORMAT(ISNULL(MAX(CAST(Item AS INT)), 0) + 1, '00000')
        FROM Expedicao.ItemSeparacaoEstoque
        WHERE CodEmpresa = @CodEmpresa
          AND CodSepararEstoque = @CodSepararEstoque
      )
      ELSE @Item
    END,
    @SessionId,
    @Situacao,
    @CodCarrinhoPercurso,
    @ItemCarrinhoPercurso,
    @CodSeparador,
    @NomeSeparador,
    @DataSeparacao,
    @HoraSeparacao,
    @CodProduto,
    @CodUnidadeMedida,
    @Quantidade
  )
