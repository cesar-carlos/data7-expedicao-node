SELECT *
FROM (
    SELECT ic.CodEmpresa,
      ic.CodConferir,
      cf.Origem,
      cf.CodOrigem,
      cf.Situacao,
      ic.CodCarrinhoPercurso,
      ic.ItemCarrinhoPercurso,
      cf.CodPrioridade,
      prio.Descricao NomePrioridade,
      cpe.CodCarrinho,
      cart.Descricao NomeCarrinho,
      cart.CodigoBarras CodigoBarrasCarrinho,
      cart.Situacao SituacaoCarrinho,
      COALESCE(
        (
          SELECT TOP 1 scpe.Situacao
          FROM Expedicao.CarrinhoPercursoEstagio scpe
          WHERE scpe.CodEmpresa = ic.CodEmpresa
            AND scpe.CodCarrinhoPercurso = ic.CodCarrinhoPercurso
            AND scpe.CodCarrinho = cpe.CodCarrinho
            AND scpe.Origem IN ('CO')
            AND scpe.Situacao NOT IN ('CANCELADA')
          ORDER BY scpe.CodCarrinhoPercurso DESC
        ),
        'AGUARDANDO'
      ) SituacaoCarrinhoConferencia,
      cp.DataInicio DataInicioPercurso,
      cp.HoraInicio HoraInicioPercurso,
      cpe.CodPercursoEstagio,
      est.Descricao NomePercursoEstagio,
      cpe.CodUsuarioInicio CodUsuarioInicioEstagio,
      cpe.NomeUsuarioInicio NomeUsuarioInicioEstagio,
      cpe.DataInicio DataInicioEstagio,
      cpe.HoraInicio HoraInicioEstagio,
      cpe.CodUsuarioFinalizacao CodUsuarioFinalizacaoEstagio,
      cpe.NomeUsuarioFinalizacao NomeUsuarioFinalizacaoEstagio,
      cpe.DataFinalizacao DataFinalizacaoEstagio,
      cpe.HoraFinalizacao HoraFinalizacaoEstagio
    FROM Expedicao.ItemConferir ic
      INNER JOIN Expedicao.Conferir cf ON cf.CodEmpresa = ic.CodEmpresa
      AND cf.CodConferir = ic.CodConferir
      INNER JOIN Expedicao.CarrinhoPercursoEstagio cpe ON cpe.CodEmpresa = ic.CodEmpresa
      AND cpe.CodCarrinhoPercurso = ic.CodCarrinhoPercurso
      AND cpe.Item = ic.ItemCarrinhoPercurso
      LEFT JOIN Expedicao.Prioridade prio ON prio.CodPrioridade = cf.CodPrioridade
      LEFT JOIN Expedicao.PercursoEstagio est ON est.CodPercursoEstagio = cpe.CodPercursoEstagio
      INNER JOIN Expedicao.CarrinhoPercurso cp ON cp.CodEmpresa = ic.CodEmpresa
      AND cp.CodCarrinhoPercurso = ic.CodCarrinhoPercurso
      INNER JOIN Expedicao.Carrinho cart ON cart.CodEmpresa = cpe.CodEmpresa
      AND cart.CodCarrinho = cpe.CodCarrinho
    GROUP BY ic.CodEmpresa,
      ic.CodConferir,
      cf.Origem,
      cf.CodOrigem,
      cf.Situacao,
      ic.CodCarrinhoPercurso,
      ic.ItemCarrinhoPercurso,
      cf.CodPrioridade,
      prio.Descricao,
      cpe.CodCarrinho,
      cart.Descricao,
      cart.CodigoBarras,
      cart.Situacao,
      cp.DataInicio,
      cp.HoraInicio,
      cpe.CodPercursoEstagio,
      est.Descricao,
      cpe.CodUsuarioInicio,
      cpe.NomeUsuarioInicio,
      cpe.DataInicio,
      cpe.HoraInicio,
      cpe.CodUsuarioFinalizacao,
      cpe.NomeUsuarioFinalizacao,
      cpe.DataFinalizacao,
      cpe.HoraFinalizacao
  ) CarrinhoConferirConsulta