/** Página quando o cliente não manda LIMIT. A view de expedição não aguenta 1000 linhas de uma vez. */
export const DEFAULT_PAGE_LIMIT = 100;
/** Teto mesmo se o cliente pedir mais. */
export const MAX_PAGE_LIMIT = 500;

export function clampPageLimit(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_PAGE_LIMIT;
  return Math.min(MAX_PAGE_LIMIT, Math.max(1, Math.floor(value)));
}

/** Limite de um refresh em lote: algumas linhas por chave, sem passar do teto da página. */
export function pageLimitForGroups(groupCount: number, rowsPerGroup = 5): number {
  const groups = Number.isFinite(groupCount) && groupCount > 0 ? Math.floor(groupCount) : 1;
  const perGroup = Number.isFinite(rowsPerGroup) && rowsPerGroup > 0 ? Math.floor(rowsPerGroup) : 5;
  return clampPageLimit(groups * perGroup);
}

function readPageNumber(raw: string | null, fallback: number): number {
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, Math.floor(parsed));
}

export class Pagination {
  public limit: number;
  public offset: number;
  public page: number;

  private constructor(query?: string) {
    const params = query ? new URLSearchParams(query) : undefined;
    this.limit = clampPageLimit(params?.get('LIMIT') ? Number(params.get('LIMIT')) : DEFAULT_PAGE_LIMIT);
    this.offset = readPageNumber(params?.get('OFFSET') ?? null, 0);
    this.page = readPageNumber(params?.get('PAGE') ?? null, 1);
  }

  static fromObject(obj?: { limit?: number; offset?: number; page?: number }): Pagination {
    if (!obj) return new Pagination();
    return Pagination.create(obj.limit ?? DEFAULT_PAGE_LIMIT, obj.offset ?? 0, obj.page ?? 1);
  }

  static fromQueryString(queryString?: string): Pagination {
    if (!queryString) return new Pagination();
    return new Pagination(queryString);
  }

  static create(limit: number = DEFAULT_PAGE_LIMIT, offset: number = 0, page: number = 1): Pagination {
    return new Pagination(`LIMIT=${limit}&OFFSET=${offset}&PAGE=${page}`);
  }

  getLimit(): number {
    return this.limit;
  }

  getOffset(): number {
    return this.offset;
  }

  getPage(): number {
    return this.page;
  }
}

// Re-export OrderBy for backward compatibility
export { OrderBy } from './local.base.orderby';
