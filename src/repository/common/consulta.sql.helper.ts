import sql, { ConnectionPool } from 'mssql';
import type { Request } from 'mssql';

import { Param, Params, Pagination, OrderBy, DEFAULT_PAGE_LIMIT } from '../../contracts/local.base.params';
import { logAppWarn } from '../../infra/app.logger';
import ParamsCommonRepository from './params.common';
import { SocketClientError, wrapRepositoryError } from '../../utils/repository.error';
import {
  chunkGroupsByBindBudget,
  expandGroupsForInBudget,
  expandParamsForInBudget,
  sliceRecordsetPage,
} from './sql.param.budget';

export type LegacySqlWhere = {
  readonly kind: 'legacySql';
  readonly sql: string;
};

export type NormalizedConsultaWhere = Param[] | LegacySqlWhere;

export function isLegacySqlWhere(value: NormalizedConsultaWhere): value is LegacySqlWhere {
  return !Array.isArray(value) && value.kind === 'legacySql';
}

export function normalizeConsultaWhere(params: unknown): NormalizedConsultaWhere {
  if (params === undefined || params === null) return [];
  if (typeof params === 'string') {
    if (!params.trim()) return [];
    return { kind: 'legacySql', sql: params };
  }
  if (!Array.isArray(params)) {
    throw new SocketClientError('Where deve ser uma lista de parametros.');
  }
  if (params.length === 0) return [];
  if (typeof params[0] === 'string') {
    return { kind: 'legacySql', sql: (params as string[]).join(' AND ') };
  }
  if (Array.isArray(params[0])) {
    const sql = ParamsCommonRepository.build(params as string[][]);
    return sql ? { kind: 'legacySql', sql } : [];
  }
  if (!ParamsCommonRepository.isParamObjectArray(params as Params[])) {
    throw new SocketClientError('Where deve ser uma lista de parametros.');
  }
  return params as Param[];
}

function warnLegacySqlWhere(sqlText: string): void {
  logAppWarn('Consulta Where em SQL cru (legado QueryBuilder)', {
    sql: sqlText.slice(0, 180),
  });
}

/** Consulta sem página explícita fica no teto padrão. Sem isso o SELECT devolve a view inteira. */
export function resolveSelectPagination(pagination: Pagination | undefined): Pagination {
  return pagination ?? Pagination.create(DEFAULT_PAGE_LIMIT);
}

/**
 * ORDER BY explícito quando o cliente pediu.
 * ORDER BY (SELECT NULL) existe para o OFFSET/FETCH, que o SQL Server recusa sem ordenação.
 */
export function applySelectOrdering(baseSql: string, orderBy: OrderBy | undefined, paginate: boolean): string {
  const explicitOrder =
    orderBy?.isValid() && orderBy.getFullOrderBy() ? `ORDER BY ${orderBy.getFullOrderBy()}` : '';

  if (explicitOrder) return `${baseSql} ${explicitOrder}`;
  if (paginate) return `${baseSql} ORDER BY (SELECT NULL)`;
  return baseSql;
}

/**
 * Skip OFFSET/FETCH only for the item unit-of-measure read when the client
 * omitted Pagination. A page cut drops conversions the collector still needs.
 */
export const KEEP_EVERY_UNIT_ROW = true;
export function applySelectPage(
  baseSql: string,
  orderBy: OrderBy | undefined,
  pagination: Pagination | undefined,
  unbounded = false,
): { sqlText: string; page?: Pagination } {
  if (unbounded && !pagination) {
    return { sqlText: applySelectOrdering(baseSql, orderBy, false) };
  }

  const page = resolveSelectPagination(pagination);
  const ordered = applySelectOrdering(baseSql, orderBy, true);
  return {
    page,
    sqlText: `${ordered} OFFSET @__pg_offset ROWS FETCH NEXT @__pg_limit ROWS ONLY`,
  };
}

export async function executeSelectWhere(
  pool: ConnectionPool,
  selectSql: string,
  params: unknown,
  pagination: Pagination | undefined,
  orderBy: OrderBy | undefined,
  expedicaoSepararConsulta?: boolean,
  applyExtra?: (request: Request) => void,
  unbounded = false,
): Promise<{ recordset: any[] }> {
  try {
    const whereParams = normalizeConsultaWhere(params);
    let baseSql: string;
    let applyToRequest: (req: Request) => void;

    if (isLegacySqlWhere(whereParams)) {
      warnLegacySqlWhere(whereParams.sql);
      baseSql = `${selectSql} WHERE ${whereParams.sql}`;
      applyToRequest = () => {};
    } else if (ParamsCommonRepository.needsLegacyWhere(whereParams)) {
      const legacy = ParamsCommonRepository.build(whereParams);
      baseSql = legacy ? `${selectSql} WHERE ${legacy}` : selectSql;
      applyToRequest = () => {};
    } else {
      const expanded = expandParamsForInBudget(whereParams);
      if (expanded.length > 1 && !expedicaoSepararConsulta && !applyExtra) {
        return executeSelectWhereAny(pool, selectSql, expanded, pagination, orderBy, unbounded);
      }
      const pw = ParamsCommonRepository.buildWhereParameterized(
        whereParams,
        expedicaoSepararConsulta ? 'expedicao-separar-consulta' : undefined,
      );
      baseSql = pw.whereFragment ? `${selectSql} WHERE ${pw.whereFragment}` : selectSql;
      applyToRequest = pw.apply;
    }

    const assembled = applySelectPage(baseSql, orderBy, pagination, unbounded);
    const req = pool.request();
    applyToRequest(req);
    applyExtra?.(req);
    if (assembled.page) {
      req.input('__pg_offset', sql.Int, assembled.page.offset);
      req.input('__pg_limit', sql.Int, assembled.page.limit);
    }

    return await req.query(assembled.sqlText);
  } catch (e) {
    throw wrapRepositoryError(e);
  }
}

/** Vários grupos no mesmo SELECT: (a AND b) OR (c AND d), com limite. */
export async function executeSelectWhereAny(
  pool: ConnectionPool,
  selectSql: string,
  groups: Params[][],
  pagination: Pagination | undefined,
  orderBy: OrderBy | undefined,
  unbounded = false,
): Promise<{ recordset: any[] }> {
  try {
    const expanded = expandGroupsForInBudget(groups as Param[][]);
    const chunks = chunkGroupsByBindBudget(expanded);
    if (chunks.length <= 1) {
      return await querySelectWhereAny(pool, selectSql, expanded, pagination, orderBy, unbounded);
    }

    const records: unknown[] = [];
    for (const chunk of chunks) {
      const part = await querySelectWhereAny(pool, selectSql, chunk, undefined, orderBy, true);
      records.push(...part.recordset);
    }
    return { recordset: sliceRecordsetPage(records, pagination, unbounded) };
  } catch (e) {
    throw wrapRepositoryError(e);
  }
}

async function querySelectWhereAny(
  pool: ConnectionPool,
  selectSql: string,
  groups: Param[][],
  pagination: Pagination | undefined,
  orderBy: OrderBy | undefined,
  unbounded: boolean,
): Promise<{ recordset: any[] }> {
  const where = ParamsCommonRepository.buildWhereAnyOf(groups);
  const baseSql = where.whereFragment ? `${selectSql} WHERE ${where.whereFragment}` : selectSql;
  const assembled = applySelectPage(baseSql, orderBy, pagination, unbounded);
  const req = pool.request();
  where.apply(req);
  if (assembled.page) {
    req.input('__pg_offset', sql.Int, assembled.page.offset);
    req.input('__pg_limit', sql.Int, assembled.page.limit);
  }
  return await req.query(assembled.sqlText);
}

export async function executeSelectPaged(
  pool: ConnectionPool,
  selectSql: string,
  pagination: Pagination,
): Promise<{ recordset: any[] }> {
  try {
    const req = pool.request();
    req.input('__pg_offset', sql.Int, Number(pagination.offset));
    req.input('__pg_limit', sql.Int, Number(pagination.limit));
    return await req.query(
      `${selectSql} ORDER BY (SELECT NULL) OFFSET @__pg_offset ROWS FETCH NEXT @__pg_limit ROWS ONLY`,
    );
  } catch (e) {
    throw wrapRepositoryError(e);
  }
}

/** Paginação com ORDER BY fixo (trecho já validado no código, não vindo do cliente). */
export async function executeSelectPagedWithOrder(
  pool: ConnectionPool,
  selectSql: string,
  orderByClause: string,
  pagination: Pagination,
): Promise<{ recordset: any[] }> {
  try {
    const req = pool.request();
    req.input('__pg_offset', sql.Int, Number(pagination.offset));
    req.input('__pg_limit', sql.Int, Number(pagination.limit));
    return await req.query(
      `${selectSql} ${orderByClause} OFFSET @__pg_offset ROWS FETCH NEXT @__pg_limit ROWS ONLY`,
    );
  } catch (e) {
    throw wrapRepositoryError(e);
  }
}
