import path from 'path';
import { readSqlFileCached } from '../../infra/sql.file.cache';

import sql, { ConnectionPool } from 'mssql';
import { Params, Pagination, OrderBy } from '../../contracts/local.base.params';

import ConnectionSqlServerMssql from '../../infra/connection.sql.server.mssql';
import LocalBaseRepositoryContract from '../../contracts/local.base.repository.contract';
import ExpedicaoCarrinhoPercursoAgrupamento from '../../dto/expedicao/expedicao.carrinho.percurso.agrupamento';
import ParamsCommonRepository from '../common/params.common';
import { executeSelectWhere } from '../common/consulta.sql.helper';
import { wrapRepositoryError } from '../../utils/repository.error';
import { withNormalizedExpedicaoLineItem } from '../../utils/expedicao.item.sequence';

export default class SqlServerExpedicaoCarrinhoPercursoAgrupamentoRepository
  implements LocalBaseRepositoryContract<ExpedicaoCarrinhoPercursoAgrupamento>
{
  private connect = ConnectionSqlServerMssql.getInstance();
  private basePatchSQL = ParamsCommonRepository.basePatchSQL('expedicao');

  public async select(): Promise<ExpedicaoCarrinhoPercursoAgrupamento[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.carrinho.percurso.agrupamento.select.sql');
      const sql = readSqlFileCached(patchSQL);
      const result = await pool.request().query(sql);

      if (result.recordset.length === 0) return [];
      const entity = result.recordset.map((item: any) => {
        return ExpedicaoCarrinhoPercursoAgrupamento.fromObject(item);
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
  ): Promise<ExpedicaoCarrinhoPercursoAgrupamento[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.carrinho.percurso.agrupamento.select.sql');
      const select = readSqlFileCached(patchSQL);

      const result = await executeSelectWhere(pool, select, params, pagination, orderBy);

      if (result.recordset.length === 0) return [];
      const entitys = result.recordset.map((item: any) => {
        return ExpedicaoCarrinhoPercursoAgrupamento.fromObject(item);
      });

      return entitys;
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    } finally {
    }
  }

  public async insert(entity: ExpedicaoCarrinhoPercursoAgrupamento): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.carrinho.percurso.agrupamento.insert.sql');
      const insert = readSqlFileCached(patchSQL);
      await this.actonEntity(withNormalizedExpedicaoLineItem(entity), insert);
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async insertWithReturn(
    entity: ExpedicaoCarrinhoPercursoAgrupamento,
  ): Promise<ExpedicaoCarrinhoPercursoAgrupamento> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.carrinho.percurso.agrupamento.insert.sql');
      const insert = readSqlFileCached(patchSQL);
      const result = await this.actonEntityWithReturn(withNormalizedExpedicaoLineItem(entity), insert);
      return result;
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async update(entity: ExpedicaoCarrinhoPercursoAgrupamento): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.carrinho.percurso.agrupamento.update.sql');
      const update = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, update);
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async delete(entity: ExpedicaoCarrinhoPercursoAgrupamento): Promise<void> {
    const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.carrinho.percurso.agrupamento.delete.sql');
    const delet = readSqlFileCached(patchSQL);
    await this.actonEntity(entity, delet);
  }

  private async actonEntity(entity: ExpedicaoCarrinhoPercursoAgrupamento, sqlCommand: string): Promise<void> {
    try {
      await this.connect.executeInTransaction(async (request) => {
        await request
          .input('CodEmpresa', sql.Int, entity.CodEmpresa)
          .input('CodCarrinhoPercurso', sql.Int, entity.CodCarrinhoPercurso)
          .input('Item', sql.VarChar(5), entity.Item)
          .input('Origem', sql.VarChar(6), entity.Origem)
          .input('ItemCarrinhoPercurso', sql.VarChar(5), entity.ItemCarrinhoPercurso)
          .input('Situacao', sql.VarChar(30), entity.Situacao)
          .input('CodCarrinhoAgrupador', sql.Int, entity.CodCarrinhoAgrupador)
          .input('DataLancamento', sql.Date, entity.DataLancamento)
          .input('HoraLancamento', sql.VarChar(8), entity.HoraLancamento)
          .input('CodUsuarioLancamento', sql.Int, entity.CodUsuarioLancamento)
          .input('NomeUsuarioLancamento', sql.VarChar(100), entity.NomeUsuarioLancamento)
          .query(sqlCommand);
      });
    } catch (error: unknown) {
      console.error('Erro em SqlServerExpedicaoCarrinhoPercursoAgrupamentoRepository.actonEntity:', error);
      throw wrapRepositoryError(error);
    }
  }

  private async actonEntityWithReturn(
    entity: ExpedicaoCarrinhoPercursoAgrupamento,
    sqlCommand: string,
  ): Promise<ExpedicaoCarrinhoPercursoAgrupamento> {
    try {
      return await this.connect.executeInTransaction(async (request) => {
        const result = await request
          .input('CodEmpresa', sql.Int, entity.CodEmpresa)
          .input('CodCarrinhoPercurso', sql.Int, entity.CodCarrinhoPercurso)
          .input('Item', sql.VarChar(5), entity.Item)
          .input('Origem', sql.VarChar(6), entity.Origem)
          .input('ItemCarrinhoPercurso', sql.VarChar(5), entity.ItemCarrinhoPercurso)
          .input('Situacao', sql.VarChar(30), entity.Situacao)
          .input('CodCarrinhoAgrupador', sql.Int, entity.CodCarrinhoAgrupador)
          .input('DataLancamento', sql.Date, entity.DataLancamento)
          .input('HoraLancamento', sql.VarChar(8), entity.HoraLancamento)
          .input('CodUsuarioLancamento', sql.Int, entity.CodUsuarioLancamento)
          .input('NomeUsuarioLancamento', sql.VarChar(100), entity.NomeUsuarioLancamento)
          .query(sqlCommand);

        if (result.recordset && result.recordset.length > 0) {
          return ExpedicaoCarrinhoPercursoAgrupamento.fromObject(result.recordset[0]);
        }

        throw new Error('Nenhum registro foi inserido');
      });
    } catch (error: unknown) {
      console.error(
        'Erro em SqlServerExpedicaoCarrinhoPercursoAgrupamentoRepository.actonEntityWithReturn:',
        error,
      );
      throw wrapRepositoryError(error);
    }
  }
}
