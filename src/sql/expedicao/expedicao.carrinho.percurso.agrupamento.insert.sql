INSERT INTO Expedicao.CarrinhoPercursoAgrupamento (
    CodEmpresa,
    CodCarrinhoPercurso,
    Item,
    Origem,
    ItemCarrinhoPercurso,
    Situacao,
    CodCarrinhoAgrupador,
    DataLancamento,
    HoraLancamento,
    CodUsuarioLancamento,
    NomeUsuarioLancamento
  )
OUTPUT INSERTED.*
VALUES (
    @CodEmpresa,
    @CodCarrinhoPercurso,
    CASE
      WHEN @Item = '00000'
      OR @Item = '' THEN (
        SELECT FORMAT(ISNULL(MAX(CAST(Item AS INT)), 0) + 1, '00000')
        FROM Expedicao.CarrinhoPercursoAgrupamento
        WHERE CodEmpresa = @CodEmpresa
          AND CodCarrinhoPercurso = @CodCarrinhoPercurso
      )
      ELSE @Item
    END,
    @Origem,
    @ItemCarrinhoPercurso,
    @Situacao,
    @CodCarrinhoAgrupador,
    @DataLancamento,
    @HoraLancamento,
    @CodUsuarioLancamento,
    @NomeUsuarioLancamento
  )
