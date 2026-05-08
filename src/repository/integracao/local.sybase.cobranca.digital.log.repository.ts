import path from 'path';
import { readSqlFileCached } from '../../infra/sql.file.cache';
import sql from 'mssql';

import { ConnectionSybase } from '../../infra/connection.sybase';
import { Params } from '../../contracts/local.base.params';

import CobrancaDigitalLogDto from '../../dto/integracao/cobranca.digital.log.dto';
import LocalBaseRepositoryContract from '../../contracts/local.base.repository.contract';
import ParamsCommonRepository from '../common/params.common';

export default class LocalSybaseCobrancaDigitalLogRepository
  implements LocalBaseRepositoryContract<CobrancaDigitalLogDto>
{
  private connect = ConnectionSybase.getInstance();
  private basePatchSQL = ParamsCommonRepository.basePatchSQL('integracao');

  public async select(): Promise<CobrancaDigitalLogDto[]> {
    try {
      const pool = await (await this.connect.getConnection()).connect();
      const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.log.select.sql');
      const sql = readSqlFileCached(patchSQL);
      const result = await pool.request().query(sql);
      pool.close();

      if (result.length === 0) return [];
      const logs = result.map((item: any) => {
        return CobrancaDigitalLogDto.fromObject(item);
      });

      return logs;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async selectWhere(params: Params[] = []): Promise<CobrancaDigitalLogDto[]> {
    try {
      const pool = await (await this.connect.getConnection()).connect();
      const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.log.select.sql');
      const select = readSqlFileCached(patchSQL);

      const _params = ParamsCommonRepository.build(params);
      const sql = _params ? `${select} WHERE ${_params}` : select;
      const result = await pool.request().query(sql);
      pool.close();

      if (result.length === 0) return [];
      const logs = result.map((item: any) => {
        return CobrancaDigitalLogDto.fromObject(item);
      });

      return logs;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async insert(entity: CobrancaDigitalLogDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.log.insert.sql');
      const insert = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, insert);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async update(entity: CobrancaDigitalLogDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.log.update.sql');
      const update = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, update);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async delete(entity: CobrancaDigitalLogDto): Promise<void> {
    const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.log.update.sql');
    const delet = readSqlFileCached(patchSQL);
    await this.actonEntity(entity, delet);
  }

  private async actonEntity(entity: CobrancaDigitalLogDto, sqlCommand: string): Promise<void> {
    const pool = await this.connect.getConnection();

    try {
      const transaction = await pool.connect();
      await transaction
        .request()
        .input('ID', sql.VarChar(500), entity.id)
        .input('Message', sql.VarChar(2000), entity.message)
        .input('Details', sql.VarChar(2000), entity.details)
        .query(sqlCommand);
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      pool.close();
    }
  }
}
