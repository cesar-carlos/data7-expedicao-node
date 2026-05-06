import sql, { ConnectionPool } from 'mssql';
import type { Request } from 'mssql';

import { Param, Params, Pagination, OrderBy } from '../../contracts/local.base.params';
import ParamsCommonRepository from './params.common';
import { wrapRepositoryError } from '../../utils/repository.error';

export async function executeSelectWhere(
  pool: ConnectionPool,
  selectSql: string,
  params: Params[],
  pagination: Pagination | undefined,
  orderBy: OrderBy | undefined,
  expedicaoSepararConsulta?: boolean,
): Promise<{ recordset: any[] }> {
  try {
    const orderClause =
      orderBy?.isValid() && orderBy.getFullOrderBy()
        ? `ORDER BY ${orderBy.getFullOrderBy()}`
        : 'ORDER BY (SELECT NULL)';

    let baseSql: string;
    let applyToRequest: (req: Request) => void;

    if (!ParamsCommonRepository.isParamObjectArray(params)) {
      const legacy = ParamsCommonRepository.build(params);
      baseSql = legacy ? `${selectSql} WHERE ${legacy}` : selectSql;
      applyToRequest = () => {};
    } else if (ParamsCommonRepository.needsLegacyWhere(params as Param[])) {
      const legacy = ParamsCommonRepository.build(params);
      baseSql = legacy ? `${selectSql} WHERE ${legacy}` : selectSql;
      applyToRequest = () => {};
    } else {
      const pw = ParamsCommonRepository.buildWhereParameterized(
        params as Param[],
        expedicaoSepararConsulta ? 'expedicao-separar-consulta' : undefined,
      );
      baseSql = pw.whereFragment ? `${selectSql} WHERE ${pw.whereFragment}` : selectSql;
      applyToRequest = pw.apply;
    }

    let sqlText = `${baseSql} ${orderClause}`;
    const req = pool.request();
    applyToRequest(req);

    if (pagination) {
      req.input('__pg_offset', sql.Int, Number(pagination.offset));
      req.input('__pg_limit', sql.Int, Number(pagination.limit));
      sqlText += ` OFFSET @__pg_offset ROWS FETCH NEXT @__pg_limit ROWS ONLY`;
    }

    return await req.query(sqlText);
  } catch (e) {
    throw wrapRepositoryError(e);
  }
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
