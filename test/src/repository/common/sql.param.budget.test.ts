import { describe, expect, it } from 'vitest';

import { Params } from '../../../../src/contracts/local.base.params';
import { Pagination } from '../../../../src/contracts/local.base.pagination';
import {
  SQL_IN_CHUNK,
  SQL_PARAM_BUDGET,
  chunkGroupsByBindBudget,
  chunkInValues,
  countGroupsBinds,
  expandParamsForInBudget,
  sliceRecordsetPage,
} from '../../../../src/repository/common/sql.param.budget';

function itemGroup(index: number): ReturnType<typeof Params.equals>[] {
  return [
    Params.equals('CodEmpresa', 1),
    Params.equals('CodSepararEstoque', 10),
    Params.equals('Item', String(index).padStart(5, '0')),
  ];
}

describe('sql.param.budget', () => {
  it('should keep two small groups in one chunk', () => {
    const groups = [itemGroup(1), itemGroup(2)];
    const chunks = chunkGroupsByBindBudget(groups);

    expect(chunks).toHaveLength(1);
    expect(countGroupsBinds(chunks[0])).toBe(6);
  });

  it('should split 800 three-bind groups under the SQL parameter budget', () => {
    const groups = Array.from({ length: 800 }, (_, index) => itemGroup(index + 1));
    const chunks = chunkGroupsByBindBudget(groups);

    expect(countGroupsBinds(groups)).toBe(2400);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.reduce((total, chunk) => total + chunk.length, 0)).toBe(800);
    for (const chunk of chunks) {
      expect(countGroupsBinds(chunk)).toBeLessThanOrEqual(SQL_PARAM_BUDGET);
    }
  });

  it('should expand a large IN list into budget-sized clauses', () => {
    const params = [
      Params.equals('CodEmpresa', 1),
      Params.in(
        'CodProduto',
        Array.from({ length: 1200 }, (_, index) => index + 1),
      ),
    ];
    const expanded = expandParamsForInBudget(params);

    expect(expanded.length).toBe(Math.ceil(1200 / SQL_IN_CHUNK));
    expect(expanded[0]).toHaveLength(2);
    expect((expanded[0][1].value as number[]).length).toBe(SQL_IN_CHUNK);
    expect((expanded[expanded.length - 1][1].value as number[]).length).toBe(1200 % SQL_IN_CHUNK);
  });

  it('should slice concatenated rows after chunking', () => {
    const rows = Array.from({ length: 800 }, (_, index) => ({ Item: index }));
    expect(sliceRecordsetPage(rows, Pagination.create(1500), false)).toHaveLength(800);
    expect(sliceRecordsetPage(rows, Pagination.create(10, 5), false)).toEqual(
      rows.slice(5, 15),
    );
    expect(sliceRecordsetPage(rows, undefined, true)).toHaveLength(800);
  });

  it('should chunk IN values without dropping the tail', () => {
    expect(chunkInValues([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    expect(chunkInValues([], 2)).toEqual([]);
  });
});
