import path from 'path';
import { readSqlFileCached } from '../../infra/sql.file.cache';

import sql, { ConnectionPool } from 'mssql';
import { Params } from '../../contracts/local.base.params';

import ConnectionSqlServerMssql from '../../infra/connection.sql.server.mssql';
import CobrancaDigitalDto from '../../dto/integracao/cobranca.digital.dto';
import ParamsCommonRepository from '../common/params.common';
import { executeSelectWhere } from '../common/consulta.sql.helper';
import { wrapRepositoryError } from '../../utils/repository.error';
import LocalBaseRepositoryContract from '../../contracts/local.base.repository.contract';

export default class LocalSqlServerCobrancaDigitalRepository
  implements LocalBaseRepositoryContract<CobrancaDigitalDto>
{
  private connect = ConnectionSqlServerMssql.getInstance();
  private basePatchSQL = ParamsCommonRepository.basePatchSQL('integracao');

  public async select(): Promise<CobrancaDigitalDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.select.sql');
      const select = readSqlFileCached(patchSQL);
      const result = await pool.request().query(select);

      if (result.recordset.length === 0) return [];
      const chaves = result.recordset.map((item: any) => {
        return CobrancaDigitalDto.fromObject(item);
      });

      return chaves;
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    } finally {
    }
  }

  public async selectWhere(params: Params[] = []): Promise<CobrancaDigitalDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.select.sql');
      const select = readSqlFileCached(patchSQL);

      const result = await executeSelectWhere(pool, select, params, undefined, undefined);

      if (result.recordset.length === 0) return [];
      const chaves = result.recordset.map((item: any) => {
        return CobrancaDigitalDto.fromObject(item);
      });

      return chaves;
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    } finally {
    }
  }

  public async insert(entity: CobrancaDigitalDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.insert.sql');
      const insert = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, insert);
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async update(entity: CobrancaDigitalDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.update.sql');
      const update = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, update);
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async delete(entity: CobrancaDigitalDto): Promise<void> {
    const patchSQL = path.resolve(this.basePatchSQL, 'cobranca.digital.delete.sql');
    const delet = readSqlFileCached(patchSQL);
    await this.actonEntity(entity, delet);
  }

  private async actonEntity(entity: CobrancaDigitalDto, sqlCommand: string): Promise<void> {
    try {
      await this.connect.executeInTransaction(async (request) => {
        await request
        .input('CodEmpresa', sql.Int, entity.codEmpresa)
        .input('CodFilial', sql.Int, entity.codFilial)
        .input('CodCobrancaDigital', sql.Int, entity.codCobrancaDigital)
        .input('BloqueioKey', sql.VarChar(500), entity.bloqueioKey)
        .input('Origem', sql.VarChar(6), entity.origem)
        .input('CodOrigem', sql.Int, entity.codOrigem)
        .input('Situacao', sql.VarChar(60), entity.situacao)
        .input('CodCliente', sql.Int, entity.codCliente)
        .input('NomeCliente', sql.VarChar(100), entity.nomeCliente)
        .input('CNPJ_CPF', sql.VarChar(20), entity.CNPJ_CPF)
        .input('Telefone', sql.VarChar(30), entity.telefone)
        .input('Email', sql.VarChar(500), entity.email)
        .input('Endereco', sql.VarChar(100), entity.endereco)
        .input('Numero', sql.VarChar(15), entity.numero)
        .input('Complemento', sql.VarChar(200), entity.complemento)
        .input('Bairro', sql.VarChar(60), entity.bairro)
        .input('CEP', sql.VarChar(10), entity.CEP)
        .input('CodigoMunicipio', sql.Int, entity.codigoMunicipio)
        .input('NomeMunicipio', sql.VarChar(60), entity.nomeMunicipio)
        .input('UFMunicipio', sql.VarChar(2), entity.UFMunicipio)
        .input('CodUsuario', sql.Int, entity.codUsuario)
        .input('NomeUsuario', sql.VarChar(20), entity.nomeUsuario)
        .input('EstacaoTrabalho', sql.VarChar(20), entity.estacaoTrabalho)
        .input('Ip', sql.VarChar(30), entity.ip)
        .query(sqlCommand);

      });
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    } finally {
    }
  }
}
