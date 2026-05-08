DELETE Expedicao.CarrinhoPercursoAgrupamento
WHERE CodEmpresa = @CodEmpresa
  AND CodCarrinhoPercurso = @CodCarrinhoPercurso
  AND Item = @Item
