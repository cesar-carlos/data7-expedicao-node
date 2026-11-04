import { readFileSync } from 'fs';
import path from 'path';
import sql from 'mssql';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Params } from '../../../../src/contracts/local.base.params';
import { DEFAULT_PAGE_LIMIT, Pagination } from '../../../../src/contracts/local.base.pagination';
import ExpedicaoItemSituacaoModel from '../../../../src/model/expedicao.item.situacao.model';
import {
  executeSelectWhere,
  executeSelectWhereAny,
} from '../../../../src/repository/common/consulta.sql.helper';
import ParamsCommonRepository from '../../../../src/repository/common/params.common';

const password = process.env.TEST_DB_PASSWORD;
const describeDb = password ? describe : describe.skip;

function readSql(relativePath: string): string {
  return readFileSync(path.resolve(__dirname, '../../../../src/sql', relativePath), 'utf8');
}

describeDb('consultas limitadas na base Estacao', () => {
  let pool: sql.ConnectionPool;

  beforeAll(async () => {
    pool = await sql.connect({
      user: 'sa',
      password,
      server: 'localhost',
      database: 'Estacao',
      options: {
        instanceName: 'DATA7',
        trustServerCertificate: true,
        encrypt: false,
      },
      requestTimeout: 60000,
      connectionTimeout: 20000,
    });
  }, 30000);

  afterAll(async () => {
    await pool?.close();
  });

  async function expectBounded(sqlFile: string, limit = DEFAULT_PAGE_LIMIT): Promise<number> {
    const result = await executeSelectWhere(pool, readSql(sqlFile), [], Pagination.create(limit), undefined);
    expect(result.recordset.length).toBeLessThanOrEqual(limit);
    return result.recordset.length;
  }

  it('should cap separar item consulta when pagination is omitted', async () => {
    const result = await executeSelectWhere(
      pool,
      readSql('expedicao/expedicao.item.separar.consulta.sql'),
      [],
      undefined,
      undefined,
    );
    expect(result.recordset.length).toBeLessThanOrEqual(DEFAULT_PAGE_LIMIT);
  }, 60000);

  it('should run the fat consulta views with an explicit page', async () => {
    const files = [
      'expedicao/expedicao.item.separar.consulta.sql',
      'expedicao/expedicao.item.separar.unidade.medida.consulta.sql',
      'expedicao/expedicao.item.separacao.consulta.sql',
      'expedicao/expedicao.item.conferencia.consulta.sql',
      'expedicao/expedicao.separar.consulta.sql',
      'expedicao/expedicao.conferir.consulta.sql',
      'expedicao/expedicao.carrinho.consulta.sql',
      'expedicao/expedicao.carrinho.percurso.estagio.consulta.sql',
      'expedicao/expedicao.carrinho.percurso.select.sql',
      'common.data/usuario.consulta.sql',
    ];

    for (const file of files) {
      const rows = await expectBounded(file, 20);
      expect(rows).toBeGreaterThanOrEqual(0);
    }
  }, 120000);

  it('should query separar item pairs with OR and a row cap', async () => {
    const keys = await pool.request().query<{ CodEmpresa: number; CodSepararEstoque: number }>(
      'SELECT TOP 2 CodEmpresa, CodSepararEstoque FROM Expedicao.ItemSepararEstoque',
    );
    const groups = keys.recordset.map((row) => [
      Params.equals('CodEmpresa', row.CodEmpresa),
      Params.equals('CodSepararEstoque', row.CodSepararEstoque),
    ]);
    const result = await executeSelectWhereAny(
      pool,
      readSql('expedicao/expedicao.item.separar.consulta.sql'),
      groups,
      Pagination.create(10),
      undefined,
    );
    expect(result.recordset.length).toBeLessThanOrEqual(10);

    const medidas = await executeSelectWhereAny(
      pool,
      readSql('expedicao/expedicao.item.separar.unidade.medida.consulta.sql'),
      groups,
      Pagination.create(30),
      undefined,
    );
    expect(medidas.recordset.length).toBeLessThanOrEqual(30);
  }, 60000);

  it('should query estagio, separar, conferir, carrinho and usuario by key groups', async () => {
    const estagio = await pool.request().query<{ CodEmpresa: number; CodCarrinhoPercurso: number; Item: number }>(
      'SELECT TOP 2 CodEmpresa, CodCarrinhoPercurso, Item FROM Expedicao.CarrinhoPercursoEstagio',
    );
    const estagioRows = await executeSelectWhereAny(
      pool,
      readSql('expedicao/expedicao.carrinho.percurso.estagio.consulta.sql'),
      estagio.recordset.map((row) => [
        Params.equals('CodEmpresa', row.CodEmpresa),
        Params.equals('CodCarrinhoPercurso', row.CodCarrinhoPercurso),
        Params.equals('Item', row.Item),
      ]),
      Pagination.create(10),
      undefined,
    );
    expect(estagioRows.recordset.length).toBeLessThanOrEqual(10);

    const separar = await pool.request().query<{ CodEmpresa: number; CodSepararEstoque: number }>(
      'SELECT TOP 2 CodEmpresa, CodSepararEstoque FROM Expedicao.SepararEstoque',
    );
    const separarRows = await executeSelectWhereAny(
      pool,
      readSql('expedicao/expedicao.separar.consulta.sql'),
      separar.recordset.map((row) => [
        Params.equals('CodEmpresa', row.CodEmpresa),
        Params.equals('CodSepararEstoque', row.CodSepararEstoque),
      ]),
      Pagination.create(4),
      undefined,
    );
    expect(separarRows.recordset.length).toBeLessThanOrEqual(4);

    const conferir = await pool.request().query<{ CodEmpresa: number; CodConferir: number }>(
      'SELECT TOP 2 CodEmpresa, CodConferir FROM Expedicao.Conferir',
    );
    const conferirRows = await executeSelectWhereAny(
      pool,
      readSql('expedicao/expedicao.conferir.consulta.sql'),
      conferir.recordset.map((row) => [
        Params.equals('CodEmpresa', row.CodEmpresa),
        Params.equals('CodConferir', row.CodConferir),
      ]),
      Pagination.create(4),
      undefined,
    );
    expect(conferirRows.recordset.length).toBeLessThanOrEqual(4);

    const carrinho = await pool.request().query<{ CodCarrinho: number }>('SELECT TOP 2 CodCarrinho FROM Expedicao.Carrinho');
    const carrinhoRows = await executeSelectWhereAny(
      pool,
      readSql('expedicao/expedicao.carrinho.consulta.sql'),
      carrinho.recordset.map((row) => [Params.equals('CodCarrinho', row.CodCarrinho)]),
      Pagination.create(10),
      undefined,
    );
    expect(carrinhoRows.recordset.length).toBeLessThanOrEqual(10);

    const percurso = await pool.request().query<{ CodEmpresa: number; CodCarrinhoPercurso: number }>(
      'SELECT TOP 2 CodEmpresa, CodCarrinhoPercurso FROM Expedicao.CarrinhoPercurso',
    );
    const percursoRows = await executeSelectWhereAny(
      pool,
      readSql('expedicao/expedicao.carrinho.percurso.select.sql'),
      percurso.recordset.map((row) => [
        Params.equals('CodEmpresa', row.CodEmpresa),
        Params.equals('CodCarrinhoPercurso', row.CodCarrinhoPercurso),
      ]),
      Pagination.create(4),
      undefined,
    );
    expect(percursoRows.recordset.length).toBeLessThanOrEqual(4);

    const usuario = await pool.request().query<{ CodUsuario: number }>(
      "SELECT TOP 2 CodUsuario FROM Usuario WHERE Grupo = 'N'",
    );
    const usuarioRows = await executeSelectWhereAny(
      pool,
      readSql('common.data/usuario.consulta.sql'),
      usuario.recordset.map((row) => [Params.equals('CodUsuario', row.CodUsuario)]),
      Pagination.create(10),
      undefined,
    );
    expect(usuarioRows.recordset.length).toBeLessThanOrEqual(10);
  }, 120000);

  it('should sum active separacao and conferencia quantities in SQL', async () => {
    const separacao = await pool.request().query<{
      CodEmpresa: number;
      CodSepararEstoque: number;
      CodProduto: number;
    }>('SELECT TOP 1 CodEmpresa, CodSepararEstoque, CodProduto FROM Expedicao.ItemSeparacaoEstoque');
    const row = separacao.recordset[0];
    expect(row).toBeTruthy();

    const total = await pool
      .request()
      .input('CodEmpresa', sql.Int, row.CodEmpresa)
      .input('CodSepararEstoque', sql.Int, row.CodSepararEstoque)
      .input('CodProduto', sql.Int, row.CodProduto)
      .input('Cancelado', sql.VarChar(30), ExpedicaoItemSituacaoModel.cancelado)
      .query(`SELECT ISNULL(SUM(Quantidade), 0) AS Total
        FROM Expedicao.ItemSeparacaoEstoque
        WHERE CodEmpresa = @CodEmpresa
          AND CodSepararEstoque = @CodSepararEstoque
          AND CodProduto = @CodProduto
          AND ISNULL(Situacao, '') <> @Cancelado`);
    expect(Number(total.recordset[0].Total)).toBeGreaterThanOrEqual(0);

    const conferencia = await pool.request().query<{
      CodEmpresa: number;
      CodConferir: number;
      CodCarrinho: number;
      CodProduto: number;
    }>(`SELECT TOP 1 CodEmpresa, CodConferir, CodCarrinho, CodProduto
      FROM (
        ${readSql('expedicao/expedicao.item.conferencia.consulta.sql')}
      ) conferencia_key
      WHERE CodCarrinho IS NOT NULL AND CodProduto IS NOT NULL`);
    const item = conferencia.recordset[0];
    expect(item).toBeTruthy();

    const groups = [[
      Params.equals('CodEmpresa', item.CodEmpresa),
      Params.equals('CodConferir', item.CodConferir),
      Params.equals('CodCarrinho', item.CodCarrinho),
      Params.equals('CodProduto', item.CodProduto),
    ]];
    const where = ParamsCommonRepository.buildWhereAnyOf(groups);
    const request = pool.request();
    where.apply(request);
    request.input('qty_cancelado', sql.VarChar(30), ExpedicaoItemSituacaoModel.cancelado);
    const summed = await request.query(`SELECT CodEmpresa, CodConferir, CodCarrinho, CodProduto,
        ISNULL(SUM(CASE WHEN ISNULL(Situacao, '') <> @qty_cancelado THEN Quantidade ELSE 0 END), 0) AS Total
      FROM (
        ${readSql('expedicao/expedicao.item.conferencia.consulta.sql')}
      ) qty_src
      WHERE ${where.whereFragment}
      GROUP BY CodEmpresa, CodConferir, CodCarrinho, CodProduto`);
    expect(summed.recordset.length).toBeLessThanOrEqual(1);
    if (summed.recordset.length === 1) {
      expect(Number(summed.recordset[0].Total)).toBeGreaterThanOrEqual(0);
    }
  }, 60000);
});
