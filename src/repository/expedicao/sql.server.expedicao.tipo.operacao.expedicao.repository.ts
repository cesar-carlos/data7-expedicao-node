import path from 'path';
import { readSqlFileCached } from '../../infra/sql.file.cache';

import sql, { ConnectionPool } from 'mssql';
import { Params, Pagination, OrderBy } from '../../contracts/local.base.params';

import ConnectionSqlServerMssql from '../../infra/connection.sql.server.mssql';
import LocalBaseRepositoryContract from '../../contracts/local.base.repository.contract';
import ExpedicaoTipoOperacaoExpedicaoDto from '../../dto/expedicao/expedicao.tipo.operacao.expedicao.dto';
import ParamsCommonRepository from '../common/params.common';
import { executeSelectWhere } from '../common/consulta.sql.helper';
import { wrapRepositoryError } from '../../utils/repository.error';

export default class SqlServerExpedicaoTipoOperacaoExpedicaoRepository
  implements LocalBaseRepositoryContract<ExpedicaoTipoOperacaoExpedicaoDto>
{
  private connect = ConnectionSqlServerMssql.getInstance();
  private basePatchSQL = ParamsCommonRepository.basePatchSQL('expedicao');

  public async select(): Promise<ExpedicaoTipoOperacaoExpedicaoDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.tipo.operacao.expedicao.select.sql');
      const sql = readSqlFileCached(patchSQL);

      const result = await pool.request().query(sql);

      if (result.recordset.length === 0) return [];
      const entity = result.recordset.map((item: any) => {
        return ExpedicaoTipoOperacaoExpedicaoDto.fromObject(item);
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
  ): Promise<ExpedicaoTipoOperacaoExpedicaoDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.tipo.operacao.expedicao.select.sql');
      const select = readSqlFileCached(patchSQL);

      const result = await executeSelectWhere(pool, select, params, pagination, orderBy);

      if (result.recordset.length === 0) return [];
      const entitys = result.recordset.map((item: any) => {
        return ExpedicaoTipoOperacaoExpedicaoDto.fromObject(item);
      });

      return entitys;
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    } finally {
    }
  }

  public async insert(entity: ExpedicaoTipoOperacaoExpedicaoDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.tipo.operacao.expedicao.insert.sql');
      const insert = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, insert);
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async update(entity: ExpedicaoTipoOperacaoExpedicaoDto): Promise<void> {
    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.tipo.operacao.expedicao.update.sql');
      const update = readSqlFileCached(patchSQL);
      await this.actonEntity(entity, update);
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async delete(entity: ExpedicaoTipoOperacaoExpedicaoDto): Promise<void> {
    const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.tipo.operacao.expedicao.delete.sql');
    const delet = readSqlFileCached(patchSQL);
    await this.actonEntity(entity, delet);
  }

  private async actonEntity(entity: ExpedicaoTipoOperacaoExpedicaoDto, sqlCommand: string): Promise<void> {
    try {
      await this.connect.executeInTransaction(async (request) => {
        await request
        .input('CodEmpresa', sql.Int, entity.CodEmpresa)
        .input('CodTipoOperacaoExpedicao', sql.Int, entity.CodTipoOperacaoExpedicao)
        .input('Descricao', sql.VarChar(100), entity.Descricao)
        .input('Ativo', sql.VarChar(1), entity.Ativo)
        .input('Tipo', sql.VarChar(20), entity.Tipo)
        .input('CodSetorConferencia', sql.Int, entity.CodSetorConferencia)
        .input('CodPrioridade', sql.Int, entity.CodPrioridade)
        .input('CodRelatorio', sql.Int, entity.CodRelatorio)
        .input('CodLocalArmazenagem', sql.Int, entity.CodLocalArmazenagem)
        .input('MovimentaEstoque', sql.VarChar(1), entity.MovimentaEstoque)
        .input('CodTipoMovimentoEstoque', sql.Int, entity.CodTipoMovimentoEstoque)
        .input('FazerConferencia', sql.VarChar(1), entity.FazerConferencia)
        .input('FazerArmazenamento', sql.VarChar(1), entity.FazerArmazenamento)
        .input('ControlaLote', sql.VarChar(1), entity.ControlaLote)
        .input('ControlaNumeroSerie', sql.VarChar(1), entity.ControlaNumeroSerie)
        .query(sqlCommand);

      });
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    } finally {
    }
  }
}
