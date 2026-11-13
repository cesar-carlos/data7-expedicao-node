import { readFileSync } from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import type { ConnectionPool } from 'mssql';

import { OrderBy, Pagination, Params } from '../../../../src/contracts/local.base.params';
import { executeSelectWhere } from '../../../../src/repository/common/consulta.sql.helper';

const selectSql = readFileSync(
  path.resolve(__dirname, '../../../../src/sql/expedicao/expedicao.separar.consulta.sql'),
  'utf8',
);

function createTrackingPool(): { pool: ConnectionPool; queries: string[] } {
  const queries: string[] = [];
  const pool = {
    request() {
      const request = {
        input() {
          return request;
        },
        async query(sqlText: string) {
          queries.push(sqlText);
          return { recordset: [] };
        },
      };
      return request;
    },
  };
  return { pool: pool as unknown as ConnectionPool, queries };
}

describe('expedicao.separar.consulta.sql', () => {
  it('should aggregate setores and usuarios after the SepararEstoque page, not inside it', () => {
    const inner = selectSql.match(/FROM\s*\(([\s\S]*?)\)\s*SepararConsulta/i);
    expect(inner?.[1]).toBeTruthy();
    expect(inner?.[1]).not.toMatch(/STRING_AGG/i);
    expect(selectSql).toMatch(/\)\s*SepararConsulta\s*OUTER APPLY[\s\S]*STRING_AGG[\s\S]*OUTER APPLY[\s\S]*STRING_AGG/i);
  });

  it('should keep the SepararConsulta alias for CodSetorEstoque EXISTS and page after APPLY', async () => {
    const { pool, queries } = createTrackingPool();

    await executeSelectWhere(
      pool,
      selectSql,
      [Params.equals('CodEmpresa', 1), Params.equals('CodSetorEstoque', 3)],
      Pagination.create(20, 0, 1),
      OrderBy.create('CodEmpresa, CodSepararEstoque', 'ASC,DESC'),
      true,
    );

    expect(queries).toHaveLength(1);
    const sqlText = queries[0];
    expect(sqlText).toContain('ise.CodEmpresa = SepararConsulta.CodEmpresa');
    expect(sqlText).toContain('ise.CodSepararEstoque = SepararConsulta.CodSepararEstoque');
    expect(sqlText.indexOf('OUTER APPLY')).toBeGreaterThan(-1);
    expect(sqlText.indexOf('OUTER APPLY')).toBeLessThan(sqlText.indexOf('OFFSET'));
    expect(sqlText).toContain('OFFSET @__pg_offset ROWS FETCH NEXT @__pg_limit ROWS ONLY');
    expect(sqlText).toMatch(/SET LOCK_TIMEOUT \d+;/);
  });

  it('should rewrite CodSetoresEstoque LIKE into EXISTS before aggregating', async () => {
    const { pool, queries } = createTrackingPool();

    await executeSelectWhere(
      pool,
      selectSql,
      [Params.equals('CodEmpresa', 1), Params.like('CodSetoresEstoque', '%3%')],
      Pagination.create(20, 0, 1),
      undefined,
      true,
    );

    expect(queries[0]).toContain('ise.CodSetorEstoque = @');
    expect(queries[0]).not.toContain('CodSetoresEstoque LIKE');
    expect(queries[0]).toMatch(/SET LOCK_TIMEOUT \d+;/);
  });
});
