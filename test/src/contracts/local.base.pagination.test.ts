import { describe, expect, it } from 'vitest';

import {
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
  pageLimitForGroups,
  Pagination,
  SQL_INT_MAX,
} from '../../../src/contracts/local.base.pagination';

describe('Pagination', () => {
  it('should default to the standard page when LIMIT is omitted', () => {
    expect(Pagination.fromQueryString().getLimit()).toBe(DEFAULT_PAGE_LIMIT);
    expect(Pagination.create().getLimit()).toBe(DEFAULT_PAGE_LIMIT);
    expect(Pagination.fromClientInput(undefined)).toBeUndefined();
    expect(Pagination.fromClientInput('')).toBeUndefined();
  });

  it('should keep an explicit LIMIT from the client', () => {
    expect(Pagination.fromQueryString('LIMIT=50').getLimit()).toBe(50);
    expect(Pagination.fromQueryString('LIMIT=5000').getLimit()).toBe(5000);
    expect(Pagination.create(5000, 20, 3).getLimit()).toBe(5000);
    expect(Pagination.create(5000, 20, 3).getOffset()).toBe(20);
    expect(Pagination.create(5000, 20, 3).getPage()).toBe(3);
    expect(Pagination.fromQueryString('$skip=15&$top=10').getLimit()).toBe(10);
    expect(Pagination.fromQueryString('$skip=15&$top=10').getOffset()).toBe(15);
    expect(Pagination.fromClientInput({ limit: 80, offset: 40, page: 2 })?.getLimit()).toBe(80);
    expect(Pagination.fromClientInput(120)?.getLimit()).toBe(120);
  });

  it('should only cap an explicit LIMIT at the SQL INT maximum', () => {
    expect(Pagination.fromQueryString(`LIMIT=${SQL_INT_MAX + 1}`).getLimit()).toBe(SQL_INT_MAX);
  });

  it('should reject a zero or invalid LIMIT', () => {
    expect(Pagination.fromQueryString('LIMIT=0').getLimit()).toBe(1);
    expect(Pagination.fromQueryString('LIMIT=abc').getLimit()).toBe(DEFAULT_PAGE_LIMIT);
  });

  it('should size a refresh page from the number of groups', () => {
    expect(pageLimitForGroups(3)).toBe(15);
    expect(pageLimitForGroups(400)).toBe(MAX_PAGE_LIMIT);
  });
});
