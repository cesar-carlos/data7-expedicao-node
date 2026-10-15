import { describe, expect, it } from 'vitest';

import { OrderBy } from '../../../../src/contracts/local.base.orderby';
import { applySelectOrdering } from '../../../../src/repository/common/consulta.sql.helper';

const selectSql = 'SELECT CodEmpresa FROM LiberacaoBloqueio';

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
