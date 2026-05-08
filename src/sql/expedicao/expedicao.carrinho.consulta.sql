SELECT *
FROM (
    SELECT sub.CodEmpresa,
      sub.CodCarrinho,
      sub.Descricao,
      sub.Ativo,
      sub.Situacao,
      sub.CodigoBarras,
      cpe.CodCarrinhoPercurso,
      cpe.CodPercursoEstagio,
      pe.Descricao DescricaoPercursoEstagio,
      cp.Origem,
      cp.CodOrigem,
      cpe.DataInicio,
      cpe.HoraInicio,
      cpe.CodUsuarioInicio,
      cpe.NomeUsuarioInicio,
      se.CodSetorEstoque,
      se.Descricao NomeSetorEstoque
    FROM (
        SELECT scart.CodEmpresa,
          scart.CodCarrinho,
          scart.Descricao,
          scart.Ativo,
          scart.CodigoBarras,
          scart.Situacao,
          CASE
            WHEN scart.Situacao NOT IN ('LIBERADO') THEN (
              SELECT TOP 1 (
                  CAST(scpe.CodCarrinhoPercurso AS VARCHAR(10)) + scpe.Item
                )
              FROM Expedicao.CarrinhoPercursoEstagio scpe
              WHERE scpe.CodEmpresa = scart.CodEmpresa
                AND scpe.CodCarrinho = scart.CodCarrinho
                AND scpe.Situacao NOT IN ('CANCELADA', 'EMBALANDO', 'ENTREGUE')
              ORDER BY scpe.CodCarrinhoPercurso,
                scpe.Item DESC
            )
            ELSE NULL
          END IdCarrinhoPercurso
        FROM Expedicao.Carrinho scart
      ) sub
      LEFT JOIN Expedicao.CarrinhoPercursoEstagio cpe ON cpe.CodEmpresa = sub.CodEmpresa
      AND (
        CAST(cpe.CodCarrinhoPercurso AS VARCHAR(10)) + cpe.Item
      ) = sub.IdCarrinhoPercurso
      LEFT JOIN Expedicao.CarrinhoPercurso cp ON cp.CodEmpresa = cpe.CodEmpresa
      AND cp.CodCarrinhoPercurso = cpe.CodCarrinhoPercurso
      LEFT JOIN Expedicao.PercursoEstagio pe ON pe.CodPercursoEstagio = cpe.CodPercursoEstagio
      LEFT JOIN CaixaOperador co ON co.CodUsuario = cpe.CodUsuarioInicio
      LEFT JOIN Expedicao.SetorEstoque se ON se.CodSetorEstoque = co.CodSetorEstoque
  ) CarrinhoConsulta