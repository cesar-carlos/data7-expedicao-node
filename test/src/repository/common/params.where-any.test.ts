import { describe, expect, it } from 'vitest';
import type { Request } from 'mssql';

import { Params, type Param } from '../../../../src/contracts/local.base.params';
import ParamsCommonRepository from '../../../../src/repository/common/params.common';

describe('Params.isValid null operators', () => {
  it('should accept IS NULL without value', () => {
    expect(Params.isValid({ key: 'CodUsuario', operator: 'IS NULL' } as Param)).toBe(true);
    expect(Params.isValid({ key: 'CodUsuario', operator: 'IS', value: null })).toBe(true);
    expect(Params.isValid({ key: 'CodEmpresa', value: undefined } as Param)).toBe(false);
  });
});

describe('buildWhereParameterized null operators', () => {
  it('should emit IS NULL without a bind when value is omitted', () => {
    const where = ParamsCommonRepository.buildWhereParameterized([
      { key: 'CodUsuario', operator: 'IS NULL' } as Param,
    ]);
    const bound: unknown[] = [];
    const request = {
      input(_name: string, _type: unknown, value: unknown) {
        bound.push(value);
        return request;
      },
    };

    where.apply(request as unknown as Request);

    expect(where.whereFragment).toBe('CodUsuario IS NULL');
    expect(bound).toEqual([]);
  });

  it('should treat operator IS and null value as IS NULL', () => {
    const where = ParamsCommonRepository.buildWhereParameterized([
      { key: 'CodUsuario', operator: 'IS', value: null },
    ]);

    expect(where.whereFragment).toBe('CodUsuario IS NULL');
  });
});

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
