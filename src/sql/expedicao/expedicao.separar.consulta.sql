SELECT
  SepararConsulta.CodEmpresa,
  SepararConsulta.CodSepararEstoque,
  SepararConsulta.Origem,
  SepararConsulta.CodOrigem,
  SepararConsulta.CodTipoOperacaoExpedicao,
  SepararConsulta.NomeTipoOperacaoExpedicao,
  SepararConsulta.Situacao,
  SepararConsulta.TipoEntidade,
  SepararConsulta.DataEmissao,
  SepararConsulta.HoraEmissao,
  SepararConsulta.CodEntidade,
  SepararConsulta.NomeEntidade,
  SepararConsulta.CodPrioridade,
  SepararConsulta.NomePrioridade,
  setores.CodSetoresEstoque,
  usuarios.CodUsuariosSeparacao,
  SepararConsulta.Historico,
  SepararConsulta.Observacao
FROM (
    SELECT
      se.CodEmpresa,
      se.CodSepararEstoque,
      se.Origem,
      se.CodOrigem,
      se.CodTipoOperacaoExpedicao,
      toe.Descricao NomeTipoOperacaoExpedicao,
      se.Situacao,
      se.TipoEntidade,
      se.Data DataEmissao,
      se.Hora HoraEmissao,
      se.CodEntidade,
      se.NomeEntidade,
      se.CodPrioridade,
      pri.Descricao NomePrioridade,
      se.Historico,
      se.Observacao
    FROM Expedicao.SepararEstoque se
    INNER JOIN Expedicao.TipoOperacaoExpedicao toe ON
      toe.CodEmpresa = se.CodEmpresa
      AND toe.CodTipoOperacaoExpedicao = se.CodTipoOperacaoExpedicao
    INNER JOIN Expedicao.Prioridade pri ON
      pri.CodPrioridade = se.CodPrioridade
  ) SepararConsulta
OUTER APPLY (
  SELECT STRING_AGG(sub.CodSetorEstoque, ',') AS CodSetoresEstoque
  FROM (
    SELECT seise.CodSetorEstoque
    FROM Expedicao.ItemSepararEstoque seise
    WHERE seise.CodEmpresa = SepararConsulta.CodEmpresa
      AND seise.CodSepararEstoque = SepararConsulta.CodSepararEstoque
    GROUP BY seise.CodEmpresa, seise.CodSepararEstoque, seise.CodSetorEstoque
  ) sub
) setores
OUTER APPLY (
  SELECT STRING_AGG(subu.CodUsuario, ',') AS CodUsuariosSeparacao
  FROM (
    SELECT esus.CodUsuario
    FROM Expedicao.SeparacaoUsuarioSetor esus
    WHERE esus.CodEmpresa = SepararConsulta.CodEmpresa
      AND esus.CodSepararEstoque = SepararConsulta.CodSepararEstoque
    GROUP BY esus.CodEmpresa, esus.CodSepararEstoque, esus.CodUsuario
  ) subu
) usuarios
