import { describe, expect, it } from 'vitest';

import { Pagination } from '../../../../src/contracts/local.base.pagination';
import {
  homogeneousEquals,
  mapConsultaInChunks,
  refreshWhere,
} from '../../../../src/socket/common/mutation.refresh.where';

const cartItem = (Item: string, extras?: { CodCarrinhoPercurso?: number }) => ({
  CodEmpresa: 1,
  CodSepararEstoque: 10,
  CodCarrinhoPercurso: extras?.CodCarrinhoPercurso ?? 5,
  ItemCarrinhoPercurso: '00001',
  Item,
});

describe('mutation.refresh.where', () => {
  it('should collapse 800 items of the same cart into one WHERE', () => {
    const items = Array.from({ length: 800 }, (_, index) => cartItem(String(index + 1).padStart(5, '0')));
    const where = refreshWhere(
      items,
      ['CodEmpresa', 'CodSepararEstoque', 'CodCarrinhoPercurso', 'ItemCarrinhoPercurso'],
      ['CodEmpresa', 'CodSepararEstoque', 'Item'],
    );

    expect(where.mode).toBe('single');
    if (where.mode !== 'single') return;
    expect(where.params).toHaveLength(4);
    expect(where.params.map((param) => param.key)).toEqual([
      'CodEmpresa',
      'CodSepararEstoque',
      'CodCarrinhoPercurso',
      'ItemCarrinhoPercurso',
    ]);
  });

  it('should keep OR groups when the mutation mixes carts', () => {
    const where = refreshWhere(
      [cartItem('00001'), cartItem('00002', { CodCarrinhoPercurso: 9 })],
      ['CodEmpresa', 'CodSepararEstoque', 'CodCarrinhoPercurso', 'ItemCarrinhoPercurso'],
      ['CodEmpresa', 'CodSepararEstoque', 'Item'],
    );

    expect(where.mode).toBe('any');
    if (where.mode !== 'any') return;
    expect(where.groups).toHaveLength(2);
  });

  it('should return a document WHERE when every product shares empresa and documento', () => {
    const produtos = [
      { CodEmpresa: 1, CodSepararEstoque: 10, CodProduto: 100 },
      { CodEmpresa: 1, CodSepararEstoque: 10, CodProduto: 200 },
    ];
    const documento = homogeneousEquals(produtos, ['CodEmpresa', 'CodSepararEstoque']);
    expect(documento).toEqual([
      { key: 'CodEmpresa', value: 1, operator: '=' },
      { key: 'CodSepararEstoque', value: 10, operator: '=' },
    ]);
  });

  it('should query IN lists in chunks and concatenate the rows', async () => {
    const calls: Array<{ values: unknown[]; limit: number }> = [];
    const rows = await mapConsultaInChunks(
      async (params, pagination) => {
        const inParam = params.find((param) => param.key === 'CodProduto');
        calls.push({
          values: Array.isArray(inParam?.value) ? inParam.value : [],
          limit: pagination?.limit ?? 0,
        });
        return (inParam?.value as number[]).map((id) => ({ id }));
      },
      [{ key: 'CodEmpresa', value: 1, operator: '=' }],
      'CodProduto',
      Array.from({ length: 600 }, (_, index) => index + 1),
      20,
      500,
    );

    expect(calls).toHaveLength(2);
    expect(calls[0].values).toHaveLength(500);
    expect(calls[1].values).toHaveLength(100);
    expect(rows).toHaveLength(600);
    expect(calls[0].limit).toBe(Pagination.create(1500).limit);
  });
});
