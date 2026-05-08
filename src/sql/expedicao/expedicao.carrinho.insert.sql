INSERT INTO Expedicao.Carrinho(
    CodEmpresa,
    CodCarrinho,
    CodigoBarras,
    Descricao,
    Situacao,
    Ativo
  )
VALUES (
    @CodEmpresa,
    @CodCarrinho,
    @CodigoBarras,
    @Descricao,
    @Situacao,
    @Ativo
  )