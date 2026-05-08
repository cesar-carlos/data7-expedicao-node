INSERT INTO Expedicao.CarrinhoPercursoEstagio(
    CodEmpresa,
    CodCarrinhoPercurso,
    Item,
    Origem,
    CodOrigem,
    CodPercursoEstagio,
    CodCarrinho,
    Situacao,
    DataInicio,
    HoraInicio,
    CodUsuarioInicio,
    NomeUsuarioInicio,
    DataFinalizacao,
    HoraFinalizacao,
    CodUsuarioFinalizacao,
    NomeUsuarioFinalizacao
  )
OUTPUT INSERTED.*
VALUES (
    @CodEmpresa,
    @CodCarrinhoPercurso,
    CASE
      WHEN @Item = '00000'
      OR @Item = '' THEN (
        SELECT FORMAT(ISNULL(MAX(CAST(Item AS INT)), 0) + 1, '00000')
        FROM Expedicao.CarrinhoPercursoEstagio
        WHERE CodEmpresa = @CodEmpresa
          AND CodCarrinhoPercurso = @CodCarrinhoPercurso
      )
      ELSE @Item
    END,
    @Origem,
    @CodOrigem,
    @CodPercursoEstagio,
    @CodCarrinho,
    @Situacao,
    @DataInicio,
    @HoraInicio,
    @CodUsuarioInicio,
    @NomeUsuarioInicio,
    @DataFinalizacao,
    @HoraFinalizacao,
    @CodUsuarioFinalizacao,
    @NomeUsuarioFinalizacao
  )
