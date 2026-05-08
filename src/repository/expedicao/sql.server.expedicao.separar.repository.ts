import path from 'path';
import { readSqlFileCached } from '../../infra/sql.file.cache';

import sql, { ConnectionPool } from 'mssql';
import { Params, Pagination, OrderBy } from '../../contracts/local.base.params';

import ConnectionSqlServerMssql from '../../infra/connection.sql.server.mssql';
import LocalBaseRepositoryContract from '../../contracts/local.base.repository.contract';
import ExpedicaoSepararDto from '../../dto/expedicao/expedicao.separar.dto';
import ParamsCommonRepository from '../common/params.common';
import { executeSelectWhere } from '../common/consulta.sql.helper';
import { wrapRepositoryError } from '../../utils/repository.error';

export default class SqlServerExpedicaoSepararRepository implements LocalBaseRepositoryContract<ExpedicaoSepararDto> {
  private connect = ConnectionSqlServerMssql.getInstance();
  private basePatchSQL = ParamsCommonRepository.basePatchSQL('expedicao');

  public async select(): Promise<ExpedicaoSepararDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.separar.select.sql');
      const sql = readSqlFileCached(patchSQL);
      const result = await pool.request().query(sql);

      if (result.recordset.length === 0) return [];
      const entity = result.recordset.map((item: any) => {
        return ExpedicaoSepararDto.fromObject(item);
      });

      return entity;
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    } finally {
    }
  }

  public async selectWhere(
    params: Params[] = [],
    pagination?: Pagination,
    orderBy?: OrderBy,
  ): Promise<ExpedicaoSepararDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.separar.select.sql');
      const select = readSqlFileCached(patchSQL);

      const result = await executeSelectWhere(pool, select, params, pagination, orderBy);

      if (result.recordset.length === 0) return [];
      const entitys = result.recordset.map((item: any) => {
        return ExpedicaoSepararDto.fromObject(item);
      });

      return entitys;
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    } finally {
    }
  }

  public async insert(entity: ExpedicaoSepararDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.separar.insert.sql');
      const insert = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, insert);
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async update(entity: ExpedicaoSepararDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.separar.update.sql');
      const update = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, update);
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async delete(entity: ExpedicaoSepararDto): Promise<void> {
    const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.separar.delete.sql');
    const delet = readSqlFileCached(patchSQL);
    await this.actonEntity(entity, delet);
  }

  private async actonEntity(entity: ExpedicaoSepararDto, sqlCommand: string): Promise<void> {
    try {
      await this.connect.executeInTransaction(async (request) => {
        await request
          .input('CodEmpresa', sql.Int, entity.CodEmpresa)
          .input('CodSepararEstoque', sql.Int, entity.CodSepararEstoque)
          .input('Origem', sql.VarChar(6), entity.Origem)
          .input('CodOrigem', sql.Int, entity.CodOrigem)
          .input('CodTipoOperacaoExpedicao', sql.Int, entity.CodTipoOperacaoExpedicao)
          .input('TipoEntidade', sql.VarChar(5), entity.TipoEntidade)
          .input('CodEntidade', sql.Int, entity.CodEntidade)
          .input('NomeEntidade', sql.VarChar(100), entity.NomeEntidade)
          .input('Situacao', sql.VarChar(30), entity.Situacao)
          .input('Data', sql.Date, entity.Data)
          .input('Hora', sql.VarChar(8), entity.Hora)
          .input('CodPrioridade', sql.Int, entity.CodPrioridade)
          .input('Historico', sql.VarChar(50), entity.Historico)
          .input('Observacao', sql.VarChar(2000), entity.Observacao)
          .input('CodMotivoCancelamento', sql.Int, entity.CodMotivoCancelamento)
          .input('DataCancelamento', sql.Date, entity.DataCancelamento)
          .input('HoraCancelamento', sql.VarChar(8), entity.HoraCancelamento)
          .input('CodUsuarioCancelamento', sql.Int, entity.CodUsuarioCancelamento)
          .input('NomeUsuarioCancelamento', sql.VarChar(30), entity.NomeUsuarioCancelamento)
          .input('ObservacaoCancelamento', sql.VarChar(2000), entity.ObservacaoCancelamento)
          .query(sqlCommand);
      });
    } catch (error: unknown) {
      console.error('Erro em SqlServerExpedicaoSepararRepository.actonEntity:', error);
      throw wrapRepositoryError(error);
    }
  }
}
