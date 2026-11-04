import { describe, expect, it } from 'vitest';
import type { Request } from 'mssql';

import { Params } from '../../../../src/contracts/local.base.params';
import ParamsCommonRepository from '../../../../src/repository/common/params.common';

describe('buildWhereAnyOf', () => {
  it('should OR each pair instead of AND-ing every key together', () => {
    const where = ParamsCommonRepository.buildWhereAnyOf([
      [Params.equals('CodEmpresa', 1), Params.equals('CodSepararEstoque', 10)],
      [Params.equals('CodEmpresa', 1), Params.equals('CodSepararEstoque', 20)],
    ]);
    const bound: Array<{ name: string; value: unknown }> = [];
    const request = {
      input(name: string, _type: unknown, value: unknown) {
        bound.push({ name, value });
        return request;
      },
    };

    where.apply(request as unknown as Request);

    expect(where.whereFragment).toBe(
      '(CodEmpresa = @wp_0 AND CodSepararEstoque = @wp_1) OR (CodEmpresa = @wp_2 AND CodSepararEstoque = @wp_3)',
    );
    expect(bound.map((item) => item.value)).toEqual([1, 10, 1, 20]);
  });

  it('should match nothing when there is no group', () => {
    const where = ParamsCommonRepository.buildWhereAnyOf([]);
    expect(where.whereFragment).toBe('1=0');
  });
});
