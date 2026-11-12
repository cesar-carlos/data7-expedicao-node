/** Página quando o cliente não manda LIMIT. */
export const DEFAULT_PAGE_LIMIT = 1500;
/** Teto só do padrão e do refresh interno. Um LIMIT do cliente não usa este valor. */
export const MAX_PAGE_LIMIT = 1500;
/** Teto técnico do parâmetro SQL INT. */
export const SQL_INT_MAX = 2_147_483_647;

export function clampPageLimit(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_PAGE_LIMIT;
  return Math.min(MAX_PAGE_LIMIT, Math.max(1, Math.floor(value)));
}

/** Limite explícito do cliente: inteiro >= 1, sem o teto de página. */
export function readUserPageLimit(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_PAGE_LIMIT;
  return Math.min(SQL_INT_MAX, Math.max(1, Math.floor(value)));
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

function firstQueryValue(params: URLSearchParams | undefined, keys: string[]): string | null {
  if (!params) return null;
  for (const key of keys) {
    const value = params.get(key);
    if (value !== null && value !== '') return value;
  }
  return null;
}

function firstObjectNumber(record: Record<string, unknown>, keys: string[]): number | undefined {
  for (const key of keys) {
    if (!(key in record) || record[key] === undefined || record[key] === null || record[key] === '') {
      continue;
    }
    const parsed = Number(record[key]);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

export class Pagination {
  public limit: number;
  public offset: number;
  public page: number;

  private constructor(query?: string) {
    const params = query ? new URLSearchParams(query) : undefined;
    const limitRaw = firstQueryValue(params, ['LIMIT', 'limit', 'TOP', 'top', '$top']);
    this.limit = limitRaw === null ? DEFAULT_PAGE_LIMIT : readUserPageLimit(Number(limitRaw));
    this.offset = readPageNumber(firstQueryValue(params, ['OFFSET', 'offset', 'SKIP', 'skip', '$skip']), 0);
    this.page = readPageNumber(firstQueryValue(params, ['PAGE', 'page']), 1);
  }

  static fromObject(obj?: { limit?: number; offset?: number; page?: number }): Pagination {
    if (!obj) return new Pagination();
    return Pagination.create(obj.limit ?? DEFAULT_PAGE_LIMIT, obj.offset ?? 0, obj.page ?? 1);
  }

  static fromQueryString(queryString?: string): Pagination {
    if (!queryString) return new Pagination();
    return new Pagination(queryString);
  }

  /** Absent/empty client pagination stays undefined so the default page is applied later. */
  static fromClientInput(value: unknown): Pagination | undefined {
    if (value === undefined || value === null) return undefined;

    if (typeof value === 'number') {
      return Pagination.create(readUserPageLimit(value));
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return undefined;
      return Pagination.fromQueryString(trimmed);
    }

    if (typeof value === 'object' && !Array.isArray(value)) {
      const record = value as Record<string, unknown>;
      const limit = firstObjectNumber(record, ['LIMIT', 'limit', 'TOP', 'top', '$top']);
      const offset = firstObjectNumber(record, ['OFFSET', 'offset', 'SKIP', 'skip', '$skip']);
      const page = firstObjectNumber(record, ['PAGE', 'page']);
      if (limit === undefined && offset === undefined && page === undefined) return undefined;
      return Pagination.create(limit ?? DEFAULT_PAGE_LIMIT, offset ?? 0, page ?? 1);
    }

    return undefined;
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
