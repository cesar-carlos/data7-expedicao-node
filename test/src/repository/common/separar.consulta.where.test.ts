import { describe, expect, it } from 'vitest';
import type { Request } from 'mssql';

import { ComparisonOperator, Params } from '../../../../src/contracts/local.base.params';
import ParamsCommonRepository from '../../../../src/repository/common/params.common';
import {
  expandSepararConsultaParam,
  rewriteSepararConsultaLegacySql,
} from '../../../../src/repository/common/separar.consulta.where';

describe('expandSepararConsultaParam', () => {
  it('should turn CodSetoresEstoque LIKE %id% into CodSetorEstoque equality', () => {
    expect(expandSepararConsultaParam(Params.like('CodSetoresEstoque', '%3%'))).toEqual([
      { key: 'CodSetorEstoque', value: 3, operator: ComparisonOperator.EQUALS },
    ]);
  });

  it('should turn DataEmissao LIKE a day prefix into equality', () => {
    expect(expandSepararConsultaParam(Params.like('DataEmissao', '2026-11-13%'))).toEqual([
      { key: 'DataEmissao', value: '2026-11-13', operator: ComparisonOperator.EQUALS },
    ]);
  });

  it('should turn DataEmissao LIKE a month prefix into a half-open range', () => {
    expect(expandSepararConsultaParam(Params.like('DataEmissao', '2026-11%'))).toEqual([
      { key: 'DataEmissao', value: '2026-11-01', operator: ComparisonOperator.GREATER_THAN_OR_EQUAL },
      { key: 'DataEmissao', value: '2026-12-01', operator: ComparisonOperator.LESS_THAN },
    ]);
  });

  it('should keep an unparsed setor LIKE for CAST EXISTS', () => {
    expect(expandSepararConsultaParam(Params.like('CodSetoresEstoque', '%1_3%'))).toEqual([
      { key: 'CodSetorEstoque', value: '%1_3%', operator: ComparisonOperator.LIKE },
    ]);
  });
});

describe('rewriteSepararConsultaLegacySql', () => {
  it('should rewrite setor LIKE and equality without nesting EXISTS', () => {
    const sql = rewriteSepararConsultaLegacySql(
      "CodEmpresa = 1 AND CodSetoresEstoque LIKE '%3%' AND CodSetorEstoque = 5",
    );

    expect(sql).toContain('ise.CodSetorEstoque = 3');
    expect(sql).toContain('ise.CodSetorEstoque = 5');
    expect(sql).not.toMatch(/EXISTS\s*\(\s*EXISTS/i);
    expect(sql).not.toContain('CodSetoresEstoque LIKE');
  });

  it('should rewrite DataEmissao LIKE to a date equality', () => {
    expect(rewriteSepararConsultaLegacySql("DataEmissao LIKE '2026-11-13%'")).toBe("DataEmissao = '2026-11-13'");
  });
});

describe('buildWhereParameterized separar consulta LIKE', () => {
  it('should emit EXISTS for CodSetoresEstoque LIKE %id%', () => {
    const where = ParamsCommonRepository.buildWhereParameterized(
      [Params.equals('CodEmpresa', 1), Params.like('CodSetoresEstoque', '%3%')],
      'expedicao-separar-consulta',
    );
    const bound: unknown[] = [];
    const request = {
      input(_name: string, _type: unknown, value: unknown) {
        bound.push(value);
        return request;
      },
    };

    where.apply(request as unknown as Request);

    expect(where.whereFragment).toContain('EXISTS');
    expect(where.whereFragment).toContain('ise.CodSetorEstoque = @');
    expect(where.whereFragment).not.toContain('CodSetoresEstoque');
    expect(bound).toEqual([1, 3]);
  });

  it('should emit a date range for DataEmissao month LIKE', () => {
    const where = ParamsCommonRepository.buildWhereParameterized(
      [Params.like('DataEmissao', '2026-01%')],
      'expedicao-separar-consulta',
    );

    expect(where.whereFragment).toBe('DataEmissao >= @wp_0 AND DataEmissao < @wp_1');
  });
});
