UPDATE Expedicao.ItemConferencia
SET SessionId = @SessionId,
  Situacao = @Situacao,
  CodCarrinhoPercurso = @CodCarrinhoPercurso,
  ItemCarrinhoPercurso = @ItemCarrinhoPercurso,
  CodConferente = @CodConferente,
  NomeConferente = @NomeConferente,
  DataConferencia = @DataConferencia,
  HoraConferencia = @HoraConferencia,
  CodProduto = @CodProduto,
  CodUnidadeMedida = @CodUnidadeMedida,
  Quantidade = @Quantidade
WHERE CodEmpresa = @CodEmpresa
  AND CodConferir = @CodConferir
  AND Item = @Item