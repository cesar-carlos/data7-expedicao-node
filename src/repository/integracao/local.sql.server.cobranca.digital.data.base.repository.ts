import path from 'path';
import { readSqlFileCached } from '../../infra/sql.file.cache';

import sql, { ConnectionPool } from 'mssql';
import { Params } from '../../contracts/local.base.params';

import ConnectionSqlServerMssql from '../../infra/connection.sql.server.mssql';
import CobrancaDigitalDataBaseDto from '../../dto/integracao/cobranca.digital.data.base.dto';
import LocalBaseRepositoryContract from '../../contracts/local.base.repository.contract';
import ParamsCommonRepository from '../common/params.common';
import { executeSelectWhere } from '../common/consulta.sql.helper';
import { wrapRepositoryError } from '../../utils/repository.error';

export default class LocalSqlServerCobrancaDigitalDataBaseRepository
  implements LocalBaseRepositoryContract<CobrancaDigitalDataBaseDto>
{
  private connect = ConnectionSqlServerMssql.getInstance();
  private basePatchSQL = ParamsCommonRepository.basePatchSQL('integracao');

  public async select(): Promise<CobrancaDigitalDataBaseDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.database.select.sql');
      const select = readSqlFileCached(patchSQL);
      const result = await pool.request().query(select);

      if (result.recordset.length === 0) return [];
      const dataConfgs = result.recordset.map((item: any) => {
        return CobrancaDigitalDataBaseDto.fromObject(item);
      });

      return dataConfgs;
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    } finally {
    }
  }

  public async selectWhere(params: Params[] = []): Promise<CobrancaDigitalDataBaseDto[]> {
    let pool: ConnectionPool | null = null;

    try {
      const pool: ConnectionPool = await this.connect.getConnection();
      const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.database.select.sql');
      const select = readSqlFileCached(patchSQL);

      const result = await executeSelectWhere(pool, select, params, undefined, undefined);

      if (result.recordset.length === 0) return [];
      const dataConfgs = result.recordset.map((item: any) => {
        return CobrancaDigitalDataBaseDto.fromObject(item);
      });

      return dataConfgs;
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    } finally {
    }
  }

  public async insert(entity: CobrancaDigitalDataBaseDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.database.insert.sql');
      const insert = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, insert);
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async update(entity: CobrancaDigitalDataBaseDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.database.update.sql');
      const update = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, update);
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async delete(entity: CobrancaDigitalDataBaseDto): Promise<void> {
    const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.database.delete.sql');
    const delet = readSqlFileCached(patchSQL);
    await this.actonEntity(entity, delet);
  }

  private async actonEntity(entity: CobrancaDigitalDataBaseDto, sqlCommand: string): Promise<void> {
    try {
      await this.connect.executeInTransaction(async (request) => {
        await request
        .input('CodCobrancaDigitalDataBase', sql.Int, entity.codCobrancaDigitalDataBase)
        .input('Provedor', sql.VarChar(30), entity.provedor)
        .input('Usuario', sql.VarChar(30), entity.usuario)
        .input('Senha', sql.VarChar(60), entity.senha)
        .input('Servidor', sql.VarChar(255), entity.servidor)
        .input('Base', sql.VarChar(30), entity.base)
        .input('Porta', sql.Int, entity.porta)
        .query(sqlCommand);

      });
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    } finally {
    }
  }
}
