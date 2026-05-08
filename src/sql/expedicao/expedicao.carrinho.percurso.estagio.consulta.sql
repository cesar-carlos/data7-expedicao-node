SELECT *
FROM (
    SELECT cpe.CodEmpresa,
      cpe.CodCarrinhoPercurso,
      cpe.Item,
      cpe.CodPercursoEstagio,
      cpe.Origem,
      cpe.CodOrigem,
      cpe.Situacao,
      (
        SELECT CASE
            WHEN COUNT(CodCarrinhoAgrupador) > 0
            AND cpe.Situacao NOT IN ('CANCELADA') THEN 'S'
            ELSE 'N'
          END
        FROM Expedicao.CarrinhoPercursoAgrupamento cpa
        WHERE cpa.CodEmpresa = cpe.CodEmpresa
          AND cpa.CodCarrinhoPercurso = cpe.CodCarrinhoPercurso
          AND cpa.CodCarrinhoAgrupador = cpe.CodCarrinho
          AND cpa.Origem = cpe.Origem
          AND cpa.Situacao NOT IN ('CANCELADA')
      ) CarrinhoAgrupador,
      (
        SELECT TOP 1 CodCarrinhoAgrupador
        FROM Expedicao.CarrinhoPercursoAgrupamento cpa
        WHERE cpa.CodEmpresa = cpe.CodEmpresa
          AND cpa.CodCarrinhoPercurso = cpe.CodCarrinhoPercurso
          AND cpa.ItemCarrinhoPercurso = cpe.Item
          AND cpa.Situacao NOT IN ('CANCELADA')
      ) CodCarrinhoAgrupador,
      cpe.CodCarrinho,
      cart.Descricao NomeCarrinho,
      cart.CodigoBarras CodigoBarrasCarrinho,
      cart.Ativo Ativo,
      cpe.CodUsuarioInicio,
      cpe.NomeUsuarioInicio,
      cpe.DataInicio,
      cpe.HoraInicio,
      cpe.CodUsuarioFinalizacao,
      cpe.NomeUsuarioFinalizacao,
      cpe.DataFinalizacao,
      cpe.HoraFinalizacao,
      co.CodSetorEstoque,
      se.Descricao NomeSetorEstoque
    FROM Expedicao.CarrinhoPercursoEstagio cpe
      INNER JOIN Expedicao.CarrinhoPercurso cp ON cp.CodEmpresa = cpe.CodEmpresa
      AND cp.CodCarrinhoPercurso = cpe.CodCarrinhoPercurso
      LEFT JOIN Expedicao.Carrinho cart ON cart.CodEmpresa = cpe.CodEmpresa
      AND cart.CodCarrinho = cpe.CodCarrinho
      LEFT JOIN CaixaOperador co ON co.CodUsuario = cpe.CodUsuarioInicio
      LEFT JOIN Expedicao.SetorEstoque se ON se.CodSetorEstoque = co.CodSetorEstoque
  ) CarrinhoPercursoEstagioConsulta
