import path from 'path';
import { readSqlFileCached } from '../../infra/sql.file.cache';

import { ConnectionPool } from 'mssql';
import { Params, Pagination, OrderBy } from '../../contracts/local.base.params';

import ConnectionSqlServerMssql from '../../infra/connection.sql.server.mssql';
import LocalBaseConsultaRepositoryContract from '../../contracts/local.base.consulta.repository.contract';
import ExpedicaoConferirConsultaDto from '../../dto/expedicao/expedicao.conferir.consulta.dto';
import ParamsCommonRepository from '../common/params.common';
import { executeSelectPaged, executeSelectWhere, executeSelectWhereAny } from '../common/consulta.sql.helper';
import { wrapRepositoryError } from '../../utils/repository.error';

export default class SqlServerExpedicaoConferirConsultaRepository
  implements LocalBaseConsultaRepositoryContract<ExpedicaoConferirConsultaDto>
{
  private connect = ConnectionSqlServerMssql.getInstance();
  private basePatchSQL = ParamsCommonRepository.basePatchSQL('expedicao');

  public async select(page: Pagination): Promise<ExpedicaoConferirConsultaDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.conferir.consulta.sql');
      const sqlText = readSqlFileCached(patchSQL);
      const result = await executeSelectPaged(pool, sqlText, page ?? Pagination.create());

      if (result.recordset.length === 0) return [];
      const entity = result.recordset.map((item: any) => {
        return ExpedicaoConferirConsultaDto.fromObject(item);
      });

      return entity;
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    } finally {
    }
  }

  public async selectWhere(
    params: Params[] = [],
    pagination?: Pagination,
    orderBy?: OrderBy,
  ): Promise<ExpedicaoConferirConsultaDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.conferir.consulta.sql');
      const select = readSqlFileCached(patchSQL);

      const result = await executeSelectWhere(pool, select, params, pagination, orderBy);

      if (result.recordset.length === 0) return [];
      const entitys = result.recordset.map((item: any) => {
        return ExpedicaoConferirConsultaDto.fromObject(item);
      });

      return entitys;
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    } finally {
    }
  }

  public async selectWhereAny(
    groups: Params[][],
    pagination?: Pagination,
    orderBy?: OrderBy,
  ): Promise<ExpedicaoConferirConsultaDto[]> {
    if (groups.length === 0) return [];
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.conferir.consulta.sql');
      const select = readSqlFileCached(patchSQL);
      const result = await executeSelectWhereAny(pool, select, groups, pagination, orderBy);
      return result.recordset.map((item: Record<string, unknown>) => ExpedicaoConferirConsultaDto.fromObject(item));
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }
}
