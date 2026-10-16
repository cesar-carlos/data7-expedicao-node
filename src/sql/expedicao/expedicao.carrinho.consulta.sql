SELECT *
FROM (
    SELECT scart.CodEmpresa,
      scart.CodCarrinho,
      scart.Descricao,
      scart.Ativo,
      scart.Situacao,
      scart.CodigoBarras,
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
    FROM Expedicao.Carrinho scart
      OUTER APPLY (
        SELECT TOP 1 scpe.CodCarrinhoPercurso,
          scpe.CodPercursoEstagio,
          scpe.DataInicio,
          scpe.HoraInicio,
          scpe.CodUsuarioInicio,
          scpe.NomeUsuarioInicio
        FROM Expedicao.CarrinhoPercursoEstagio scpe
        WHERE scart.Situacao NOT IN ('LIBERADO')
          AND scpe.CodEmpresa = scart.CodEmpresa
          AND scpe.CodCarrinho = scart.CodCarrinho
          AND scpe.Situacao NOT IN ('CANCELADA', 'EMBALANDO', 'ENTREGUE')
        ORDER BY scpe.CodCarrinhoPercurso,
          scpe.Item DESC
      ) cpe
      LEFT JOIN Expedicao.CarrinhoPercurso cp ON cp.CodEmpresa = scart.CodEmpresa
      AND cp.CodCarrinhoPercurso = cpe.CodCarrinhoPercurso
      LEFT JOIN Expedicao.PercursoEstagio pe ON pe.CodPercursoEstagio = cpe.CodPercursoEstagio
      LEFT JOIN CaixaOperador co ON co.CodUsuario = cpe.CodUsuarioInicio
      LEFT JOIN Expedicao.SetorEstoque se ON se.CodSetorEstoque = co.CodSetorEstoque
  ) CarrinhoConsulta
