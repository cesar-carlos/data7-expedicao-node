import path from 'path';
import { readSqlFileCached } from '../../infra/sql.file.cache';

import sql, { ConnectionPool } from 'mssql';
import { Params, Pagination, OrderBy } from '../../contracts/local.base.params';

import ConnectionSqlServerMssql from '../../infra/connection.sql.server.mssql';
import ExpedicaoPrioridadeDto from '../../dto/expedicao/expedicao.prioridade.dto';
import LocalBaseRepositoryContract from '../../contracts/local.base.repository.contract';
import ParamsCommonRepository from '../common/params.common';
import { executeSelectWhere } from '../common/consulta.sql.helper';
import { wrapRepositoryError } from '../../utils/repository.error';

export default class SqlServerExpedicaoPrioridadeRepository
  implements LocalBaseRepositoryContract<ExpedicaoPrioridadeDto>
{
  private connect = ConnectionSqlServerMssql.getInstance();
  private basePatchSQL = ParamsCommonRepository.basePatchSQL('expedicao');

  public async select(): Promise<ExpedicaoPrioridadeDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.prioridade.select.sql');
      const sql = readSqlFileCached(patchSQL);
      const result = await pool.request().query(sql);

      if (result.recordset.length === 0) return [];
      const entity = result.recordset.map((item: any) => {
        return ExpedicaoPrioridadeDto.fromObject(item);
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
  ): Promise<ExpedicaoPrioridadeDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.prioridade.select.sql');
      const select = readSqlFileCached(patchSQL);

      const result = await executeSelectWhere(pool, select, params, pagination, orderBy);

      if (result.recordset.length === 0) return [];
      const entitys = result.recordset.map((item: any) => {
        return ExpedicaoPrioridadeDto.fromObject(item);
      });

      return entitys;
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    } finally {
    }
  }

  public async insert(entity: ExpedicaoPrioridadeDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.prioridade.insert.sql');
      const insert = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, insert);
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async update(entity: ExpedicaoPrioridadeDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.prioridade.update.sql');
      const update = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, update);
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async delete(entity: ExpedicaoPrioridadeDto): Promise<void> {
    const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.prioridade.delete.sql');
    const delet = readSqlFileCached(patchSQL);
    await this.actonEntity(entity, delet);
  }

  private async actonEntity(entity: ExpedicaoPrioridadeDto, sqlCommand: string): Promise<void> {
    try {
      await this.connect.executeInTransaction(async (request) => {
        await request
        .input('CodPrioridade', sql.Int, entity.CodPrioridade)
        .input('Descricao', sql.VarChar(100), entity.Descricao)
        .input('Prioridade', sql.Int, entity.Prioridade)
        .input('Ativo', sql.VarChar(1), entity.Ativo)
        .query(sqlCommand);

      });
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    } finally {
    }
  }
}
