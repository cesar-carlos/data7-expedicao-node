import path from 'path';
import { readSqlFileCached } from '../../infra/sql.file.cache';

import sql, { ConnectionPool } from 'mssql';
import { Params, Pagination, OrderBy } from '../../contracts/local.base.params';

import ConnectionSqlServerMssql from '../../infra/connection.sql.server.mssql';
import LocalBaseRepositoryContract from '../../contracts/local.base.repository.contract';
import ExpedicaoSeparacaoUsuarioSetorDto from '../../dto/expedicao/expedicao.separacao.usuario.setor.dto';
import ParamsCommonRepository from '../common/params.common';
import { executeSelectWhere } from '../common/consulta.sql.helper';
import { wrapRepositoryError } from '../../utils/repository.error';
import { withNormalizedExpedicaoLineItem } from '../../utils/expedicao.item.sequence';

export default class SqlServerExpedicaoSeparacaoUsuarioSetorRepository
  implements LocalBaseRepositoryContract<ExpedicaoSeparacaoUsuarioSetorDto>
{
  private connect = ConnectionSqlServerMssql.getInstance();
  private basePatchSQL = ParamsCommonRepository.basePatchSQL('expedicao');

  public async select(): Promise<ExpedicaoSeparacaoUsuarioSetorDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.separacao.usuario.setor.select.sql');
      const sql = readSqlFileCached(patchSQL);
      const result = await pool.request().query(sql);

      if (result.recordset.length === 0) return [];
      const entity = result.recordset.map((item: any) => {
        return ExpedicaoSeparacaoUsuarioSetorDto.fromObject(item);
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
  ): Promise<ExpedicaoSeparacaoUsuarioSetorDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.separacao.usuario.setor.select.sql');
      const select = readSqlFileCached(patchSQL);

      const result = await executeSelectWhere(pool, select, params, pagination, orderBy);

      if (result.recordset.length === 0) return [];
      const entitys = result.recordset.map((item: any) => {
        return ExpedicaoSeparacaoUsuarioSetorDto.fromObject(item);
      });

      return entitys;
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    } finally {
    }
  }

  public async insert(entity: ExpedicaoSeparacaoUsuarioSetorDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.separacao.usuario.setor.insert.sql');
      const insert = readSqlFileCached(patchSQL);
      await this.actonEntity(withNormalizedExpedicaoLineItem(entity), insert);
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async insertWithReturn(entity: ExpedicaoSeparacaoUsuarioSetorDto): Promise<ExpedicaoSeparacaoUsuarioSetorDto> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.separacao.usuario.setor.insert.sql');
      const insert = readSqlFileCached(patchSQL);
      const result = await this.actonEntityWithReturn(withNormalizedExpedicaoLineItem(entity), insert);
      return result;
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async update(entity: ExpedicaoSeparacaoUsuarioSetorDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.separacao.usuario.setor.update.sql');
      const update = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, update);
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async delete(entity: ExpedicaoSeparacaoUsuarioSetorDto): Promise<void> {
    const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.separacao.usuario.setor.delete.sql');
    const delet = readSqlFileCached(patchSQL);
    await this.actonEntity(entity, delet);
  }

  private async actonEntity(entity: ExpedicaoSeparacaoUsuarioSetorDto, sqlCommand: string): Promise<void> {
    try {
      await this.connect.executeInTransaction(async (request) => {
        await request
          .input('CodEmpresa', sql.Int, entity.CodEmpresa)
          .input('CodSepararEstoque', sql.Int, entity.CodSepararEstoque)
          .input('Item', sql.VarChar(5), entity.Item)
          .input('CodSetorEstoque', sql.Int, entity.CodSetorEstoque)
          .input('DataLancamento', sql.Date, entity.DataLancamento)
          .input('HoraLancamento', sql.VarChar(8), entity.HoraLancamento)
          .input('CodUsuario', sql.Int, entity.CodUsuario)
          .input('NomeUsuario', sql.VarChar(30), entity.NomeUsuario)
          .input('EstacaoSeparacao', sql.VarChar(30), entity.EstacaoSeparacao)
          .query(sqlCommand);
      });
    } catch (error: unknown) {
      console.error('Erro em SqlServerExpedicaoSeparacaoUsuarioSetorRepository.actonEntity:', error);
      throw wrapRepositoryError(error);
    }
  }

  private async actonEntityWithReturn(
    entity: ExpedicaoSeparacaoUsuarioSetorDto,
    sqlCommand: string,
  ): Promise<ExpedicaoSeparacaoUsuarioSetorDto> {
    try {
      return await this.connect.executeInTransaction(async (request) => {
        const result = await request
          .input('CodEmpresa', sql.Int, entity.CodEmpresa)
          .input('CodSepararEstoque', sql.Int, entity.CodSepararEstoque)
          .input('Item', sql.VarChar(5), entity.Item)
          .input('CodSetorEstoque', sql.Int, entity.CodSetorEstoque)
          .input('DataLancamento', sql.Date, entity.DataLancamento)
          .input('HoraLancamento', sql.VarChar(8), entity.HoraLancamento)
          .input('CodUsuario', sql.Int, entity.CodUsuario)
          .input('NomeUsuario', sql.VarChar(30), entity.NomeUsuario)
          .input('EstacaoSeparacao', sql.VarChar(30), entity.EstacaoSeparacao)
          .query(sqlCommand);

        if (result.recordset && result.recordset.length > 0) {
          return ExpedicaoSeparacaoUsuarioSetorDto.fromObject(result.recordset[0]);
        }

        throw new Error('Nenhum registro foi inserido');
      });
    } catch (error: unknown) {
      console.error('Erro em SqlServerExpedicaoSeparacaoUsuarioSetorRepository.actonEntityWithReturn:', error);
      throw wrapRepositoryError(error);
    }
  }
}
