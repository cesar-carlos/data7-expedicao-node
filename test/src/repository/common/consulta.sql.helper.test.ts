import { describe, expect, it } from 'vitest';
import type { ConnectionPool } from 'mssql';

import { OrderBy } from '../../../../src/contracts/local.base.orderby';
import { DEFAULT_PAGE_LIMIT, Pagination, Params } from '../../../../src/contracts/local.base.params';
import {
  KEEP_EVERY_UNIT_ROW,
  applySelectOrdering,
  applySelectPage,
  executeSelectWhere,
  executeSelectWhereAny,
  normalizeConsultaWhere,
  resolveSelectPagination,
} from '../../../../src/repository/common/consulta.sql.helper';
import { SQL_MAX_PARAMS, SQL_PARAM_BUDGET } from '../../../../src/repository/common/sql.param.budget';
import { SocketClientError } from '../../../../src/utils/repository.error';

const selectSql = 'SELECT CodEmpresa FROM LiberacaoBloqueio';

describe('normalizeConsultaWhere', () => {
  it('should keep an empty string as no filter', () => {
    expect(normalizeConsultaWhere('')).toEqual([]);
    expect(normalizeConsultaWhere([])).toEqual([]);
  });

  it('should keep a param object list', () => {
    expect(normalizeConsultaWhere([{ key: 'CodEmpresa', value: 1 }])).toEqual([{ key: 'CodEmpresa', value: 1 }]);
  });

  it('should keep a raw SQL Where string as a legacy fragment', () => {
    expect(normalizeConsultaWhere('CodEmpresa = 1 AND CodCarrinho = 94')).toEqual({
      kind: 'legacySql',
      sql: 'CodEmpresa = 1 AND CodCarrinho = 94',
    });
  });

  it('should join a string array Where with AND', () => {
    expect(normalizeConsultaWhere(['CodEmpresa = 1', 'CodCarrinho = 94'])).toEqual({
      kind: 'legacySql',
      sql: 'CodEmpresa = 1 AND CodCarrinho = 94',
    });
  });

  it('should still reject an object that is not a param list', () => {
    expect(() => normalizeConsultaWhere({ CodEmpresa: 1 })).toThrow(SocketClientError);
  });
});

describe('resolveSelectPagination', () => {
  it('should use the default page when the caller omits pagination', () => {
    const page = resolveSelectPagination(undefined);

    expect(page.limit).toBe(DEFAULT_PAGE_LIMIT);
    expect(page.offset).toBe(0);
  });

  it('should keep an explicit page', () => {
    const page = resolveSelectPagination(Pagination.create(20, 40, 3));

    expect(page.limit).toBe(20);
    expect(page.offset).toBe(40);
  });
});

describe('applySelectPage', () => {
  it('should keep every unit row when the unit consulta opts out of the page', () => {
    const assembled = applySelectPage(selectSql, undefined, undefined, KEEP_EVERY_UNIT_ROW);

    expect(assembled.sqlText).toBe(selectSql);
    expect(assembled.page).toBeUndefined();
  });

  it('should keep an explicit page on the unit consulta', () => {
    const assembled = applySelectPage(selectSql, undefined, Pagination.create(25, 10, 2), KEEP_EVERY_UNIT_ROW);

    expect(assembled.sqlText).toBe(
      `${selectSql} ORDER BY (SELECT NULL) OFFSET @__pg_offset ROWS FETCH NEXT @__pg_limit ROWS ONLY`,
    );
    expect(assembled.page?.limit).toBe(25);
    expect(assembled.page?.offset).toBe(10);
  });

  it('should keep the page cap for the other consultas', () => {
    const assembled = applySelectPage(selectSql, undefined, undefined, false);

    expect(assembled.sqlText).toBe(
      `${selectSql} ORDER BY (SELECT NULL) OFFSET @__pg_offset ROWS FETCH NEXT @__pg_limit ROWS ONLY`,
    );
    expect(assembled.page?.limit).toBe(DEFAULT_PAGE_LIMIT);
    expect(assembled.page?.offset).toBe(0);
  });
});

describe('applySelectOrdering', () => {
  it('should keep the select unchanged when there is no page and no order', () => {
    expect(applySelectOrdering(selectSql, undefined, false)).toBe(selectSql);
  });

  it('should append a null order only when the caller paginates', () => {
    expect(applySelectOrdering(selectSql, undefined, true)).toBe(`${selectSql} ORDER BY (SELECT NULL)`);
  });

  it('should use the caller order with and without pagination', () => {
    const orderBy = OrderBy.create('CodEmpresa', 'DESC');
    const expected = `${selectSql} ORDER BY CodEmpresa DESC`;

    expect(applySelectOrdering(selectSql, orderBy, false)).toBe(expected);
    expect(applySelectOrdering(selectSql, orderBy, true)).toBe(expected);
  });

  it('should ignore an invalid order and still paginate', () => {
    const orderBy = OrderBy.create('CodEmpresa; DROP TABLE', 'ASC');

    expect(applySelectOrdering(selectSql, orderBy, false)).toBe(selectSql);
    expect(applySelectOrdering(selectSql, orderBy, true)).toBe(`${selectSql} ORDER BY (SELECT NULL)`);
  });
});

function createTrackingPool() {
  const queries: Array<{ sql: string; bindCount: number }> = [];
  const pool = {
    request() {
      let bindCount = 0;
      const request = {
        input() {
          bindCount += 1;
          return request;
        },
        async query(sqlText: string) {
          queries.push({ sql: sqlText, bindCount });
          const pageBinds = sqlText.includes('__pg_limit') ? 2 : 0;
          const whereBinds = bindCount - pageBinds;
          const rows = Math.max(0, Math.floor(whereBinds / 3));
          return {
            recordset: Array.from({ length: rows }, (_, index) => ({
              Item: `${queries.length}:${index}`,
            })),
          };
        },
      };
      return request;
    },
  };
  return { pool: pool as unknown as ConnectionPool, queries };
}

describe('executeSelectWhereAny parameter budget', () => {
  it('should keep two small groups in one query', async () => {
    const { pool, queries } = createTrackingPool();
    const result = await executeSelectWhereAny(
      pool,
      selectSql,
      [
        [Params.equals('CodEmpresa', 1), Params.equals('CodSepararEstoque', 10), Params.equals('Item', '00001')],
        [Params.equals('CodEmpresa', 1), Params.equals('CodSepararEstoque', 10), Params.equals('Item', '00002')],
      ],
      Pagination.create(10),
      undefined,
    );

    expect(queries).toHaveLength(1);
    expect(queries[0].sql).toContain('OFFSET');
    expect(queries[0].bindCount).toBe(8);
    expect(result.recordset).toHaveLength(2);
  });

  it('should split 800 three-bind groups and return the union without exceeding 2100 binds', async () => {
    const { pool, queries } = createTrackingPool();
    const groups = Array.from({ length: 800 }, (_, index) => [
      Params.equals('CodEmpresa', 1),
      Params.equals('CodSepararEstoque', 10),
      Params.equals('Item', String(index + 1).padStart(5, '0')),
    ]);

    const result = await executeSelectWhereAny(
      pool,
      selectSql,
      groups,
      Pagination.create(1500),
      undefined,
    );

    expect(queries.length).toBeGreaterThan(1);
    for (const query of queries) {
      expect(query.bindCount).toBeLessThanOrEqual(SQL_PARAM_BUDGET);
      expect(query.bindCount).toBeLessThan(SQL_MAX_PARAMS);
      expect(query.sql).not.toContain('OFFSET');
    }
    expect(result.recordset).toHaveLength(800);
  });
});

describe('executeSelectWhere IN budget', () => {
  it('should split a large IN list across requests under the parameter budget', async () => {
    const { pool, queries } = createTrackingPool();
    await executeSelectWhere(
      pool,
      selectSql,
      [
        Params.equals('CodEmpresa', 1),
        Params.in(
          'CodProduto',
          Array.from({ length: 2500 }, (_, index) => index + 1),
        ),
      ],
      Pagination.create(1500),
      undefined,
    );

    expect(queries.length).toBeGreaterThan(1);
    for (const query of queries) {
      expect(query.bindCount).toBeLessThanOrEqual(SQL_PARAM_BUDGET);
      expect(query.bindCount).toBeLessThan(SQL_MAX_PARAMS);
    }
  });
});
