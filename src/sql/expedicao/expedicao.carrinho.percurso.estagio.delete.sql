DELETE Expedicao.CarrinhoPercursoEstagio
WHERE CodEmpresa = @CodEmpresa
  AND CodCarrinhoPercurso = @CodCarrinhoPercurso
  AND Item = @Item
