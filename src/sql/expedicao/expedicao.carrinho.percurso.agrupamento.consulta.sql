SELECT *
FROM (
    SELECT cpe.CodEmpresa,
      cpe.CodCarrinhoPercurso,
      cpa.Item ItemAgrupamento,
      cpe.Item ItemCarrinhoPercurso,
      cpe.Origem,
      cpe.CodOrigem,
      COALESCE(cpa.Situacao, cpe.Situacao) Situacao,
      cp.Situacao SituacaoPercurso,
      cpe.CodPercursoEstagio,
      pe.Descricao DescricaoPercursoEstagio,
      cpa.CodCarrinhoAgrupador,
      carta.Descricao NomeCarrinhoAgrupador,
      carta.CodigoBarras CodigoBarrasCarrinhoAgrupador,
      cpe.CodCarrinho,
      cart.Descricao NomeCarrinho,
      cart.CodigoBarras CodigoBarrasCarrinho,
      (
        SELECT CASE
            WHEN COUNT(*) > 0 THEN 'S'
            ELSE 'N'
          END
        FROM Expedicao.CarrinhoPercursoAgrupamento scpa
        WHERE scpa.CodEmpresa = cpe.CodEmpresa
          AND scpa.CodCarrinhoPercurso = cpe.CodCarrinhoPercurso
          AND scpa.Origem = cpe.Origem
          AND scpa.CodCarrinhoAgrupador = cpe.CodCarrinho
          AND scpa.Situacao NOT IN ('CANCELADA')
      ) CarrinhoAgrupador,
      cpe.DataInicio,
      cpe.HoraInicio,
      cpe.CodUsuarioInicio,
      cpe.NomeUsuarioInicio
    FROM Expedicao.CarrinhoPercursoEstagio cpe
      INNER JOIN Expedicao.CarrinhoPercurso cp ON cp.CodEmpresa = cpe.CodEmpresa
      AND cp.CodCarrinhoPercurso = cpe.CodCarrinhoPercurso
      LEFT JOIN Expedicao.PercursoEstagio pe ON pe.CodPercursoEstagio = cpe.CodPercursoEstagio
      INNER JOIN Expedicao.Carrinho cart ON cart.CodEmpresa = cpe.CodEmpresa
      AND cart.CodCarrinho = cpe.CodCarrinho
      LEFT JOIN Expedicao.CarrinhoPercursoAgrupamento cpa ON cpa.CodEmpresa = cpe.CodEmpresa
      AND cpa.Origem = cpe.Origem
      AND cpa.CodCarrinhoPercurso = cpe.CodCarrinhoPercurso
      AND cpa.ItemCarrinhoPercurso = cpe.Item
      AND cpa.Situacao NOT IN ('CANCELADA')
      LEFT JOIN Expedicao.Carrinho carta ON carta.CodEmpresa = cpa.CodEmpresa
      AND carta.CodCarrinho = cpa.CodCarrinhoAgrupador
  ) CarrinhoPercursoAgrupamentoConsulta
