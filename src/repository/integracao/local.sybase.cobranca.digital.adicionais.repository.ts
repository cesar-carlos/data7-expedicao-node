import path from 'path';
import { readSqlFileCached } from '../../infra/sql.file.cache';
import sql from 'mssql';

import { Params } from '../../contracts/local.base.params';

import CobrancaDigitalAdicionaisDto from '../../dto/integracao/cobranca.digital.adicionais.dto';
import { ConnectionSybase } from '../../infra/connection.sybase';
import ParamsCommonRepository from '../common/params.common';
import LocalBaseRepositoryContract from '../../contracts/local.base.repository.contract';

export default class LocalSybaseCobrancaDigitalAdicionaisRepository
  implements LocalBaseRepositoryContract<CobrancaDigitalAdicionaisDto>
{
  private connect = ConnectionSybase.getInstance();
  private basePatchSQL = ParamsCommonRepository.basePatchSQL('integracao');

  public async select(): Promise<CobrancaDigitalAdicionaisDto[]> {
    try {
      const pool = await (await this.connect.getConnection()).connect();
      const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.adicionais.select.sql');
      const sql = readSqlFileCached(patchSQL);
      const result = await pool.request().query(sql);
      pool.close();

      if (result.length === 0) return [];
      const logs = result.map((item: any) => {
        return CobrancaDigitalAdicionaisDto.fromObject(item);
      });

      return logs;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async selectWhere(params: Params[] = []): Promise<CobrancaDigitalAdicionaisDto[]> {
    try {
      const pool = await (await this.connect.getConnection()).connect();
      const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.adicionais.select.sql');
      const select = readSqlFileCached(patchSQL);

      const _params = ParamsCommonRepository.build(params);
      const sql = _params ? `${select} WHERE ${_params}` : select;
      const result = await pool.request().query(sql);
      pool.close();

      if (result.length === 0) return [];
      const logs = result.map((item: any) => {
        return CobrancaDigitalAdicionaisDto.fromObject(item);
      });

      return logs;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async insert(entity: CobrancaDigitalAdicionaisDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.adicionais.insert.sql');
      const insert = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, insert);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async update(entity: CobrancaDigitalAdicionaisDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.adicionais.update.sql');
      const update = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, update);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async delete(entity: CobrancaDigitalAdicionaisDto): Promise<void> {
    const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.adicionais.delete.sql');
    const delet = readSqlFileCached(patchSQL);
    await this.actonEntity(entity, delet);
  }

  private async actonEntity(entity: CobrancaDigitalAdicionaisDto, sqlCommand: string): Promise<void> {
    const pool = await this.connect.getConnection();

    try {
      const transaction = await pool.connect();
      await transaction
        .request()
        .input('CodEmpresa', sql.Int, entity.codEmpresa)
        .input('CodCobrancaDigital', sql.Int, entity.codCobrancaDigital)
        .input('Item', sql.VarChar(3), entity.item)
        .input('Sequencia', sql.Int, entity.sequencia)
        .input('Adicional', sql.VarChar(2000), entity.adicional)
        .query(sqlCommand);
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      pool.close();
    }
  }
}
