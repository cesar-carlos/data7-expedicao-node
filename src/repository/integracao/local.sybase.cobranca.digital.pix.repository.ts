import path from 'path';
import { readSqlFileCached } from '../../infra/sql.file.cache';
import sql from 'mssql';

import { ConnectionSybase } from '../../infra/connection.sybase';
import { Params } from '../../contracts/local.base.params';

import CobrancaDigitalPixDto from '../../dto/integracao/cobranca.digital.pix.dto';
import ParamsCommonRepository from '../common/params.common';
import LocalBaseRepositoryContract from '../../contracts/local.base.repository.contract';

export default class LocalSybaseCobrancaDigitalPixRepository
  implements LocalBaseRepositoryContract<CobrancaDigitalPixDto>
{
  private connect = ConnectionSybase.getInstance();
  private basePatchSQL = ParamsCommonRepository.basePatchSQL('integracao');

  public async select(): Promise<CobrancaDigitalPixDto[]> {
    try {
      const pool = await (await this.connect.getConnection()).connect();
      const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.pix.select.sql');
      const sql = readSqlFileCached(patchSQL);
      const result = await pool.request().query(sql);
      pool.close();

      if (result.length === 0) return [];
      const logs = result.map((item: any) => {
        return CobrancaDigitalPixDto.fromObject(item);
      });

      return logs;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async selectWhere(params: Params[] = []): Promise<CobrancaDigitalPixDto[]> {
    try {
      const pool = await (await this.connect.getConnection()).connect();
      const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.pix.select.sql');
      const select = readSqlFileCached(patchSQL);

      const _params = ParamsCommonRepository.build(params);
      const sql = _params ? `${select} WHERE ${_params}` : select;
      const result = await pool.request().query(sql);
      pool.close();

      if (result.length === 0) return [];
      const logs = result.map((item: any) => {
        return CobrancaDigitalPixDto.fromObject(item);
      });

      return logs;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async insert(entity: CobrancaDigitalPixDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.pix.insert.sql');
      const insert = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, insert);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async update(entity: CobrancaDigitalPixDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.pix.update.sql');
      const update = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, update);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async delete(entity: CobrancaDigitalPixDto): Promise<void> {
    const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.pix.delete.sql');
    const delet = readSqlFileCached(patchSQL);
    await this.actonEntity(entity, delet);
  }

  private async actonEntity(entity: CobrancaDigitalPixDto, sqlCommand: string): Promise<void> {
    const pool = await this.connect.getConnection();

    try {
      const transaction = await pool.connect();
      await transaction
        .request()
        .input('SysId', sql.VarChar(500), entity.sysId)
        .input('Sequencia', sql.Int, entity.sequencia)
        .input('TxId', sql.VarChar(100), entity.txId)
        .input('DataCriacao', sql.Date, entity.dataCriacao)
        .input('DataExpiracao', sql.Date, entity.dataExpiracao)
        .input('QrCode', sql.VarChar(1000), entity.qrCode)
        .input('ImagemQrcode', sql.VarChar(8000), entity.imagemQrcode)
        .input('Valor', sql.Money, entity.valor)
        .query(sqlCommand);
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      pool.close();
    }
  }
}
