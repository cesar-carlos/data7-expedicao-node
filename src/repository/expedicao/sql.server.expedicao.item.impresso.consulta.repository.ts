import path from 'path';
import { readSqlFileCached } from '../../infra/sql.file.cache';

import { ConnectionPool } from 'mssql';
import { Params, Pagination, OrderBy } from '../../contracts/local.base.params';

import ConnectionSqlServerMssql from '../../infra/connection.sql.server.mssql';
import LocalBaseConsultaRepositoryContract from '../../contracts/local.base.consulta.repository.contract';
import ExpedicaoItemImpressoConsultaDto from '../../dto/expedicao/expedicao.item.impresso.consulta.dto';
import ParamsCommonRepository from '../common/params.common';
import { executeSelectWhere } from '../common/consulta.sql.helper';
import { wrapRepositoryError } from '../../utils/repository.error';

export default class SqlServerExpedicaoItemImpressoConsultaRepository
  implements LocalBaseConsultaRepositoryContract<ExpedicaoItemImpressoConsultaDto>
{
  private connect = ConnectionSqlServerMssql.getInstance();
  private basePatchSQL = ParamsCommonRepository.basePatchSQL('expedicao');

  public async select(page: Pagination): Promise<ExpedicaoItemImpressoConsultaDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.item.impresso.consulta.sql');
      const sql = readSqlFileCached(patchSQL);
      const result = await pool.request().query(sql);

      if (result.recordset.length === 0) return [];
      const entity = result.recordset.map((item: any) => {
        return ExpedicaoItemImpressoConsultaDto.fromObject(item);
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
  ): Promise<ExpedicaoItemImpressoConsultaDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.item.impresso.consulta.sql');
      const select = readSqlFileCached(patchSQL);

      const result = await executeSelectWhere(pool, select, params, pagination, orderBy);

      if (result.recordset.length === 0) return [];
      const entitys = result.recordset.map((item: any) => {
        return ExpedicaoItemImpressoConsultaDto.fromObject(item);
      });

      return entitys;
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    } finally {
    }
  }
}
