import { describe, expect, it } from 'vitest';

import {
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
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
    expect(Pagination.create(1000).getLimit()).toBe(MAX_PAGE_LIMIT);
  });

  it('should reject a zero or invalid LIMIT', () => {
    expect(Pagination.fromQueryString('LIMIT=0').getLimit()).toBe(1);
    expect(Pagination.fromQueryString('LIMIT=abc').getLimit()).toBe(DEFAULT_PAGE_LIMIT);
  });

  it('should size a refresh page from the number of groups', () => {
    expect(pageLimitForGroups(3)).toBe(15);
    expect(pageLimitForGroups(200)).toBe(MAX_PAGE_LIMIT);
  });
});
