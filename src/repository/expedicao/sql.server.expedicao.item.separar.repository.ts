import path from 'path';
import { readSqlFileCached } from '../../infra/sql.file.cache';

import sql, { ConnectionPool } from 'mssql';
import { Params, Pagination, OrderBy } from '../../contracts/local.base.params';

import ConnectionSqlServerMssql from '../../infra/connection.sql.server.mssql';
import ExpedicaoItemSepararDto from '../../dto/expedicao/expedicao.item.separar.dto';
import LocalBaseRepositoryContract from '../../contracts/local.base.repository.contract';
import ParamsCommonRepository from '../common/params.common';
import { executeSelectWhere } from '../common/consulta.sql.helper';
import { wrapRepositoryError } from '../../utils/repository.error';
import { withNormalizedExpedicaoLineItem } from '../../utils/expedicao.item.sequence';

export default class SqlServerExpedicaoItemSepararRepository
  implements LocalBaseRepositoryContract<ExpedicaoItemSepararDto>
{
  private connect = ConnectionSqlServerMssql.getInstance();
  private basePatchSQL = ParamsCommonRepository.basePatchSQL('expedicao');

  public async select(): Promise<ExpedicaoItemSepararDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.item.separar.select.sql');
      const sql = readSqlFileCached(patchSQL);
      const result = await pool.request().query(sql);

      if (result.recordset.length === 0) return [];
      const entity = result.recordset.map((item: any) => {
        return ExpedicaoItemSepararDto.fromObject(item);
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
  ): Promise<ExpedicaoItemSepararDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.item.separar.select.sql');
      const select = readSqlFileCached(patchSQL);

      const result = await executeSelectWhere(pool, select, params, pagination, orderBy);

      if (result.recordset.length === 0) return [];
      const entitys = result.recordset.map((item: any) => {
        return ExpedicaoItemSepararDto.fromObject(item);
      });

      return entitys;
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    } finally {
    }
  }

  public async insert(entity: ExpedicaoItemSepararDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.item.separar.insert.sql');
      const insert = readSqlFileCached(patchSQL);
      await this.actonEntity(withNormalizedExpedicaoLineItem(entity), insert);
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async insertWithReturn(entity: ExpedicaoItemSepararDto): Promise<ExpedicaoItemSepararDto> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.item.separar.insert.sql');
      const insert = readSqlFileCached(patchSQL);
      const result = await this.actonEntityWithReturn(withNormalizedExpedicaoLineItem(entity), insert);
      return result;
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async update(entity: ExpedicaoItemSepararDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.item.separar.update.sql');
      const update = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, update);
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async delete(entity: ExpedicaoItemSepararDto): Promise<void> {
    const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.item.separar.delete.sql');
    const delet = readSqlFileCached(patchSQL);
    await this.actonEntity(entity, delet);
  }

  private async actonEntity(entity: ExpedicaoItemSepararDto, sqlCommand: string): Promise<void> {
    try {
      await this.connect.executeInTransaction(async (request) => {
        await request
          .input('CodEmpresa', sql.Int, entity.CodEmpresa)
          .input('CodSepararEstoque', sql.Int, entity.CodSepararEstoque)
          .input('Item', sql.VarChar(5), entity.Item)
          .input('CodSetorEstoque', sql.Int, entity.CodSetorEstoque)
          .input('Origem', sql.VarChar(6), entity.Origem)
          .input('CodOrigem', sql.Int, entity.CodOrigem)
          .input('ItemOrigem', sql.VarChar(5), entity.ItemOrigem)
          .input('CodLocalArmazenagem', sql.Int, entity.CodLocalArmazenagem)
          .input('CodProduto', sql.Int, entity.CodProduto)
          .input('CodUnidadeMedida', sql.VarChar(6), entity.CodUnidadeMedida)
          .input('Quantidade', sql.Float, entity.Quantidade)
          .input('QuantidadeInterna', sql.Float, entity.QuantidadeInterna)
          .input('QuantidadeExterna', sql.Float, entity.QuantidadeExterna)
          .input('QuantidadeSeparacao', sql.Float, entity.QuantidadeSeparacao)
          .query(sqlCommand);
      });
    } catch (error: unknown) {
      console.error('Erro em SqlServerExpedicaoItemSepararRepository.actonEntity:', error);
      throw wrapRepositoryError(error);
    }
  }

  private async actonEntityWithReturn(
    entity: ExpedicaoItemSepararDto,
    sqlCommand: string,
  ): Promise<ExpedicaoItemSepararDto> {
    try {
      return await this.connect.executeInTransaction(async (request) => {
        const result = await request
          .input('CodEmpresa', sql.Int, entity.CodEmpresa)
          .input('CodSepararEstoque', sql.Int, entity.CodSepararEstoque)
          .input('Item', sql.VarChar(5), entity.Item)
          .input('CodSetorEstoque', sql.Int, entity.CodSetorEstoque)
          .input('Origem', sql.VarChar(6), entity.Origem)
          .input('CodOrigem', sql.Int, entity.CodOrigem)
          .input('ItemOrigem', sql.VarChar(5), entity.ItemOrigem)
          .input('CodLocalArmazenagem', sql.Int, entity.CodLocalArmazenagem)
          .input('CodProduto', sql.Int, entity.CodProduto)
          .input('CodUnidadeMedida', sql.VarChar(6), entity.CodUnidadeMedida)
          .input('Quantidade', sql.Float, entity.Quantidade)
          .input('QuantidadeInterna', sql.Float, entity.QuantidadeInterna)
          .input('QuantidadeExterna', sql.Float, entity.QuantidadeExterna)
          .input('QuantidadeSeparacao', sql.Float, entity.QuantidadeSeparacao)
          .query(sqlCommand);

        if (result.recordset && result.recordset.length > 0) {
          return ExpedicaoItemSepararDto.fromObject(result.recordset[0]);
        }

        throw new Error('Nenhum registro foi inserido');
      });
    } catch (error: unknown) {
      console.error('Erro em SqlServerExpedicaoItemSepararRepository.actonEntityWithReturn:', error);
      throw wrapRepositoryError(error);
    }
  }
}
