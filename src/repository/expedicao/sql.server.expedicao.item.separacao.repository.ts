import path from 'path';
import { readSqlFileCached } from '../../infra/sql.file.cache';

import sql, { ConnectionPool } from 'mssql';
import { Params, Pagination, OrderBy } from '../../contracts/local.base.params';

import ConnectionSqlServerMssql from '../../infra/connection.sql.server.mssql';
import ExpedicaoItemSeparacaoDto from '../../dto/expedicao/expedicao.item.separacao.dto';
import LocalBaseRepositoryContract from '../../contracts/local.base.repository.contract';
import ParamsCommonRepository from '../common/params.common';
import { executeSelectWhere } from '../common/consulta.sql.helper';
import { wrapRepositoryError } from '../../utils/repository.error';
import { withNormalizedExpedicaoLineItem } from '../../utils/expedicao.item.sequence';

export default class SqlServerExpedicaoItemSeparacaoRepository
  implements LocalBaseRepositoryContract<ExpedicaoItemSeparacaoDto>
{
  private connect = ConnectionSqlServerMssql.getInstance();
  private basePatchSQL = ParamsCommonRepository.basePatchSQL('expedicao');

  public async select(): Promise<ExpedicaoItemSeparacaoDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.item.separacao.select.sql');
      const sql = readSqlFileCached(patchSQL);
      const result = await pool.request().query(sql);

      if (result.recordset.length === 0) return [];
      const entity = result.recordset.map((item: any) => {
        return ExpedicaoItemSeparacaoDto.fromObject(item);
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
  ): Promise<ExpedicaoItemSeparacaoDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.item.separacao.select.sql');
      const select = readSqlFileCached(patchSQL);

      const result = await executeSelectWhere(pool, select, params, pagination, orderBy);

      if (result.recordset.length === 0) return [];
      const entitys = result.recordset.map((item: any) => {
        return ExpedicaoItemSeparacaoDto.fromObject(item);
      });

      return entitys;
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    } finally {
    }
  }

  public async insert(entity: ExpedicaoItemSeparacaoDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.item.separacao.insert.sql');
      const insert = readSqlFileCached(patchSQL);
      await this.actonEntity(withNormalizedExpedicaoLineItem(entity), insert);
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async insertWithReturn(entity: ExpedicaoItemSeparacaoDto): Promise<ExpedicaoItemSeparacaoDto> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.item.separacao.insert.sql');
      const insert = readSqlFileCached(patchSQL);
      const result = await this.actonEntityWithReturn(withNormalizedExpedicaoLineItem(entity), insert);
      return result;
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async update(entity: ExpedicaoItemSeparacaoDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.item.separacao.update.sql');
      const update = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, update);
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async delete(entity: ExpedicaoItemSeparacaoDto): Promise<void> {
    const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.item.separacao.delete.sql');
    const delet = readSqlFileCached(patchSQL);
    await this.actonEntity(entity, delet);
  }

  private async actonEntity(entity: ExpedicaoItemSeparacaoDto, sqlCommand: string): Promise<void> {
    try {
      await this.connect.executeInTransaction(async (request) => {
        await request
          .input('CodEmpresa', sql.Int, entity.CodEmpresa)
          .input('CodSepararEstoque', sql.Int, entity.CodSepararEstoque)
          .input('Item', sql.VarChar(6), entity.Item)
          .input('SessionId', sql.VarChar(1000), entity.SessionId)
          .input('Situacao', sql.VarChar(30), entity.Situacao)
          .input('CodCarrinhoPercurso', sql.Int, entity.CodCarrinhoPercurso)
          .input('ItemCarrinhoPercurso', sql.VarChar(5), entity.ItemCarrinhoPercurso)
          .input('CodSeparador', sql.Int, entity.CodSeparador)
          .input('NomeSeparador', sql.VarChar(100), entity.NomeSeparador)
          .input('DataSeparacao', sql.Date, entity.DataSeparacao)
          .input('HoraSeparacao', sql.VarChar(8), entity.HoraSeparacao)
          .input('CodProduto', sql.Int, entity.CodProduto)
          .input('CodUnidadeMedida', sql.VarChar(6), entity.CodUnidadeMedida)
          .input('Quantidade', sql.Float, entity.Quantidade)
          .query(sqlCommand);
      });
    } catch (error: unknown) {
      console.error('Erro em SqlServerExpedicaoItemSeparacaoRepository.actonEntity:', error);
      throw wrapRepositoryError(error);
    }
  }

  private async actonEntityWithReturn(
    entity: ExpedicaoItemSeparacaoDto,
    sqlCommand: string,
  ): Promise<ExpedicaoItemSeparacaoDto> {
    try {
      return await this.connect.executeInTransaction(async (request) => {
        const result = await request
          .input('CodEmpresa', sql.Int, entity.CodEmpresa)
          .input('CodSepararEstoque', sql.Int, entity.CodSepararEstoque)
          .input('Item', sql.VarChar(6), entity.Item)
          .input('SessionId', sql.VarChar(1000), entity.SessionId)
          .input('Situacao', sql.VarChar(30), entity.Situacao)
          .input('CodCarrinhoPercurso', sql.Int, entity.CodCarrinhoPercurso)
          .input('ItemCarrinhoPercurso', sql.VarChar(5), entity.ItemCarrinhoPercurso)
          .input('CodSeparador', sql.Int, entity.CodSeparador)
          .input('NomeSeparador', sql.VarChar(100), entity.NomeSeparador)
          .input('DataSeparacao', sql.Date, entity.DataSeparacao)
          .input('HoraSeparacao', sql.VarChar(8), entity.HoraSeparacao)
          .input('CodProduto', sql.Int, entity.CodProduto)
          .input('CodUnidadeMedida', sql.VarChar(6), entity.CodUnidadeMedida)
          .input('Quantidade', sql.Float, entity.Quantidade)
          .query(sqlCommand);

        if (result.recordset && result.recordset.length > 0) {
          return ExpedicaoItemSeparacaoDto.fromObject(result.recordset[0]);
        }

        throw new Error('Nenhum registro foi inserido');
      });
    } catch (error: unknown) {
      console.error('Erro em SqlServerExpedicaoItemSeparacaoRepository.actonEntityWithReturn:', error);
      throw wrapRepositoryError(error);
    }
  }
}
