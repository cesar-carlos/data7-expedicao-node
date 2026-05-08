import path from 'path';
import { readSqlFileCached } from '../../infra/sql.file.cache';
import sql from 'mssql';

import { ConnectionSybase } from '../../infra/connection.sybase';
import { Params } from '../../contracts/local.base.params';

import CobrancaDigitalConfigDto from '../../dto/integracao/cobranca.digital.config.dto';
import LocalBaseRepositoryContract from '../../contracts/local.base.repository.contract';
import ParamsCommonRepository from '../common/params.common';

export default class LocalSybaseCobrancaDigitalConfigRepository
  implements LocalBaseRepositoryContract<CobrancaDigitalConfigDto>
{
  private connect = ConnectionSybase.getInstance();
  private basePatchSQL = ParamsCommonRepository.basePatchSQL('integracao');

  public async select(): Promise<CobrancaDigitalConfigDto[]> {
    const pool = await (await this.connect.getConnection()).connect();
    const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.config.select.sql');
    const select = readSqlFileCached(patchSQL);
    const result = await pool.request().query(select);
    pool.close();

    if (result.length === 0) return [];
    const configs = result.map((item: any) => {
      return CobrancaDigitalConfigDto.fromObject(item);
    });

    return configs;
  }

  public async selectWhere(params: Params[] = []): Promise<CobrancaDigitalConfigDto[]> {
    const pool = await (await this.connect.getConnection()).connect();
    const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.config.select.sql');
    const select = readSqlFileCached(patchSQL);

    const _params = ParamsCommonRepository.build(params);
    const sql = _params ? `${select} WHERE ${_params}` : select;
    const result = await pool.request().query(sql);
    pool.close();

    if (result.length === 0) return [];
    const configs = result.map((item: any) => {
      return CobrancaDigitalConfigDto.fromObject(item);
    });

    return configs;
  }

  public async insert(entity: CobrancaDigitalConfigDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.config.insert.sql');
      const insert = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, insert);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async update(entity: CobrancaDigitalConfigDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.config.update.sql');
      const update = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, update);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async delete(entity: CobrancaDigitalConfigDto): Promise<void> {
    const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.config.delete.sql');
    const delet = readSqlFileCached(patchSQL);
    await this.actonEntity(entity, delet);
  }

  private async actonEntity(entity: CobrancaDigitalConfigDto, sqlCommand: string): Promise<void> {
    const pool = await this.connect.getConnection();

    try {
      const transaction = await pool.connect();
      await transaction
        .request()
        .input('CodEmpresa', sql.Int, entity.codEmpresa)
        .input('CodConfiguracao', sql.Int, entity.codConfiguracao)
        .input('Ativo', sql.VarChar(1), entity.ativo)
        .input('Gerenciadora', sql.VarChar(60), entity.gerenciadora)
        .input('ClientId', sql.VarChar(255), entity.clientId)
        .input('ClientSecret', sql.VarChar(255), entity.clientSecret)
        .input('Certificado', sql.VarBinary(), Buffer.from(entity.certificado, 'binary').toString('base64'))
        .query(sqlCommand);
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      pool.close();
    }
  }
}
