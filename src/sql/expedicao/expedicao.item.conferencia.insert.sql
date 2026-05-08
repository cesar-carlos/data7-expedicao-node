INSERT INTO Expedicao.ItemConferencia(
    CodEmpresa,
    CodConferir,
    Item,
    SessionId,
    Situacao,
    CodCarrinhoPercurso,
    ItemCarrinhoPercurso,
    CodConferente,
    NomeConferente,
    DataConferencia,
    HoraConferencia,
    CodProduto,
    CodUnidadeMedida,
    Quantidade
  )
OUTPUT INSERTED.*
VALUES (
    @CodEmpresa,
    @CodConferir,
    CASE
      WHEN @Item = '00000'
      OR @Item = '' THEN (
        SELECT FORMAT(ISNULL(MAX(CAST(Item AS INT)), 0) + 1, '00000')
        FROM Expedicao.ItemConferencia
        WHERE CodEmpresa = @CodEmpresa
          AND CodConferir = @CodConferir
      )
      ELSE @Item
    END,
    @SessionId,
    @Situacao,
    @CodCarrinhoPercurso,
    @ItemCarrinhoPercurso,
    @CodConferente,
    @NomeConferente,
    @DataConferencia,
    @HoraConferencia,
    @CodProduto,
    @CodUnidadeMedida,
    @Quantidade
  )
