import path from 'path';
import { readSqlFileCached } from '../../infra/sql.file.cache';

import sql, { ConnectionPool } from 'mssql';
import { Params } from '../../contracts/local.base.params';

import ChaveDto from '../../dto/integracao/chave.dto';
import ConnectionSqlServerMssql from '../../infra/connection.sql.server.mssql';
import ParamsCommonRepository from '../common/params.common';
import { executeSelectWhere } from '../common/consulta.sql.helper';
import { wrapRepositoryError } from '../../utils/repository.error';
import LocalBaseRepositoryContract from '../../contracts/local.base.repository.contract';

export default class LocalSqlServerCobrancaDigitalChaveRepository implements LocalBaseRepositoryContract<ChaveDto> {
  private connect = ConnectionSqlServerMssql.getInstance();
  private basePatchSQL = ParamsCommonRepository.basePatchSQL('integracao');

  public async select(): Promise<ChaveDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.chaves.select.sql');
      const select = readSqlFileCached(patchSQL);
      const result = await pool.request().query(select);

      if (result.recordset.length === 0) return [];
      const chaves = result.recordset.map((item: any) => {
        return ChaveDto.fromObject(item);
      });

      return chaves;
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    } finally {
    }
  }

  public async selectWhere(params: Params[] = []): Promise<ChaveDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.chaves.select.sql');
      const select = readSqlFileCached(patchSQL);

      const result = await executeSelectWhere(pool, select, params, undefined, undefined);

      if (result.recordset.length === 0) return [];
      const chaves = result.recordset.map((item: any) => {
        return ChaveDto.fromObject(item);
      });

      return chaves;
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    } finally {
    }
  }

  public async insert(entity: ChaveDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.chaves.insert.sql');
      const insert = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, insert);
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async update(entity: ChaveDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.chaves.update.sql');
      const update = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, update);
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async delete(entity: ChaveDto): Promise<void> {
    const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.chaves.delete.sql');
    const delet = readSqlFileCached(patchSQL);
    await this.actonEntity(entity, delet);
  }

  private async actonEntity(entity: ChaveDto, sqlCommand: string): Promise<void> {
    try {
      await this.connect.executeInTransaction(async (request) => {
        await request
        .input('CodEmpresa', sql.Int, entity.codEmpresa)
        .input('CodFilial', sql.Int, entity.codFilial)
        .input('CodCobrancaDigital', sql.Int, entity.codCobrancaDigital)
        .input('UUID', sql.VarChar(500), entity.uuid)
        .input('Status', sql.VarChar(1), entity.status)
        .input('DataCriacao', sql.Date, entity.dataCriacao)
        .input('Chave', sql.VarChar(255), entity.chave)
        .query(sqlCommand);

      });
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    } finally {
    }
  }
}
