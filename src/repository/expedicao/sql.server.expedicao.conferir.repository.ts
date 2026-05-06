import path from 'path';
import { readSqlFileCached } from '../../infra/sql.file.cache';
import sql, { ConnectionPool } from 'mssql';

import { Params, Pagination, OrderBy } from '../../contracts/local.base.params';

import ConnectionSqlServerMssql from '../../infra/connection.sql.server.mssql';
import LocalBaseRepositoryContract from '../../contracts/local.base.repository.contract';
import ExpedicaoConferirDto from '../../dto/expedicao/expedicao.conferir.dto';
import ParamsCommonRepository from '../common/params.common';
import { executeSelectWhere } from '../common/consulta.sql.helper';
import { wrapRepositoryError } from '../../utils/repository.error';

export default class SqlServerExpedicaoConferirRepository implements LocalBaseRepositoryContract<ExpedicaoConferirDto> {
  private connect = ConnectionSqlServerMssql.getInstance();
  private basePatchSQL = ParamsCommonRepository.basePatchSQL('expedicao');

  public async select(): Promise<ExpedicaoConferirDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.conferir.select.sql');
      const sql = readSqlFileCached(patchSQL);
      const result = await pool.request().query(sql);

      if (result.recordset.length === 0) return [];
      const entity = result.recordset.map((item: any) => {
        return ExpedicaoConferirDto.fromObject(item);
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
  ): Promise<ExpedicaoConferirDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.conferir.select.sql');
      const select = readSqlFileCached(patchSQL);

      const result = await executeSelectWhere(pool, select, params, pagination, orderBy);

      if (result.recordset.length === 0) return [];
      const entitys = result.recordset.map((item: any) => {
        return ExpedicaoConferirDto.fromObject(item);
      });

      return entitys;
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    } finally {
    }
  }

  public async insert(entity: ExpedicaoConferirDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.conferir.insert.sql');
      const insert = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, insert);
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async update(entity: ExpedicaoConferirDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.conferir.update.sql');
      const update = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, update);
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async delete(entity: ExpedicaoConferirDto): Promise<void> {
    const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.conferir.delete.sql');
    const delet = readSqlFileCached(patchSQL);
    await this.actonEntity(entity, delet);
  }

  private async actonEntity(entity: ExpedicaoConferirDto, sqlCommand: string): Promise<void> {
    try {
      await this.connect.executeInTransaction(async (request) => {
        await request
        .input('CodEmpresa', sql.Int, entity.CodEmpresa)
        .input('CodConferir', sql.Int, entity.CodConferir)
        .input('Origem', sql.VarChar(6), entity.Origem)
        .input('CodOrigem', sql.Int, entity.CodOrigem)
        .input('CodPrioridade', sql.Int, entity.CodPrioridade)
        .input('Situacao', sql.VarChar(30), entity.Situacao)
        .input('Data', sql.Date, entity.Data)
        .input('Hora', sql.VarChar(8), entity.Hora)
        .input('Historico', sql.VarChar(50), entity.Historico)
        .input('Observacao', sql.VarChar(2000), entity.Observacao)
        .input('CodMotivoCancelamento', sql.Int, entity.CodMotivoCancelamento)
        .input('DataCancelamento', sql.Date, entity.DataCancelamento)
        .input('HoraCancelamento', sql.VarChar(8), entity.HoraCancelamento)
        .input('CodUsuarioCancelamento', sql.Int, entity.CodUsuarioCancelamento)
        .input('NomeUsuarioCancelamento', sql.VarChar(30), entity.NomeUsuarioCancelamento)
        .input('ObservacaoCancelamento', sql.VarChar(2000), entity.ObservacaoCancelamento)
        .query(sqlCommand);

      });
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }
}
