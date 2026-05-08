DELETE Expedicao.SeparacaoUsuarioSetor
WHERE CodEmpresa = @CodEmpresa
  AND CodSepararEstoque = @CodSepararEstoque
  AND Item = @Item
