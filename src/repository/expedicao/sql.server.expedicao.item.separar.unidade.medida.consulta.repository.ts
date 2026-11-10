import path from 'path';
import { readSqlFileCached } from '../../infra/sql.file.cache';

import { ConnectionPool } from 'mssql';
import { Params, Pagination, OrderBy } from '../../contracts/local.base.params';

import ConnectionSqlServerMssql from '../../infra/connection.sql.server.mssql';
import LocalBaseConsultaRepositoryContract from '../../contracts/local.base.consulta.repository.contract';
import ExpedicaoItemSepararUnidadeMedidaConsultaDto from '../../dto/expedicao/expedicao.item.separar.unidade.medida.consulta.dto';
import ParamsCommonRepository from '../common/params.common';
import { KEEP_EVERY_UNIT_ROW, executeSelectWhere, executeSelectWhereAny } from '../common/consulta.sql.helper';
import { wrapRepositoryError } from '../../utils/repository.error';

export default class SqlServerExpedicaoItemSepararUnidadeMedidaConsultaRepository
  implements LocalBaseConsultaRepositoryContract<ExpedicaoItemSepararUnidadeMedidaConsultaDto>
{
  private connect = ConnectionSqlServerMssql.getInstance();
  private basePatchSQL = ParamsCommonRepository.basePatchSQL('expedicao');

  public async select(page: Pagination): Promise<ExpedicaoItemSepararUnidadeMedidaConsultaDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.item.separar.unidade.medida.consulta.sql');
      const sqlText = readSqlFileCached(patchSQL);
      const result = await pool.request().query(sqlText);

      if (result.recordset.length === 0) return [];
      const entity = result.recordset.map((item: any) => {
        return ExpedicaoItemSepararUnidadeMedidaConsultaDto.fromObject(item);
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
  ): Promise<ExpedicaoItemSepararUnidadeMedidaConsultaDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.item.separar.unidade.medida.consulta.sql');
      const select = readSqlFileCached(patchSQL);

      const result = await executeSelectWhere(
        pool,
        select,
        params,
        pagination,
        orderBy,
        undefined,
        undefined,
        KEEP_EVERY_UNIT_ROW,
      );

      if (result.recordset.length === 0) return [];
      const entitys = result.recordset.map((item: any) => {
        return ExpedicaoItemSepararUnidadeMedidaConsultaDto.fromObject(item);
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
  ): Promise<ExpedicaoItemSepararUnidadeMedidaConsultaDto[]> {
    if (groups.length === 0) return [];
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.item.separar.unidade.medida.consulta.sql');
      const select = readSqlFileCached(patchSQL);
      const result = await executeSelectWhereAny(pool, select, groups, pagination, orderBy, KEEP_EVERY_UNIT_ROW);
      return result.recordset.map((item: Record<string, unknown>) =>
        ExpedicaoItemSepararUnidadeMedidaConsultaDto.fromObject(item),
      );
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }
}
