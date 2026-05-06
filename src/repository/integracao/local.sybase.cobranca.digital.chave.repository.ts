import path from 'path';
import { readSqlFileCached } from '../../infra/sql.file.cache';
import sql from 'mssql';

import { ConnectionSybase } from '../../infra/connection.sybase';
import { Params } from '../../contracts/local.base.params';

import ChaveDto from '../../dto/integracao/chave.dto';
import ParamsCommonRepository from '../common/params.common';
import LocalBaseRepositoryContract from '../../contracts/local.base.repository.contract';

export default class LocalSybaseCobrancaDigitalChaveRepository implements LocalBaseRepositoryContract<ChaveDto> {
  private connect = ConnectionSybase.getInstance();
  private basePatchSQL = ParamsCommonRepository.basePatchSQL('integracao');

  public async select(): Promise<ChaveDto[]> {
    const pool = await (await this.connect.getConnection()).connect();
    const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.chaves.select.sql');
    const sql = readSqlFileCached(patchSQL);
    const result = await pool.request().query(sql);
    pool.close();

    if (result.recordset === 0) return [];
    const chaves = result.map((item: any) => {
      return ChaveDto.fromObject(item);
    });

    return chaves;
  }

  public async selectWhere(params: Params[] = []): Promise<ChaveDto[]> {
    const pool = await (await this.connect.getConnection()).connect();
    const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.chaves.select.sql');
    const select = readSqlFileCached(patchSQL);

    const _params = ParamsCommonRepository.build(params);
    const sql = _params ? `${select} WHERE ${_params}` : select;
    const result = await pool.request().query(sql);
    pool.close();

    if (result.length === 0) return [];
    const chaves = result.map((item: any) => {
      return ChaveDto.fromObject(item);
    });

    return chaves;
  }

  public async insert(entity: ChaveDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.chaves.insert.sql');
      const insert = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, insert);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async update(entity: ChaveDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.chaves.update.sql');
      const update = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, update);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async delete(entity: ChaveDto): Promise<void> {
    const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.chaves.delete.sql');
    const delet = readSqlFileCached(patchSQL);
    await this.actonEntity(entity, delet);
  }

  private async actonEntity(entity: ChaveDto, sqlCommand: string): Promise<void> {
    const pool = await this.connect.getConnection();

    try {
      const transaction = await pool.connect();
      await transaction
        .request()
        .input('CodEmpresa', sql.Int, entity.codEmpresa)
        .input('CodFilial', sql.Int, entity.codFilial)
        .input('CodCobrancaDigital', sql.Int, entity.codCobrancaDigital)
        .input('UUID', sql.VarChar(500), entity.uuid)
        .input('Status', sql.VarChar(1), entity.status)
        .input('DataCriacao', sql.Date, entity.dataCriacao)
        .input('Chave', sql.VarChar(255), entity.chave)
        .query(sqlCommand);
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      pool.close();
    }
  }
}
