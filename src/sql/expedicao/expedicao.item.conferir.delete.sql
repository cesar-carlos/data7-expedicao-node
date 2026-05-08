DELETE Expedicao.ItemConferir
WHERE CodEmpresa = @CodEmpresa
  AND CodConferir = @CodConferir
  AND Item = @Item