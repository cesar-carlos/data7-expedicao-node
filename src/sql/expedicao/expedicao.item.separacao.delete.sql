DELETE Expedicao.ItemSeparacaoEstoque
WHERE CodEmpresa = @CodEmpresa
  AND CodSepararEstoque = @CodSepararEstoque
  AND Item = @Item
