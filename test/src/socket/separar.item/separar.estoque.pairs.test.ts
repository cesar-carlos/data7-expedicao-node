import { describe, expect, it } from 'vitest';

import { uniqueSepararEstoquePairs } from '../../../../src/socket/separar.item/separar.estoque.pairs';

describe('uniqueSepararEstoquePairs', () => {
  it('should keep one pair per separation', () => {
    const pairs = uniqueSepararEstoquePairs([
      { CodEmpresa: 1, CodSepararEstoque: 10 },
      { CodEmpresa: 1, CodSepararEstoque: 10 },
      { CodEmpresa: 1, CodSepararEstoque: 20 },
    ]);

    expect(pairs).toEqual([
      { codEmpresa: 1, codSepararEstoque: 10 },
      { codEmpresa: 1, codSepararEstoque: 20 },
    ]);
  });
});
