import path from 'path';
import { readSqlFileCached } from '../../infra/sql.file.cache';

import sql, { ConnectionPool } from 'mssql';
import { Params, Pagination, OrderBy } from '../../contracts/local.base.params';

import ConnectionSqlServerMssql from '../../infra/connection.sql.server.mssql';
import LocalBaseRepositoryContract from '../../contracts/local.base.repository.contract';
import ExpedicaoCarrinhoPercursoDto from '../../dto/expedicao/expedicao.carrinho.percurso.dto';
import ParamsCommonRepository from '../common/params.common';
import { executeSelectPaged, executeSelectWhere, executeSelectWhereAny } from '../common/consulta.sql.helper';
import { wrapRepositoryError } from '../../utils/repository.error';

export default class SqlServerExpedicaoCarrinhoPercursoRepository
  implements LocalBaseRepositoryContract<ExpedicaoCarrinhoPercursoDto>
{
  private connect = ConnectionSqlServerMssql.getInstance();
  private basePatchSQL = ParamsCommonRepository.basePatchSQL('expedicao');

  public async select(pagination?: Pagination): Promise<ExpedicaoCarrinhoPercursoDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.carrinho.percurso.select.sql');
      const sqlText = readSqlFileCached(patchSQL);
      const result = await executeSelectPaged(pool, sqlText, pagination ?? Pagination.create());

      if (result.recordset.length === 0) return [];
      const entity = result.recordset.map((item: any) => {
        return ExpedicaoCarrinhoPercursoDto.fromObject(item);
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
  ): Promise<ExpedicaoCarrinhoPercursoDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.carrinho.percurso.select.sql');
      const select = readSqlFileCached(patchSQL);

      const result = await executeSelectWhere(pool, select, params, pagination, orderBy);

      if (result.recordset.length === 0) return [];
      const entitys = result.recordset.map((item: any) => {
        return ExpedicaoCarrinhoPercursoDto.fromObject(item);
      });

      return entitys;
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    } finally {
    }
  }

  public async selectWhereAny(
    groups: Params[][],
    pagination?: Pagination,
    orderBy?: OrderBy,
  ): Promise<ExpedicaoCarrinhoPercursoDto[]> {
    if (groups.length === 0) return [];
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.carrinho.percurso.select.sql');
      const select = readSqlFileCached(patchSQL);
      const result = await executeSelectWhereAny(pool, select, groups, pagination, orderBy);
      return result.recordset.map((item: Record<string, unknown>) => ExpedicaoCarrinhoPercursoDto.fromObject(item));
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async insert(entity: ExpedicaoCarrinhoPercursoDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.carrinho.percurso.insert.sql');
      const insert = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, insert);
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async update(entity: ExpedicaoCarrinhoPercursoDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.carrinho.percurso.update.sql');
      const update = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, update);
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async delete(entity: ExpedicaoCarrinhoPercursoDto): Promise<void> {
    const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.carrinho.percurso.delete.sql');
    const delet = readSqlFileCached(patchSQL);
    await this.actonEntity(entity, delet);
  }

  private async actonEntity(entity: ExpedicaoCarrinhoPercursoDto, sqlCommand: string): Promise<void> {
    try {
      await this.connect.executeInTransaction(async (request) => {
        await request
        .input('CodEmpresa', sql.Int, entity.CodEmpresa)
        .input('CodCarrinhoPercurso', sql.Int, entity.CodCarrinhoPercurso)
        .input('Origem', sql.VarChar(6), entity.Origem)
        .input('CodOrigem', sql.Int, entity.CodOrigem)
        .input('Situacao', sql.VarChar(30), entity.Situacao)
        .input('DataInicio', sql.Date, entity.DataInicio)
        .input('HoraInicio', sql.VarChar(8), entity.HoraInicio)
        .input('DataFinalizacao', sql.Date, entity.DataFinalizacao)
        .input('HoraFinalizacao', sql.VarChar(8), entity.HoraFinalizacao)
        .query(sqlCommand);

      });
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }
}
