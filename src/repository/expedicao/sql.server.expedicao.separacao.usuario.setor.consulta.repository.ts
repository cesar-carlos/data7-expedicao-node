import fs, { cpSync } from 'fs';
import path from 'path';
import { readSqlFileCached } from '../../infra/sql.file.cache';

import { ConnectionPool } from 'mssql';
import { Params, Pagination, OrderBy } from '../../contracts/local.base.params';

import ConnectionSqlServerMssql from '../../infra/connection.sql.server.mssql';
import LocalBaseConsultaRepositoryContract from '../../contracts/local.base.consulta.repository.contract';
import ExpedicaoSeparacaoUsuarioSetorConsultaDto from '../../dto/expedicao/expedicao.separacao.usuario.setor.consulta.dto';
import ParamsCommonRepository from '../common/params.common';
import { executeSelectWhere } from '../common/consulta.sql.helper';
import { wrapRepositoryError } from '../../utils/repository.error';

export default class SqlServerExpedicaoSeparacaoUsuarioSetorConsultaRepository
  implements LocalBaseConsultaRepositoryContract<ExpedicaoSeparacaoUsuarioSetorConsultaDto>
{
  private connect = ConnectionSqlServerMssql.getInstance();
  private basePatchSQL = ParamsCommonRepository.basePatchSQL('expedicao');

  public async select(pagination: Pagination): Promise<ExpedicaoSeparacaoUsuarioSetorConsultaDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.separacao.usuario.setor.consulta.sql');
      const sql = readSqlFileCached(patchSQL);
      const sqlWithPagination = `${sql} ORDER BY (SELECT NULL) OFFSET ${pagination?.offset} ROWS FETCH NEXT ${pagination?.limit} ROWS ONLY`;
      const result = await pool.request().query(sqlWithPagination);

      if (result.recordset.length === 0) return [];
      const entity = result.recordset.map((item: any) => {
        return ExpedicaoSeparacaoUsuarioSetorConsultaDto.fromObject(item);
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
  ): Promise<ExpedicaoSeparacaoUsuarioSetorConsultaDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.separacao.usuario.setor.consulta.sql');
      const select = readSqlFileCached(patchSQL);

      const result = await executeSelectWhere(pool, select, params, pagination, orderBy);

      if (result.recordset.length === 0) return [];
      const entitys = result.recordset.map((item: any) => {
        return ExpedicaoSeparacaoUsuarioSetorConsultaDto.fromObject(item);
      });

      return entitys;
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }
}
