import path from 'path';
import { readSqlFileCached } from '../../infra/sql.file.cache';

import sql, { ConnectionPool } from 'mssql';
import { Params, Pagination, OrderBy } from '../../contracts/local.base.params';

import ConnectionSqlServerMssql from '../../infra/connection.sql.server.mssql';
import LocalBaseRepositoryContract from '../../contracts/local.base.repository.contract';
import ExpedicaoCarrinhoPercursoEstagioDto from '../../dto/expedicao/expedicao.carrinho.percurso.estagio.dto';
import ParamsCommonRepository from '../common/params.common';
import { executeSelectWhere } from '../common/consulta.sql.helper';
import { wrapRepositoryError } from '../../utils/repository.error';

export default class SqlServerExpedicaoCarrinhoPercursoEstagioRepository
  implements LocalBaseRepositoryContract<ExpedicaoCarrinhoPercursoEstagioDto>
{
  private connect = ConnectionSqlServerMssql.getInstance();
  private basePatchSQL = ParamsCommonRepository.basePatchSQL('expedicao');

  public async select(): Promise<ExpedicaoCarrinhoPercursoEstagioDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.carrinho.percurso.estagio.select.sql');
      const sql = readSqlFileCached(patchSQL);
      const result = await pool.request().query(sql);

      if (result.recordset.length === 0) return [];
      const entity = result.recordset.map((item: any) => {
        return ExpedicaoCarrinhoPercursoEstagioDto.fromObject(item);
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
  ): Promise<ExpedicaoCarrinhoPercursoEstagioDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.carrinho.percurso.estagio.select.sql');
      const select = readSqlFileCached(patchSQL);

      const result = await executeSelectWhere(pool, select, params, pagination, orderBy);

      if (result.recordset.length === 0) return [];
      const entitys = result.recordset.map((item: any) => {
        return ExpedicaoCarrinhoPercursoEstagioDto.fromObject(item);
      });

      return entitys;
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    } finally {
    }
  }

  public async insert(entity: ExpedicaoCarrinhoPercursoEstagioDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.carrinho.percurso.estagio.insert.sql');
      const insert = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, insert);
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async insertWithReturn(
    entity: ExpedicaoCarrinhoPercursoEstagioDto,
  ): Promise<ExpedicaoCarrinhoPercursoEstagioDto> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.carrinho.percurso.estagio.insert.sql');
      const insert = readSqlFileCached(patchSQL);
      const result = await this.actonEntityWithReturn(entity, insert);
      return result;
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async update(entity: ExpedicaoCarrinhoPercursoEstagioDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.carrinho.percurso.estagio.update.sql');
      const update = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, update);
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async delete(entity: ExpedicaoCarrinhoPercursoEstagioDto): Promise<void> {
    const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.carrinho.percurso.estagio.delete.sql');
    const delet = readSqlFileCached(patchSQL);
    await this.actonEntity(entity, delet);
  }

  private async actonEntity(entity: ExpedicaoCarrinhoPercursoEstagioDto, sqlCommand: string): Promise<void> {
    try {
      await this.connect.executeInTransaction(async (request) => {
        await request
          .input('CodEmpresa', sql.Int, entity.CodEmpresa)
          .input('CodCarrinhoPercurso', sql.Int, entity.CodCarrinhoPercurso)
          .input('Item', sql.VarChar(5), entity.Item)
          .input('Origem', sql.VarChar(6), entity.Origem)
          .input('CodOrigem', sql.Int, entity.CodOrigem)
          .input('CodPercursoEstagio', sql.Int, entity.CodPercursoEstagio)
          .input('CodCarrinho', sql.Int, entity.CodCarrinho)
          .input('Situacao', sql.VarChar(30), entity.Situacao)
          .input('DataInicio', sql.Date, entity.DataInicio)
          .input('HoraInicio', sql.VarChar(8), entity.HoraInicio)
          .input('CodUsuarioInicio', sql.Int, entity.CodUsuarioInicio)
          .input('NomeUsuarioInicio', sql.VarChar(20), entity.NomeUsuarioInicio)
          .input('DataFinalizacao', sql.Date, entity.DataFinalizacao)
          .input('HoraFinalizacao', sql.VarChar(8), entity.HoraFinalizacao)
          .input('CodUsuarioFinalizacao', sql.Int, entity.CodUsuarioFinalizacao)
          .input('NomeUsuarioFinalizacao', sql.VarChar(20), entity.NomeUsuarioFinalizacao)
          .query(sqlCommand);
      });
    } catch (error: unknown) {
      console.error('Erro em SqlServerExpedicaoCarrinhoPercursoEstagioRepository.actonEntity:', error);
      throw wrapRepositoryError(error);
    }
  }

  private async actonEntityWithReturn(
    entity: ExpedicaoCarrinhoPercursoEstagioDto,
    sqlCommand: string,
  ): Promise<ExpedicaoCarrinhoPercursoEstagioDto> {
    try {
      return await this.connect.executeInTransaction(async (request) => {
        const result = await request
          .input('CodEmpresa', sql.Int, entity.CodEmpresa)
          .input('CodCarrinhoPercurso', sql.Int, entity.CodCarrinhoPercurso)
          .input('Item', sql.VarChar(5), entity.Item)
          .input('Origem', sql.VarChar(6), entity.Origem)
          .input('CodOrigem', sql.Int, entity.CodOrigem)
          .input('CodPercursoEstagio', sql.Int, entity.CodPercursoEstagio)
          .input('CodCarrinho', sql.Int, entity.CodCarrinho)
          .input('Situacao', sql.VarChar(30), entity.Situacao)
          .input('DataInicio', sql.Date, entity.DataInicio)
          .input('HoraInicio', sql.VarChar(8), entity.HoraInicio)
          .input('CodUsuarioInicio', sql.Int, entity.CodUsuarioInicio)
          .input('NomeUsuarioInicio', sql.VarChar(20), entity.NomeUsuarioInicio)
          .input('DataFinalizacao', sql.Date, entity.DataFinalizacao)
          .input('HoraFinalizacao', sql.VarChar(8), entity.HoraFinalizacao)
          .input('CodUsuarioFinalizacao', sql.Int, entity.CodUsuarioFinalizacao)
          .input('NomeUsuarioFinalizacao', sql.VarChar(20), entity.NomeUsuarioFinalizacao)
          .query(sqlCommand);

        if (result.recordset && result.recordset.length > 0) {
          return ExpedicaoCarrinhoPercursoEstagioDto.fromObject(result.recordset[0]);
        }

        throw new Error('Nenhum registro foi inserido');
      });
    } catch (error: unknown) {
      console.error(
        'Erro em SqlServerExpedicaoCarrinhoPercursoEstagioRepository.actonEntityWithReturn:',
        error,
      );
      throw wrapRepositoryError(error);
    }
  }
}
