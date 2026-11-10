import { describe, expect, it } from 'vitest';

import {
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
  pageForSeparacaoItens,
  pageLimitForGroups,
  Pagination,
} from '../../../src/contracts/local.base.pagination';

describe('Pagination', () => {
  it('should default to a small page when LIMIT is omitted', () => {
    expect(Pagination.fromQueryString().getLimit()).toBe(DEFAULT_PAGE_LIMIT);
    expect(Pagination.create().getLimit()).toBe(DEFAULT_PAGE_LIMIT);
  });

  it('should cap an oversized LIMIT', () => {
    expect(Pagination.fromQueryString('LIMIT=5000').getLimit()).toBe(MAX_PAGE_LIMIT);
    expect(Pagination.create(1000).getLimit()).toBe(1000);
    expect(Pagination.create(1001).getLimit()).toBe(MAX_PAGE_LIMIT);
  });

  it('should reject a zero or invalid LIMIT', () => {
    expect(Pagination.fromQueryString('LIMIT=0').getLimit()).toBe(1);
    expect(Pagination.fromQueryString('LIMIT=abc').getLimit()).toBe(DEFAULT_PAGE_LIMIT);
  });

  it('should raise the separation item page from the default to the ceiling', () => {
    expect(pageForSeparacaoItens().getLimit()).toBe(MAX_PAGE_LIMIT);
    expect(pageForSeparacaoItens(Pagination.create()).getLimit()).toBe(MAX_PAGE_LIMIT);

    const paged = pageForSeparacaoItens(Pagination.create(DEFAULT_PAGE_LIMIT, 100, 2));
    expect(paged.getLimit()).toBe(MAX_PAGE_LIMIT);
    expect(paged.getOffset()).toBe(100);
    expect(paged.getPage()).toBe(2);

    expect(pageForSeparacaoItens(Pagination.create(50)).getLimit()).toBe(50);
    expect(pageForSeparacaoItens(Pagination.create(MAX_PAGE_LIMIT)).getLimit()).toBe(MAX_PAGE_LIMIT);
  });

  it('should size a refresh page from the number of groups', () => {
    expect(pageLimitForGroups(3)).toBe(15);
    expect(pageLimitForGroups(200)).toBe(MAX_PAGE_LIMIT);
  });
});
