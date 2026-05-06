import path from 'path';

import { readSqlFileCached } from '../../infra/sql.file.cache';
import { ConnectionPool } from 'mssql';
import { Params, Pagination, OrderBy } from '../../contracts/local.base.params';

import ConnectionSqlServerMssql from '../../infra/connection.sql.server.mssql';
import LocalBaseConsultaRepositoryContract from '../../contracts/local.base.consulta.repository.contract';
import ExpedicaoVersaoAppConsultaDto from '../../dto/expedicao/expedicao.versaoapp.consulta.dto';
import ParamsCommonRepository from '../common/params.common';
import { executeSelectPaged, executeSelectWhere } from '../common/consulta.sql.helper';
import { wrapRepositoryError } from '../../utils/repository.error';

export default class LocalSqlServerExpedicaoVersaoAppConsultaRepository
  implements LocalBaseConsultaRepositoryContract<ExpedicaoVersaoAppConsultaDto>
{
  private connect = ConnectionSqlServerMssql.getInstance();
  private basePatchSQL = ParamsCommonRepository.basePatchSQL('expedicao');

  public async select(pagination: Pagination): Promise<ExpedicaoVersaoAppConsultaDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.versaoapp.consulta.sql');
      const sql = readSqlFileCached(patchSQL);
      const result = await executeSelectPaged(pool, sql, pagination);

      if (result.recordset.length === 0) return [];
      return result.recordset.map((item: any) => ExpedicaoVersaoAppConsultaDto.fromObject(item));
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async selectWhere(
    params: Params[] = [],
    pagination?: Pagination,
    orderBy?: OrderBy,
  ): Promise<ExpedicaoVersaoAppConsultaDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.versaoapp.consulta.sql');
      const select = readSqlFileCached(patchSQL);

      const result = await executeSelectWhere(pool, select, params, pagination, orderBy);

      if (result.recordset.length === 0) return [];
      return result.recordset.map((item: any) => ExpedicaoVersaoAppConsultaDto.fromObject(item));
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }
}
