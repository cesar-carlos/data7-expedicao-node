import path from 'path';
import { readSqlFileCached } from '../../infra/sql.file.cache';
import sql, { ConnectionPool } from 'mssql';

import { Params, Pagination, OrderBy } from '../../contracts/local.base.params';

import ConnectionSqlServerMssql from '../../infra/connection.sql.server.mssql';
import LocalBaseRepositoryContract from '../../contracts/local.base.repository.contract';
import ExpedicaoLoginAppDto from '../../dto/expedicao/expedicao.login.app.dto';
import ParamsCommonRepository from '../common/params.common';
import { executeSelectWhere } from '../common/consulta.sql.helper';
import { wrapRepositoryError } from '../../utils/repository.error';

export default class SqlServerExpedicaoLoginAppRepository implements LocalBaseRepositoryContract<ExpedicaoLoginAppDto> {
  private connect = ConnectionSqlServerMssql.getInstance();
  private basePatchSQL = ParamsCommonRepository.basePatchSQL('expedicao');

  public async select(): Promise<ExpedicaoLoginAppDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.login.app.select.sql');
      const sql = readSqlFileCached(patchSQL);
      const result = await pool.request().query(sql);

      if (result.recordset.length === 0) return [];
      const entity = result.recordset.map((item: any) => {
        return ExpedicaoLoginAppDto.fromObject(item);
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
  ): Promise<ExpedicaoLoginAppDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.login.app.select.sql');
      const select = readSqlFileCached(patchSQL);

      const result = await executeSelectWhere(pool, select, params, pagination, orderBy);

      if (result.recordset.length === 0) return [];
      const entitys = result.recordset.map((item: any) => {
        return ExpedicaoLoginAppDto.fromObject(item);
      });

      return entitys;
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async insert(entity: ExpedicaoLoginAppDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.login.app.insert.sql');
      const insert = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, insert);
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async update(entity: ExpedicaoLoginAppDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.login.app.update.sql');
      const update = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, update);
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async delete(entity: ExpedicaoLoginAppDto): Promise<void> {
    const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.login.app.delete.sql');
    const delet = readSqlFileCached(patchSQL);
    await this.actonEntity(entity, delet);
  }

  private async actonEntity(entity: ExpedicaoLoginAppDto, sqlCommand: string): Promise<void> {
    try {
      await this.connect.executeInTransaction(async (request) => {
        await request
        .input('CodLoginApp', sql.Int, entity.CodLoginApp)
        .input('Ativo', sql.Char(1), entity.Ativo)
        .input('Nome', sql.VarChar(30), entity.Nome)
        .input('Senha', sql.VarChar(60), entity.Senha)
        .input('CodUsuario', sql.Int, entity.CodUsuario ?? null)
        .input('FotoUsuario', sql.VarBinary(sql.MAX), entity.FotoUsuario ?? null)
        .query(sqlCommand);

      });
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }
}
