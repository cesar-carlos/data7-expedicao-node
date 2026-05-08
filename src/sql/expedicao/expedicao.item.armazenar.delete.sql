DELETE Expedicao.ItemArmazenar
WHERE CodEmpresa = @CodEmpresa
  AND CodArmazenar = @CodArmazenar
  AND Item = @Item
