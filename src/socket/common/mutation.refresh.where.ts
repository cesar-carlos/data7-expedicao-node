import { pageLimitForGroups, Params, Pagination, type Param } from '../../contracts/local.base.params';
import { SQL_IN_CHUNK, chunkInValues } from '../../repository/common/sql.param.budget';

export type RefreshWhere =
  | { mode: 'single'; params: Param[] }
  | { mode: 'any'; groups: Param[][] };

export function sharedFields<T extends object, K extends keyof T>(
  items: readonly T[],
  keys: readonly K[],
): Pick<T, K> | undefined {
  if (items.length === 0 || keys.length === 0) return undefined;
  const first = items[0];
  for (const item of items) {
    for (const key of keys) {
      if (item[key] !== first[key]) return undefined;
    }
  }
  const shared = {} as Pick<T, K>;
  for (const key of keys) {
    shared[key] = first[key];
  }
  return shared;
}

export function homogeneousEquals<T extends object, K extends keyof T & string>(
  items: readonly T[],
  keys: readonly K[],
): Param[] | undefined {
  const shared = sharedFields(items, keys);
  if (!shared) return undefined;
  return keys.map((key) => Params.equals(key, shared[key]));
}

export function uniqueEqualsGroups<T extends object, K extends keyof T & string>(
  items: readonly T[],
  keys: readonly K[],
): Param[][] {
  const seen = new Map<string, Param[]>();
  for (const item of items) {
    const id = keys.map((key) => String(item[key])).join(':');
    if (seen.has(id)) continue;
    seen.set(
      id,
      keys.map((key) => Params.equals(key, item[key])),
    );
  }
  return [...seen.values()];
}

/**
 * Same cart/document → one parameterized WHERE.
 * Mixed keys → one OR-group per item (chunked later by the SQL helper).
 */
export function refreshWhere<T extends object, K extends keyof T & string>(
  items: readonly T[],
  homogeneousKeys: readonly K[],
  groupKeys: readonly K[],
): RefreshWhere {
  if (items.length === 0) return { mode: 'any', groups: [] };
  const single = homogeneousEquals(items, homogeneousKeys);
  if (single) return { mode: 'single', params: single };
  return { mode: 'any', groups: uniqueEqualsGroups(items, groupKeys) };
}

export async function mapConsultaInChunks<T>(
  consulta: (params: Param[], pagination?: Pagination) => Promise<T[]>,
  base: Param[],
  inKey: string,
  values: readonly unknown[],
  rowsPerValue: number,
  chunkSize = SQL_IN_CHUNK,
): Promise<T[]> {
  if (values.length === 0) return [];
  const chunks = chunkInValues(values, chunkSize);
  const rows: T[] = [];
  for (const chunk of chunks) {
    rows.push(
      ...(await consulta(
        [...base, Params.in(inKey, chunk)],
        Pagination.create(pageLimitForGroups(chunk.length, rowsPerValue)),
      )),
    );
  }
  return rows;
}
