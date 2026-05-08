INSERT INTO Expedicao.SeparacaoUsuarioSetor(
    CodEmpresa,
    CodSepararEstoque,
    Item,
    CodSetorEstoque,
    DataLancamento,
    HoraLancamento,
    CodUsuario,
    NomeUsuario,
    EstacaoSeparacao
  )
OUTPUT INSERTED.*
VALUES (
    @CodEmpresa,
    @CodSepararEstoque,
    CASE
      WHEN @Item = '00000'
      OR @Item = '' THEN (
        SELECT FORMAT(ISNULL(MAX(CAST(Item AS INT)), 0) + 1, '00000')
        FROM Expedicao.SeparacaoUsuarioSetor
        WHERE CodEmpresa = @CodEmpresa
          AND CodSepararEstoque = @CodSepararEstoque
      )
      ELSE @Item
    END,
    @CodSetorEstoque,
    @DataLancamento,
    @HoraLancamento,
    @CodUsuario,
    @NomeUsuario,
    @EstacaoSeparacao
  )
