import sql, { ConnectionPool } from 'mssql';
import type { Request } from 'mssql';

import { Param, Params, Pagination, OrderBy, DEFAULT_PAGE_LIMIT } from '../../contracts/local.base.params';
import { resolveMssqlRuntimeOptions } from '../../assets/config.msql';
import { logAppWarn } from '../../infra/app.logger';
import ParamsCommonRepository from './params.common';
import { rewriteSepararConsultaLegacySql } from './separar.consulta.where';
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

/**
 * Sempre devolve um Pagination real: LIMIT 0/NaN/ausente não chega no
 * `FETCH NEXT` (SQL 153: "Invalid usage of the option NEXT").
 */
export function resolveSelectPagination(pagination: Pagination | undefined): Pagination {
  if (!pagination) return Pagination.create(DEFAULT_PAGE_LIMIT);
  return Pagination.create(Number(pagination.limit), Number(pagination.offset), Number(pagination.page));
}

/** SQL Server recusa FETCH NEXT 0 e FETCH NEXT NULL. */
export function bindSelectPage(req: Request, page: Pagination | undefined): void {
  if (!page) return;
  const resolved = resolveSelectPagination(page);
  req.input('__pg_offset', sql.Int, resolved.offset);
  req.input('__pg_limit', sql.Int, resolved.limit);
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

export function wrapSelectLockTimeout(sqlText: string, timeoutMs = resolveMssqlRuntimeOptions().lockTimeout): string {
  if (timeoutMs <= 0) return sqlText;
  return `SET LOCK_TIMEOUT ${timeoutMs};\n${sqlText}`;
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
      const sqlFragment = expedicaoSepararConsulta
        ? rewriteSepararConsultaLegacySql(whereParams.sql)
        : whereParams.sql;
      baseSql = `${selectSql} WHERE ${sqlFragment}`;
      applyToRequest = () => {};
    } else if (ParamsCommonRepository.needsLegacyWhere(whereParams)) {
      const legacy = ParamsCommonRepository.build(whereParams);
      const sqlFragment = expedicaoSepararConsulta && legacy ? rewriteSepararConsultaLegacySql(legacy) : legacy;
      baseSql = sqlFragment ? `${selectSql} WHERE ${sqlFragment}` : selectSql;
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
    bindSelectPage(req, assembled.page);

    return await req.query(wrapSelectLockTimeout(assembled.sqlText));
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
  bindSelectPage(req, assembled.page);
  return await req.query(wrapSelectLockTimeout(assembled.sqlText));
}

export async function executeSelectPaged(
  pool: ConnectionPool,
  selectSql: string,
  pagination: Pagination,
): Promise<{ recordset: any[] }> {
  try {
    const req = pool.request();
    bindSelectPage(req, pagination);
    return await req.query(
      wrapSelectLockTimeout(
        `${selectSql} ORDER BY (SELECT NULL) OFFSET @__pg_offset ROWS FETCH NEXT @__pg_limit ROWS ONLY`,
      ),
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
    bindSelectPage(req, pagination);
    return await req.query(
      wrapSelectLockTimeout(
        `${selectSql} ${orderByClause} OFFSET @__pg_offset ROWS FETCH NEXT @__pg_limit ROWS ONLY`,
      ),
    );
  } catch (e) {
    throw wrapRepositoryError(e);
  }
}
