import path from 'path';
import { readSqlFileCached } from '../../infra/sql.file.cache';

import sql, { ConnectionPool } from 'mssql';
import { Params, Pagination, OrderBy } from '../../contracts/local.base.params';

import ConnectionSqlServerMssql from '../../infra/connection.sql.server.mssql';
import LocalBaseRepositoryContract from '../../contracts/local.base.repository.contract';
import ExpedicaoArmazenarDto from '../../dto/expedicao/expedicao.armazenar.dto';
import ParamsCommonRepository from '../common/params.common';
import { executeSelectWhere } from '../common/consulta.sql.helper';
import { wrapRepositoryError } from '../../utils/repository.error';

export default class SqlServerExpedicaoArmazenarRepository
  implements LocalBaseRepositoryContract<ExpedicaoArmazenarDto>
{
  private connect = ConnectionSqlServerMssql.getInstance();
  private basePatchSQL = ParamsCommonRepository.basePatchSQL('expedicao');

  public async select(): Promise<ExpedicaoArmazenarDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.armazenar.select.sql');
      const sql = readSqlFileCached(patchSQL);
      const result = await pool.request().query(sql);

      if (result.recordset.length === 0) return [];
      const entity = result.recordset.map((item: any) => {
        return ExpedicaoArmazenarDto.fromObject(item);
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
  ): Promise<ExpedicaoArmazenarDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.armazenar.select.sql');
      const select = readSqlFileCached(patchSQL);

      const result = await executeSelectWhere(pool, select, params, pagination, orderBy);

      if (result.recordset.length === 0) return [];
      const entitys = result.recordset.map((item: any) => {
        return ExpedicaoArmazenarDto.fromObject(item);
      });

      return entitys;
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    } finally {
    }
  }

  public async insert(entity: ExpedicaoArmazenarDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.armazenar.insert.sql');
      const insert = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, insert);
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async update(entity: ExpedicaoArmazenarDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.armazenar.update.sql');
      const update = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, update);
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async delete(entity: ExpedicaoArmazenarDto): Promise<void> {
    const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.armazenar.delete.sql');
    const delet = readSqlFileCached(patchSQL);
    await this.actonEntity(entity, delet);
  }

  private async actonEntity(entity: ExpedicaoArmazenarDto, sqlCommand: string): Promise<void> {
    try {
      await this.connect.executeInTransaction(async (request) => {
        await request
        .input('CodEmpresa', sql.Int, entity.CodEmpresa)
        .input('CodArmazenar', sql.Int, entity.CodArmazenar)
        .input('Origem', sql.VarChar(6), entity.Origem)
        .input('CodOrigem', sql.Int, entity.CodOrigem)
        .input('NumeroDocumento', sql.VarChar(60), entity.NumeroDocumento)
        .input('CodPrioridade', sql.Int, entity.CodPrioridade)
        .input('DataLancamento', sql.Date, entity.DataLancamento)
        .input('HoraLancamento', sql.VarChar(8), entity.HoraLancamento)
        .input('CodUsuarioLancamento', sql.Int, entity.CodUsuarioLancamento)
        .input('NomeUsuarioLancamento', sql.VarChar(30), entity.NomeUsuarioLancamento)
        .input('EstacaoLancamento', sql.VarChar(30), entity.EstacaoLancamento)
        .input('Observacao', sql.VarChar(2000), entity.Observacao)
        .query(sqlCommand);

      });
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }
}
