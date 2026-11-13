import path from 'path';

import { readSqlFileCached } from '../../infra/sql.file.cache';
import { ConnectionPool } from 'mssql';
import { Params, Pagination, OrderBy } from '../../contracts/local.base.params';

import ConnectionSqlServerMssql from '../../infra/connection.sql.server.mssql';
import LocalBaseConsultaRepositoryContract from '../../contracts/local.base.consulta.repository.contract';
import ExpedicaoSepararConsultaDto from '../../dto/expedicao/expedicao.separar.consulta.dto';
import ParamsCommonRepository from '../common/params.common';
import { executeSelectPaged, executeSelectWhere, executeSelectWhereAny } from '../common/consulta.sql.helper';
import { rewriteSepararConsultaLegacySql } from '../common/separar.consulta.where';
import { wrapRepositoryError } from '../../utils/repository.error';

export default class SqlServerExpedicaoSepararConsultaRepository
  implements LocalBaseConsultaRepositoryContract<ExpedicaoSepararConsultaDto>
{
  private connect = ConnectionSqlServerMssql.getInstance();
  private basePatchSQL = ParamsCommonRepository.basePatchSQL('expedicao');

  private getSelectSql(): string {
    const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.separar.consulta.sql');
    return readSqlFileCached(patchSQL);
  }

  public async select(pagination: Pagination): Promise<ExpedicaoSepararConsultaDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const result = await executeSelectPaged(pool, this.getSelectSql(), pagination);

      if (result.recordset.length === 0) return [];
      return result.recordset.map((item: any) => ExpedicaoSepararConsultaDto.fromObject(item));
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async selectWhere(
    params: Params[] | string = [],
    pagination?: Pagination,
    orderBy?: OrderBy,
  ): Promise<ExpedicaoSepararConsultaDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const select = this.getSelectSql();

      const result = await executeSelectWhere(
        pool,
        select,
        typeof params === 'string' ? this.buildParamsFromString(params) : params,
        pagination,
        orderBy,
        true,
      );

      if (result.recordset.length === 0) return [];
      return result.recordset.map((item: any) => ExpedicaoSepararConsultaDto.fromObject(item));
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async selectWhereAny(
    groups: Params[][],
    pagination?: Pagination,
    orderBy?: OrderBy,
  ): Promise<ExpedicaoSepararConsultaDto[]> {
    if (groups.length === 0) return [];
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const result = await executeSelectWhereAny(pool, this.getSelectSql(), groups, pagination, orderBy);
      return result.recordset.map((item: Record<string, unknown>) => ExpedicaoSepararConsultaDto.fromObject(item));
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  private buildParamsFromString(paramsString: string): string {
    if (!paramsString || paramsString.trim() === '') return '';
    return rewriteSepararConsultaLegacySql(paramsString);
  }
}
