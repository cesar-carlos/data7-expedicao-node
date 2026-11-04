import { ConnectionPool } from 'mssql';
import { Param, Params, Pagination, OrderBy } from '../../contracts/local.base.params';

import ConnectionSqlServerMssql from '../../infra/connection.sql.server.mssql';
import LocalBaseConsultaRepositoryContract from '../../contracts/local.base.consulta.repository.contract';
import ExpedicaoSeparacaoUsuarioSetorConsultaDto from '../../dto/expedicao/expedicao.separacao.usuario.setor.consulta.dto';
import { executeSelectWhere } from '../common/consulta.sql.helper';
import {
  buildSeparacaoUsuarioSetorConsultaQuery,
  separacaoUsuarioSetorConsultaSql,
} from './separacao.usuario.setor.consulta.query';
import { wrapRepositoryError } from '../../utils/repository.error';

export default class SqlServerExpedicaoSeparacaoUsuarioSetorConsultaRepository
  implements LocalBaseConsultaRepositoryContract<ExpedicaoSeparacaoUsuarioSetorConsultaDto>
{
  private connect = ConnectionSqlServerMssql.getInstance();

  public async select(pagination: Pagination): Promise<ExpedicaoSeparacaoUsuarioSetorConsultaDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const sqlText = separacaoUsuarioSetorConsultaSql();
      const sqlWithPagination = `${sqlText} ORDER BY (SELECT NULL) OFFSET ${pagination?.offset} ROWS FETCH NEXT ${pagination?.limit} ROWS ONLY`;
      const result = await pool.request().query(sqlWithPagination);

      if (result.recordset.length === 0) return [];
      const entity = result.recordset.map((item: any) => {
        return ExpedicaoSeparacaoUsuarioSetorConsultaDto.fromObject(item);
      });

      return entity;
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async selectWhere(
    params: Params[] = [],
    pagination?: Pagination,
    orderBy?: OrderBy,
  ): Promise<ExpedicaoSeparacaoUsuarioSetorConsultaDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const query = buildSeparacaoUsuarioSetorConsultaQuery(params as Param[]);
      const result = await executeSelectWhere(
        pool,
        query.sql,
        query.outerParams as Params[],
        pagination,
        orderBy,
        undefined,
        query.apply,
      );

      if (result.recordset.length === 0) return [];
      const entitys = result.recordset.map((item: any) => {
        return ExpedicaoSeparacaoUsuarioSetorConsultaDto.fromObject(item);
      });

      return entitys;
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }
}
