import path from 'path';
import { readSqlFileCached } from '../../infra/sql.file.cache';

import { ConnectionPool } from 'mssql';
import { Params, Pagination, OrderBy } from '../../contracts/local.base.params';

import ConnectionSqlServerMssql from '../../infra/connection.sql.server.mssql';
import LocalBaseConsultaRepositoryContract from '../../contracts/local.base.consulta.repository.contract';
import ExpedicaoProgressoSeparacaoConsultaDto from '../../dto/expedicao/expedicao.progresso.separacao.consulta.dto';
import ParamsCommonRepository from '../common/params.common';
import { executeSelectPagedWithOrder, executeSelectWhere } from '../common/consulta.sql.helper';
import { wrapRepositoryError } from '../../utils/repository.error';

export default class SqlServerExpedicaoProgressoSeparacaoConsultaRepository
  implements LocalBaseConsultaRepositoryContract<ExpedicaoProgressoSeparacaoConsultaDto>
{
  private connect = ConnectionSqlServerMssql.getInstance();
  private basePatchSQL = ParamsCommonRepository.basePatchSQL('expedicao');

  public async select(pagination?: Pagination): Promise<ExpedicaoProgressoSeparacaoConsultaDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.progresso.separacao.consulta.sql');
      const select = readSqlFileCached(patchSQL);

      let result;
      if (pagination) {
        result = await executeSelectPagedWithOrder(
          pool,
          select,
          'ORDER BY CodEmpresa, CodSepararEstoque',
          pagination,
        );
      } else {
        result = await pool.request().query(select);
      }

      if (result.recordset.length === 0) return [];
      const entity = result.recordset.map((item: any) => {
        return ExpedicaoProgressoSeparacaoConsultaDto.fromObject(item);
      });

      return entity;
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async selectWhere(
    params: Params[] = [],
    pagination?: Pagination,
    orderBy?: OrderBy,
  ): Promise<ExpedicaoProgressoSeparacaoConsultaDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.progresso.separacao.consulta.sql');
      const select = readSqlFileCached(patchSQL);

      const result = await executeSelectWhere(pool, select, params, pagination, orderBy);

      if (result.recordset.length === 0) return [];
      const entitys = result.recordset.map((item: any) => {
        return ExpedicaoProgressoSeparacaoConsultaDto.fromObject(item);
      });

      return entitys;
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }
}
