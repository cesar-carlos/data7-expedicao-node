import {
  ComparisonOperator,
  isNullComparisonOperator,
  normalizeComparisonOperator,
  type Param,
} from '../../contracts/local.base.params';
import { Pagination } from '../../contracts/local.base.pagination';

/** SQL Server TDS limit: one request cannot bind more than this. */
export const SQL_MAX_PARAMS = 2100;

/**
 * Bind budget for a WHERE clause. Leaves room for pagination (`__pg_offset`,
 * `__pg_limit`) and extra inputs such as `@qty_cancelado`.
 */
export const SQL_PARAM_BUDGET = 2000;

/** Conservative `IN` / `NOT IN` list size. 400 is already used in liberacao. */
export const SQL_IN_CHUNK = 500;

export function countParamBinds(param: Param): number {
  const op = normalizeComparisonOperator(param.operator);
  if (isNullComparisonOperator(op)) {
    return 0;
  }
  if (op === ComparisonOperator.CUSTOM) {
    return 0;
  }
  if (op === ComparisonOperator.IN || op === ComparisonOperator.NOT_IN) {
    return Array.isArray(param.value) ? param.value.length : 0;
  }
  if (op === ComparisonOperator.BETWEEN) {
    return 2;
  }
  return 1;
}

export function countParamsBinds(params: readonly Param[]): number {
  return params.reduce((total, param) => total + countParamBinds(param), 0);
}

export function countGroupsBinds(groups: readonly Param[][]): number {
  return groups.reduce((total, group) => total + countParamsBinds(group), 0);
}

export function chunkInValues<T>(values: readonly T[], chunkSize = SQL_IN_CHUNK): T[][] {
  if (values.length === 0) return [];
  const size = Math.max(1, Math.floor(chunkSize));
  const chunks: T[][] = [];
  for (let offset = 0; offset < values.length; offset += size) {
    chunks.push(values.slice(offset, offset + size));
  }
  return chunks;
}

/**
 * Splits an oversized `IN` list into several equivalent AND-clauses.
 * `NOT IN` stays in one list: splitting it would require intersecting full scans.
 */
export function expandParamsForInBudget(params: Param[], chunkSize = SQL_IN_CHUNK): Param[][] {
  const oversized = params.findIndex((param) => {
    const op = param.operator || ComparisonOperator.EQUALS;
    return op === ComparisonOperator.IN && Array.isArray(param.value) && param.value.length > chunkSize;
  });
  if (oversized < 0) return [params];

  const target = params[oversized];
  const values = Array.isArray(target.value) ? target.value : [];
  return chunkInValues(values, chunkSize).map((chunk) =>
    params.map((param, index) => (index === oversized ? { ...param, value: chunk } : param)),
  );
}

export function expandGroupsForInBudget(groups: Param[][], chunkSize = SQL_IN_CHUNK): Param[][] {
  return groups.flatMap((group) => expandParamsForInBudget(group, chunkSize));
}

export function chunkGroupsByBindBudget(
  groups: readonly Param[][],
  budget = SQL_PARAM_BUDGET,
): Param[][][] {
  if (groups.length === 0) return [];

  const limit = Math.max(1, Math.floor(budget));
  const chunks: Param[][][] = [];
  let current: Param[][] = [];
  let binds = 0;

  for (const group of groups) {
    const groupBinds = Math.max(0, countParamsBinds(group));
    const overflows = current.length > 0 && binds + groupBinds > limit;
    if (overflows) {
      chunks.push(current);
      current = [];
      binds = 0;
    }
    current.push(group);
    binds += groupBinds;
  }

  if (current.length > 0) chunks.push(current);
  return chunks;
}

/** Apply OFFSET/LIMIT in memory after concatenating chunked queries. */
export function sliceRecordsetPage<T>(
  rows: readonly T[],
  pagination: Pagination | undefined,
  unbounded = false,
): T[] {
  if (unbounded && !pagination) return [...rows];
  const page = pagination ?? Pagination.create();
  const offset = Math.max(0, page.offset);
  return rows.slice(offset, offset + page.limit);
}
