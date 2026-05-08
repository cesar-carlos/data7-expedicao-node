import path from 'path';
import { readSqlFileCached } from '../../infra/sql.file.cache';

import sql, { ConnectionPool } from 'mssql';
import { Params, Pagination, OrderBy } from '../../contracts/local.base.params';

import ConnectionSqlServerMssql from '../../infra/connection.sql.server.mssql';
import ExpedicaoItemConferirDto from '../../dto/expedicao/expedicao.item.conferir.dto';
import LocalBaseRepositoryContract from '../../contracts/local.base.repository.contract';
import ParamsCommonRepository from '../common/params.common';
import { executeSelectWhere } from '../common/consulta.sql.helper';
import { wrapRepositoryError } from '../../utils/repository.error';
import { withNormalizedExpedicaoLineItem } from '../../utils/expedicao.item.sequence';

export default class SqlServerExpedicaoItemConferirRepository
  implements LocalBaseRepositoryContract<ExpedicaoItemConferirDto>
{
  private connect = ConnectionSqlServerMssql.getInstance();
  private basePatchSQL = ParamsCommonRepository.basePatchSQL('expedicao');

  public async select(): Promise<ExpedicaoItemConferirDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.item.conferir.select.sql');
      const sql = readSqlFileCached(patchSQL);
      const result = await pool.request().query(sql);

      if (result.recordset.length === 0) return [];
      const entity = result.recordset.map((item: any) => {
        return ExpedicaoItemConferirDto.fromObject(item);
      });

      return entity;
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    } finally {
      //if (pool) pool.close();
    }
  }

  public async selectWhere(
    params: Params[] = [],
    pagination?: Pagination,
    orderBy?: OrderBy,
  ): Promise<ExpedicaoItemConferirDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.item.conferir.select.sql');
      const select = readSqlFileCached(patchSQL);

      const result = await executeSelectWhere(pool, select, params, pagination, orderBy);

      if (result.recordset.length === 0) return [];
      const entitys = result.recordset.map((item: any) => {
        return ExpedicaoItemConferirDto.fromObject(item);
      });

      return entitys;
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    } finally {
    }
  }

  public async insert(entity: ExpedicaoItemConferirDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.item.conferir.insert.sql');
      const insert = readSqlFileCached(patchSQL);
      await this.actonEntity(withNormalizedExpedicaoLineItem(entity), insert);
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async insertWithReturn(entity: ExpedicaoItemConferirDto): Promise<ExpedicaoItemConferirDto> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.item.conferir.insert.sql');
      const insert = readSqlFileCached(patchSQL);
      const result = await this.actonEntityWithReturn(withNormalizedExpedicaoLineItem(entity), insert);
      return result;
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async update(entity: ExpedicaoItemConferirDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.item.conferir.update.sql');
      const update = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, update);
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async delete(entity: ExpedicaoItemConferirDto): Promise<void> {
    const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.item.conferir.delete.sql');
    const delet = readSqlFileCached(patchSQL);
    await this.actonEntity(entity, delet);
  }

  private async actonEntity(entity: ExpedicaoItemConferirDto, sqlCommand: string): Promise<void> {
    try {
      await this.connect.executeInTransaction(async (request) => {
        await request
          .input('CodEmpresa', sql.Int, entity.CodEmpresa)
          .input('CodConferir', sql.Int, entity.CodConferir)
          .input('Item', sql.VarChar(5), entity.Item)
          .input('CodCarrinhoPercurso', sql.Int, entity.CodCarrinhoPercurso)
          .input('ItemCarrinhoPercurso', sql.VarChar(5), entity.ItemCarrinhoPercurso)
          .input('CodProduto', sql.Int, entity.CodProduto)
          .input('CodUnidadeMedida', sql.VarChar(6), entity.CodUnidadeMedida)
          .input('Quantidade', sql.Float, entity.Quantidade)
          .input('QuantidadeConferida', sql.Float, entity.QuantidadeConferida)
          .query(sqlCommand);
      });
    } catch (error: unknown) {
      console.error('Erro em SqlServerExpedicaoItemConferirRepository.actonEntity:', error);
      throw wrapRepositoryError(error);
    }
  }

  private async actonEntityWithReturn(
    entity: ExpedicaoItemConferirDto,
    sqlCommand: string,
  ): Promise<ExpedicaoItemConferirDto> {
    try {
      return await this.connect.executeInTransaction(async (request) => {
        const result = await request
          .input('CodEmpresa', sql.Int, entity.CodEmpresa)
          .input('CodConferir', sql.Int, entity.CodConferir)
          .input('Item', sql.VarChar(5), entity.Item)
          .input('CodCarrinhoPercurso', sql.Int, entity.CodCarrinhoPercurso)
          .input('ItemCarrinhoPercurso', sql.VarChar(5), entity.ItemCarrinhoPercurso)
          .input('CodProduto', sql.Int, entity.CodProduto)
          .input('CodUnidadeMedida', sql.VarChar(6), entity.CodUnidadeMedida)
          .input('Quantidade', sql.Float, entity.Quantidade)
          .input('QuantidadeConferida', sql.Float, entity.QuantidadeConferida)
          .query(sqlCommand);

        if (result.recordset && result.recordset.length > 0) {
          return ExpedicaoItemConferirDto.fromObject(result.recordset[0]);
        }

        throw new Error('Nenhum registro foi inserido');
      });
    } catch (error: unknown) {
      console.error('Erro em SqlServerExpedicaoItemConferirRepository.actonEntityWithReturn:', error);
      throw wrapRepositoryError(error);
    }
  }
}
