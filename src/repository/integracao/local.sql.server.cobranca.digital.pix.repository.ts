import path from 'path';
import { readSqlFileCached } from '../../infra/sql.file.cache';

import sql, { ConnectionPool } from 'mssql';
import { Params } from '../../contracts/local.base.params';

import ConnectionSqlServerMssql from '../../infra/connection.sql.server.mssql';
import CobrancaDigitalPixDto from '../../dto/integracao/cobranca.digital.pix.dto';
import ParamsCommonRepository from '../common/params.common';
import { executeSelectWhere } from '../common/consulta.sql.helper';
import { wrapRepositoryError } from '../../utils/repository.error';
import LocalBaseRepositoryContract from '../../contracts/local.base.repository.contract';

export default class LocalSqlServerCobrancaDigitalPixRepository
  implements LocalBaseRepositoryContract<CobrancaDigitalPixDto>
{
  private connect = ConnectionSqlServerMssql.getInstance();
  private basePatchSQL = ParamsCommonRepository.basePatchSQL('integracao');

  public async select(): Promise<CobrancaDigitalPixDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.pix.select.sql');
      const select = readSqlFileCached(patchSQL);
      const result = await pool.request().query(select);

      if (result.recordset.length === 0) return [];
      const logs = result.recordset.map((item: any) => {
        return CobrancaDigitalPixDto.fromObject(item);
      });

      return logs;
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    } finally {
    }
  }

  public async selectWhere(params: Params[] = []): Promise<CobrancaDigitalPixDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.pix.select.sql');
      const select = readSqlFileCached(patchSQL);

      const result = await executeSelectWhere(pool, select, params, undefined, undefined);

      if (result.recordset.length === 0) return [];
      const logs = result.recordset.map((item: any) => {
        return CobrancaDigitalPixDto.fromObject(item);
      });

      return logs;
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    } finally {
    }
  }

  public async insert(entity: CobrancaDigitalPixDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.pix.insert.sql');
      const insert = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, insert);
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async update(entity: CobrancaDigitalPixDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.pix.update.sql');
      const update = readSqlFileCached(patchSQL);

      await this.actonEntity(entity, update);
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async delete(entity: CobrancaDigitalPixDto): Promise<void> {
    const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.pix.delete.sql');
    const delet = readSqlFileCached(patchSQL);
    await this.actonEntity(entity, delet);
  }

  private async actonEntity(entity: CobrancaDigitalPixDto, sqlCommand: string): Promise<void> {
    try {
      await this.connect.executeInTransaction(async (request) => {
        await request
          .input('SysId', sql.VarChar(500), entity.sysId)
          .input('Sequencia', sql.Int, entity.sequencia)
          .input('TxId', sql.VarChar(100), entity.txId)
          .input('DataCriacao', sql.Date, entity.dataCriacao)
          .input('DataExpiracao', sql.Date, entity.dataExpiracao)
          .input('QrCode', sql.VarChar(1000), entity.qrCode)
          .input('ImagemQrcode', sql.VarChar(8000), entity.imagemQrcode)
          .input('Valor', sql.Money, entity.valor)
          .query(sqlCommand);
      });
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }
}
