import path from 'path';
import { readSqlFileCached } from '../../infra/sql.file.cache';
import sql, { ConnectionPool } from 'mssql';

import { Params, Pagination, OrderBy } from '../../contracts/local.base.params';

import ConnectionSqlServerMssql from '../../infra/connection.sql.server.mssql';
import ExpedicaoItemConferenciaDto from '../../dto/expedicao/expedicao.item.conferencia.dto';
import LocalBaseRepositoryContract from '../../contracts/local.base.repository.contract';
import ParamsCommonRepository from '../common/params.common';
import { executeSelectWhere } from '../common/consulta.sql.helper';
import { wrapRepositoryError } from '../../utils/repository.error';
import { withNormalizedExpedicaoLineItem } from '../../utils/expedicao.item.sequence';

export default class SqlServerExpedicaoItemConferenciaRepository
  implements LocalBaseRepositoryContract<ExpedicaoItemConferenciaDto>
{
  private connect = ConnectionSqlServerMssql.getInstance();
  private basePatchSQL = ParamsCommonRepository.basePatchSQL('expedicao');

  public async select(): Promise<ExpedicaoItemConferenciaDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.item.conferencia.select.sql');
      const sql = readSqlFileCached(patchSQL);
      const result = await pool.request().query(sql);

      if (result.recordset.length === 0) return [];
      const entity = result.recordset.map((item: any) => {
        return ExpedicaoItemConferenciaDto.fromObject(item);
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
  ): Promise<ExpedicaoItemConferenciaDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.item.conferencia.select.sql');
      const select = readSqlFileCached(patchSQL);

      const result = await executeSelectWhere(pool, select, params, pagination, orderBy);

      if (result.recordset.length === 0) return [];
      const entitys = result.recordset.map((item: any) => {
        return ExpedicaoItemConferenciaDto.fromObject(item);
      });

      return entitys;
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    } finally {
    }
  }

  public async insert(entity: ExpedicaoItemConferenciaDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.item.conferencia.insert.sql');
      const insert = readSqlFileCached(patchSQL);
      await this.actonEntity(withNormalizedExpedicaoLineItem(entity), insert);
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async insertWithReturn(entity: ExpedicaoItemConferenciaDto): Promise<ExpedicaoItemConferenciaDto> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.item.conferencia.insert.sql');
      const insert = readSqlFileCached(patchSQL);
      const result = await this.actonEntityWithReturn(withNormalizedExpedicaoLineItem(entity), insert);
      return result;
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async update(entity: ExpedicaoItemConferenciaDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.item.conferencia.update.sql');
      const update = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, update);
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async delete(entity: ExpedicaoItemConferenciaDto): Promise<void> {
    const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.item.conferencia.delete.sql');
    const delet = readSqlFileCached(patchSQL);
    await this.actonEntity(entity, delet);
  }

  private async actonEntity(entity: ExpedicaoItemConferenciaDto, sqlCommand: string): Promise<void> {
    try {
      await this.connect.executeInTransaction(async (request) => {
        await request
          .input('CodEmpresa', sql.Int, entity.CodEmpresa)
          .input('CodConferir', sql.Int, entity.CodConferir)
          .input('Item', sql.VarChar(5), entity.Item)
          .input('SessionId', sql.VarChar(1000), entity.SessionId)
          .input('Situacao', sql.VarChar(30), entity.Situacao)
          .input('CodCarrinhoPercurso', sql.Int, entity.CodCarrinhoPercurso)
          .input('ItemCarrinhoPercurso', sql.VarChar(5), entity.ItemCarrinhoPercurso)
          .input('CodConferente', sql.Int, entity.CodConferente)
          .input('NomeConferente', sql.VarChar(30), entity.NomeConferente)
          .input('DataConferencia', sql.Date, entity.DataConferencia)
          .input('HoraConferencia', sql.VarChar(8), entity.HoraConferencia)
          .input('CodProduto', sql.Int, entity.CodProduto)
          .input('CodUnidadeMedida', sql.VarChar(6), entity.CodUnidadeMedida)
          .input('Quantidade', sql.Float, entity.Quantidade)
          .query(sqlCommand);
      });
    } catch (error: unknown) {
      console.error('Erro em SqlServerExpedicaoItemConferenciaRepository.actonEntity:', error);
      throw wrapRepositoryError(error);
    }
  }

  private async actonEntityWithReturn(
    entity: ExpedicaoItemConferenciaDto,
    sqlCommand: string,
  ): Promise<ExpedicaoItemConferenciaDto> {
    try {
      return await this.connect.executeInTransaction(async (request) => {
        const result = await request
          .input('CodEmpresa', sql.Int, entity.CodEmpresa)
          .input('CodConferir', sql.Int, entity.CodConferir)
          .input('Item', sql.VarChar(5), entity.Item)
          .input('SessionId', sql.VarChar(1000), entity.SessionId)
          .input('Situacao', sql.VarChar(30), entity.Situacao)
          .input('CodCarrinhoPercurso', sql.Int, entity.CodCarrinhoPercurso)
          .input('ItemCarrinhoPercurso', sql.VarChar(5), entity.ItemCarrinhoPercurso)
          .input('CodConferente', sql.Int, entity.CodConferente)
          .input('NomeConferente', sql.VarChar(30), entity.NomeConferente)
          .input('DataConferencia', sql.Date, entity.DataConferencia)
          .input('HoraConferencia', sql.VarChar(8), entity.HoraConferencia)
          .input('CodProduto', sql.Int, entity.CodProduto)
          .input('CodUnidadeMedida', sql.VarChar(6), entity.CodUnidadeMedida)
          .input('Quantidade', sql.Float, entity.Quantidade)
          .query(sqlCommand);

        if (result.recordset && result.recordset.length > 0) {
          return ExpedicaoItemConferenciaDto.fromObject(result.recordset[0]);
        }

        throw new Error('Nenhum registro foi inserido');
      });
    } catch (error: unknown) {
      console.error('Erro em SqlServerExpedicaoItemConferenciaRepository.actonEntityWithReturn:', error);
      throw wrapRepositoryError(error);
    }
  }
}
