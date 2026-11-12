import path from 'path';
import { readSqlFileCached } from '../../infra/sql.file.cache';

import sql, { ConnectionPool } from 'mssql';
import { Params, Pagination, OrderBy, type Param } from '../../contracts/local.base.params';
import ExpedicaoItemSituacaoModel from '../../model/expedicao.item.situacao.model';

import ConnectionSqlServerMssql from '../../infra/connection.sql.server.mssql';
import LocalBaseConsultaRepositoryContract from '../../contracts/local.base.consulta.repository.contract';
import ExpedicaoItemConferenciaConsultaDto from '../../dto/expedicao/expedicao.item.conferencia.consulta.dto';
import ParamsCommonRepository from '../common/params.common';
import { executeSelectPaged, executeSelectWhere, executeSelectWhereAny } from '../common/consulta.sql.helper';
import { wrapRepositoryError } from '../../utils/repository.error';
import {
  SQL_PARAM_BUDGET,
  chunkGroupsByBindBudget,
  expandGroupsForInBudget,
} from '../common/sql.param.budget';

export type ConferenciaQuantidadeTotal = {
  CodEmpresa: number;
  CodConferir: number;
  CodCarrinho: number;
  CodProduto: number;
  Total: number;
};

export default class SqlServerExpedicaoItemConferenciaConsultaRepository
  implements LocalBaseConsultaRepositoryContract<ExpedicaoItemConferenciaConsultaDto>
{
  private connect = ConnectionSqlServerMssql.getInstance();
  private basePatchSQL = ParamsCommonRepository.basePatchSQL('expedicao');

  public async select(page: Pagination): Promise<ExpedicaoItemConferenciaConsultaDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.item.conferencia.consulta.sql');
      const sqlText = readSqlFileCached(patchSQL);
      const result = await executeSelectPaged(pool, sqlText, page ?? Pagination.create());

      if (result.recordset.length === 0) return [];
      const entity = result.recordset.map((item: any) => {
        return ExpedicaoItemConferenciaConsultaDto.fromObject(item);
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
  ): Promise<ExpedicaoItemConferenciaConsultaDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.item.conferencia.consulta.sql');
      const select = readSqlFileCached(patchSQL);

      const result = await executeSelectWhere(pool, select, params, pagination, orderBy);

      if (result.recordset.length === 0) return [];
      const entitys = result.recordset.map((item: any) => {
        return ExpedicaoItemConferenciaConsultaDto.fromObject(item);
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
  ): Promise<ExpedicaoItemConferenciaConsultaDto[]> {
    if (groups.length === 0) return [];
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.item.conferencia.consulta.sql');
      const select = readSqlFileCached(patchSQL);
      const result = await executeSelectWhereAny(pool, select, groups, pagination, orderBy);
      return result.recordset.map((item: Record<string, unknown>) =>
        ExpedicaoItemConferenciaConsultaDto.fromObject(item),
      );
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async sumQuantidadeAtiva(groups: Params[][]): Promise<ConferenciaQuantidadeTotal[]> {
    if (groups.length === 0) return [];
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const expanded = expandGroupsForInBudget(groups as Param[][]);
      const chunks = chunkGroupsByBindBudget(expanded, SQL_PARAM_BUDGET - 1);
      const totals: ConferenciaQuantidadeTotal[] = [];
      for (const chunk of chunks.length > 0 ? chunks : [expanded]) {
        totals.push(...(await this.querySumQuantidadeAtiva(pool, chunk)));
      }
      return totals;
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  private async querySumQuantidadeAtiva(
    pool: ConnectionPool,
    groups: Param[][],
  ): Promise<ConferenciaQuantidadeTotal[]> {
    const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.item.conferencia.consulta.sql');
    const view = readSqlFileCached(patchSQL);
    const where = ParamsCommonRepository.buildWhereAnyOf(groups);
    const request = pool.request();
    where.apply(request);
    request.input('qty_cancelado', sql.VarChar(30), ExpedicaoItemSituacaoModel.cancelado);
    const result = await request.query(`SELECT CodEmpresa,
          CodConferir,
          CodCarrinho,
          CodProduto,
          ISNULL(SUM(CASE WHEN ISNULL(Situacao, '') <> @qty_cancelado THEN Quantidade ELSE 0 END), 0) AS Total
        FROM (
          ${view}
        ) qty_src
        WHERE ${where.whereFragment}
        GROUP BY CodEmpresa, CodConferir, CodCarrinho, CodProduto`);
    return result.recordset.map((row: Record<string, unknown>) => ({
      CodEmpresa: Number(row.CodEmpresa),
      CodConferir: Number(row.CodConferir),
      CodCarrinho: Number(row.CodCarrinho),
      CodProduto: Number(row.CodProduto),
      Total: Number(row.Total ?? 0),
    }));
  }
}
