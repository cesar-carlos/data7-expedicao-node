import sql from 'mssql';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Params } from '../../../../src/contracts/local.base.params';
import { buildSeparacaoUsuarioSetorConsultaQuery } from '../../../../src/repository/expedicao/separacao.usuario.setor.consulta.query';

const password = process.env.TEST_DB_PASSWORD;
const describeDb = password ? describe : describe.skip;

const LEGACY_SQL = `SELECT *
FROM (
SELECT
    se.CodEmpresa,
    se.CodSepararEstoque,
    se.Situacao SepararEstoqueSituacao,
    ise.CodSetorEstoque,
	ese.Descricao DescricaoSetorEstoque,
    prio.CodPrioridade,
	prio.Descricao DescricaoPrioridade,
	prio.Prioridade,
   MAX(tot.QuantidadeItens) QuantidadeItens,
   MAX(tot.QuantidadeItensSeparacao) QuantidadeItensSeparacao,
    SUM(ise.Quantidade) QuantidadeItensSetor,
    SUM(ise.QuantidadeSeparacao) QuantidadeItensSeparacaoSetor,
   (SELECT CASE
        WHEN EXISTS (
          SELECT 1
          FROM Expedicao.CarrinhoPercursoEstagio cpe
          WHERE cpe.Origem = 'SE'
            AND cpe.CodEmpresa = se.CodEmpresa
            AND cpe.CodOrigem = se.CodSepararEstoque
            AND cpe.CodUsuarioInicio = sut.CodUsuario
            AND cpe.Situacao NOT IN ('CANCELADA')
            AND cpe.DataFinalizacao IS NULL
        ) THEN 'S'
        ELSE 'N'
      END
   ) CarrinhosAbertosUsuario,
    sut.CodUsuario,
    sut.NomeUsuario,
    sut.EstacaoSeparacao
FROM Expedicao.ItemSepararEstoque ise
INNER JOIN Expedicao.SepararEstoque se ON
    se.CodEmpresa = ise.CodEmpresa
AND se.CodSepararEstoque = ise.CodSepararEstoque
LEFT JOIN Expedicao.Prioridade prio ON
    prio.CodPrioridade = se.CodPrioridade
INNER JOIN Produto prod ON
    prod.CodProduto = ise.CodProduto
LEFT JOIN Expedicao.SeparacaoUsuarioSetor sut ON
    sut.CodEmpresa = ise.CodEmpresa
AND sut.CodSepararEstoque = ise.CodSepararEstoque
AND sut.CodSetorEstoque = ise.CodSetorEstoque
LEFT JOIN Expedicao.SetorEstoque ese ON
	ese.CodSetorEstoque = ise.CodSetorEstoque
LEFT JOIN (
    SELECT sise.CodEmpresa,
      sise.CodSepararEstoque,
      SUM(sise.Quantidade) QuantidadeItens,
      SUM(sise.QuantidadeSeparacao) QuantidadeItensSeparacao
    FROM Expedicao.ItemSepararEstoque sise
    GROUP BY sise.CodEmpresa,
      sise.CodSepararEstoque
  ) tot ON tot.CodEmpresa = se.CodEmpresa
  AND tot.CodSepararEstoque = se.CodSepararEstoque
GROUP By
    se.CodEmpresa,
    se.CodSepararEstoque,
    se.Situacao,
    ise.CodSetorEstoque,
	ese.Descricao,
    prio.CodPrioridade,
	prio.Descricao,
	prio.Prioridade,
    sut.CodUsuario,
    sut.NomeUsuario,
    sut.EstacaoSeparacao
) SeparacaoUsuarioSetorConsulta`;

const COLUMNS = [
  'CodEmpresa',
  'CodSepararEstoque',
  'SepararEstoqueSituacao',
  'CodSetorEstoque',
  'DescricaoSetorEstoque',
  'CodPrioridade',
  'DescricaoPrioridade',
  'Prioridade',
  'QuantidadeItens',
  'QuantidadeItensSeparacao',
  'QuantidadeItensSetor',
  'QuantidadeItensSeparacaoSetor',
  'CarrinhosAbertosUsuario',
  'CodUsuario',
  'NomeUsuario',
  'EstacaoSeparacao',
] as const;

function cell(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value.trim())) return String(Number(value));
  return String(value);
}

function signatureSql(source: string): string {
  return `SELECT COUNT(*) AS qtd,
    CHECKSUM_AGG(BINARY_CHECKSUM(
      CodEmpresa, CodSepararEstoque, SepararEstoqueSituacao, CodSetorEstoque, DescricaoSetorEstoque,
      CodPrioridade, DescricaoPrioridade, Prioridade,
      CONVERT(decimal(18, 4), QuantidadeItens),
      CONVERT(decimal(18, 4), QuantidadeItensSeparacao),
      CONVERT(decimal(18, 4), QuantidadeItensSetor),
      CONVERT(decimal(18, 4), QuantidadeItensSeparacaoSetor),
      CarrinhosAbertosUsuario, CodUsuario, NomeUsuario, EstacaoSeparacao
    )) AS sig
  FROM (${source}) assinatura`;
}

describeDb('consulta de usuario e setor equivale a anterior na base Estacao', () => {
  let pool: sql.ConnectionPool;

  beforeAll(async () => {
    pool = await sql.connect({
      user: 'sa',
      password,
      server: 'localhost',
      database: 'Estacao',
      options: { instanceName: 'DATA7', trustServerCertificate: true, encrypt: false },
      requestTimeout: 180000,
      connectionTimeout: 20000,
    });
  }, 30000);

  afterAll(async () => {
    await pool?.close();
  });

  async function signature(source: string, apply?: (request: sql.Request) => void): Promise<{ qtd: number; sig: number | null; ms: number }> {
    const request = pool.request();
    apply?.(request);
    const started = Date.now();
    const result = await request.query(signatureSql(source));
    return { qtd: Number(result.recordset[0].qtd), sig: result.recordset[0].sig, ms: Date.now() - started };
  }

  async function sameResult(label: string, legacyWhere: string, params: Parameters<typeof buildSeparacaoUsuarioSetorConsultaQuery>[0], applyLegacy?: (request: sql.Request) => void) {
    const built = buildSeparacaoUsuarioSetorConsultaQuery(params);
    const legacy = await signature(`${LEGACY_SQL} ${legacyWhere}`, applyLegacy);
    const modern = await signature(
      built.outerParams.length > 0 ? `${built.sql} WHERE ${built.outerParams.map((param) => `${param.key} ${param.operator ?? '='} @outer_${param.key}`).join(' AND ')}` : built.sql,
      (request) => {
        built.apply(request);
        for (const param of built.outerParams) {
          request.input(`outer_${param.key}`, param.value as never);
        }
      },
    );
    console.log(`${label} legacyMs=${legacy.ms} modernMs=${modern.ms} rows=${modern.qtd}`);
    expect(modern.qtd, label).toBe(legacy.qtd);
    expect(modern.sig, label).toBe(legacy.sig);
  }

  it('devolve as mesmas linhas com e sem filtro', async () => {
    const sample = await pool.request().query(`
      SELECT TOP 1 CodEmpresa, CodSepararEstoque
      FROM Expedicao.ItemSepararEstoque
      GROUP BY CodEmpresa, CodSepararEstoque
      ORDER BY COUNT(*) DESC
    `);
    const order = sample.recordset[0];
    const user = await pool.request().query(`
      SELECT TOP 1 CodUsuario
      FROM Expedicao.SeparacaoUsuarioSetor
      GROUP BY CodUsuario
      HAVING COUNT(*) BETWEEN 1 AND 30
      ORDER BY COUNT(*) DESC
    `);
    const heavyUser = await pool.request().query(`
      SELECT TOP 1 CodUsuario
      FROM Expedicao.SeparacaoUsuarioSetor
      GROUP BY CodUsuario
      ORDER BY COUNT(*) DESC
    `);
    const setor = await pool.request().query(`
      SELECT TOP 1 CodSetorEstoque FROM Expedicao.ItemSepararEstoque WHERE CodSetorEstoque IS NOT NULL
    `);

    await sameResult('sem filtro', '', []);
    await sameResult(
      'separacao',
      'WHERE CodEmpresa = @codEmpresa AND CodSepararEstoque = @codSeparar',
      [Params.equals('CodEmpresa', order.CodEmpresa), Params.equals('CodSepararEstoque', order.CodSepararEstoque)],
      (request) => {
        request.input('codEmpresa', sql.Int, order.CodEmpresa);
        request.input('codSeparar', sql.Int, order.CodSepararEstoque);
      },
    );
    await sameResult(
      'usuario',
      'WHERE CodUsuario = @codUsuario',
      [Params.equals('CodUsuario', user.recordset[0].CodUsuario)],
      (request) => request.input('codUsuario', sql.Int, user.recordset[0].CodUsuario),
    );
    await sameResult(
      'usuario com mais atribuicoes',
      'WHERE CodUsuario = @codUsuario',
      [Params.equals('CodUsuario', heavyUser.recordset[0].CodUsuario)],
      (request) => request.input('codUsuario', sql.Int, heavyUser.recordset[0].CodUsuario),
    );
    await sameResult(
      'setor',
      'WHERE CodSetorEstoque = @codSetor',
      [Params.equals('CodSetorEstoque', setor.recordset[0].CodSetorEstoque)],
      (request) => request.input('codSetor', sql.Int, setor.recordset[0].CodSetorEstoque),
    );
    await sameResult('separando', "WHERE SepararEstoqueSituacao = 'SEPARANDO'", [
      Params.equals('SepararEstoqueSituacao', 'SEPARANDO'),
    ]);

    const builtRows = buildSeparacaoUsuarioSetorConsultaQuery([
      Params.equals('CodEmpresa', order.CodEmpresa),
      Params.equals('CodSepararEstoque', order.CodSepararEstoque),
    ]);
    const orderBy = 'ORDER BY CodEmpresa, CodSepararEstoque, CodSetorEstoque, CodUsuario, NomeUsuario, EstacaoSeparacao';
    const legacyRows = await pool
      .request()
      .input('codEmpresa', sql.Int, order.CodEmpresa)
      .input('codSeparar', sql.Int, order.CodSepararEstoque)
      .query(`${LEGACY_SQL} WHERE CodEmpresa = @codEmpresa AND CodSepararEstoque = @codSeparar ${orderBy}`);
    const modernRequest = pool.request();
    builtRows.apply(modernRequest);
    const modernRows = await modernRequest.query(`${builtRows.sql} ${orderBy}`);
    const project = (row: Record<string, unknown>) => COLUMNS.map((column) => cell(row[column])).join('|');
    expect(modernRows.recordset.map(project)).toEqual(legacyRows.recordset.map(project));
  }, 180000);
});
