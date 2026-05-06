import path from 'path';
import { readSqlFileCached } from '../../infra/sql.file.cache';
import sql from 'mssql';

import { ConnectionSybase } from '../../infra/connection.sybase';
import { Params } from '../../contracts/local.base.params';

import CobrancaDigitalSituacaoDto from '../../dto/integracao/cobranca.digital.situacao.dto';
import LocalBaseRepositoryContract from '../../contracts/local.base.repository.contract';
import ParamsCommonRepository from '../common/params.common';

export default class LocalSybaseCobrancaDigitalSituacaoRepository
  implements LocalBaseRepositoryContract<CobrancaDigitalSituacaoDto>
{
  private connect = ConnectionSybase.getInstance();
  private basePatchSQL = ParamsCommonRepository.basePatchSQL('integracao');

  public async select(): Promise<CobrancaDigitalSituacaoDto[]> {
    try {
      const pool = await (await this.connect.getConnection()).connect();
      const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.situacao.select.sql');
      const select = readSqlFileCached(patchSQL);
      const result = await pool.request().query(select);
      pool.close();

      if (result.length === 0) return [];
      const logs = result.map((item: any) => {
        return CobrancaDigitalSituacaoDto.fromObject(item);
      });

      return logs;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async selectWhere(params: Params[] = []): Promise<CobrancaDigitalSituacaoDto[]> {
    try {
      const pool = await (await this.connect.getConnection()).connect();
      const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.situacao.select.sql');
      const select = readSqlFileCached(patchSQL);

      const _params = ParamsCommonRepository.build(params);
      const sql = _params ? `${select} WHERE ${_params}` : select;
      const result = await pool.request().query(sql);
      pool.close();

      if (result.length === 0) return [];
      const logs = result.map((item: any) => {
        return CobrancaDigitalSituacaoDto.fromObject(item);
      });

      return logs;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async insert(entity: CobrancaDigitalSituacaoDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.situacao.insert.sql');
      const insert = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, insert);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async update(entity: CobrancaDigitalSituacaoDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.situacao.update.sql');
      const update = readSqlFileCached(patchSQL);

      await this.actonEntity(entity, update);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async delete(entity: CobrancaDigitalSituacaoDto): Promise<void> {
    const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.situacao.delete.sql');
    const delet = readSqlFileCached(patchSQL);
    await this.actonEntity(entity, delet);
  }

  private async actonEntity(entity: CobrancaDigitalSituacaoDto, sqlCommand: string): Promise<void> {
    const pool = await this.connect.getConnection();

    try {
      const transaction = await pool.connect();
      await transaction
        .request()
        .input('SysId', sql.VarChar(500), entity.sysId)
        .input('Sequencia', sql.Int, entity.sequencia)
        .input('Status', sql.VarChar(1), entity.status)
        .input('TxId', sql.VarChar(500), entity.txId)
        .input('LocId', sql.VarChar(500), entity.locId)
        .input('Chave', sql.VarChar(100), entity.chave)
        .query(sqlCommand);
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      pool.close();
    }
  }
}
