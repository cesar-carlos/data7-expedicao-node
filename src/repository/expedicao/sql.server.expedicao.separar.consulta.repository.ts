import path from 'path';

import { readSqlFileCached } from '../../infra/sql.file.cache';
import { ConnectionPool } from 'mssql';
import { Params, Pagination, OrderBy } from '../../contracts/local.base.params';

import ConnectionSqlServerMssql from '../../infra/connection.sql.server.mssql';
import LocalBaseConsultaRepositoryContract from '../../contracts/local.base.consulta.repository.contract';
import ExpedicaoSepararConsultaDto from '../../dto/expedicao/expedicao.separar.consulta.dto';
import ParamsCommonRepository from '../common/params.common';
import { executeSelectPaged, executeSelectWhere } from '../common/consulta.sql.helper';
import { wrapRepositoryError } from '../../utils/repository.error';

export default class SqlServerExpedicaoSepararConsultaRepository
  implements LocalBaseConsultaRepositoryContract<ExpedicaoSepararConsultaDto>
{
  private connect = ConnectionSqlServerMssql.getInstance();
  private basePatchSQL = ParamsCommonRepository.basePatchSQL('expedicao');

  private getSelectSql(): string {
    const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.separar.consulta.sql');
    return readSqlFileCached(patchSQL);
  }

  public async select(pagination: Pagination): Promise<ExpedicaoSepararConsultaDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const result = await executeSelectPaged(pool, this.getSelectSql(), pagination);

      if (result.recordset.length === 0) return [];
      return result.recordset.map((item: any) => ExpedicaoSepararConsultaDto.fromObject(item));
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async selectWhere(
    params: Params[] | string = [],
    pagination?: Pagination,
    orderBy?: OrderBy,
  ): Promise<ExpedicaoSepararConsultaDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const select = this.getSelectSql();

      let result;
      if (typeof params === 'string') {
        const _params = this.buildParamsFromString(params);
        const paramOrderBy =
          orderBy && orderBy.isValid() ? `ORDER BY ${orderBy.getFullOrderBy()}` : 'ORDER BY (SELECT NULL)';
        const sql = _params ? `${select} WHERE ${_params}` : select;
        const sqlWithPagination = `${sql} ${paramOrderBy} OFFSET ${pagination?.offset} ROWS FETCH NEXT ${pagination?.limit} ROWS ONLY`;
        const sqlWithoutPagination = `${sql} ${paramOrderBy}`;
        result = await pool.request().query(pagination ? sqlWithPagination : sqlWithoutPagination);
      } else {
        result = await executeSelectWhere(pool, select, params, pagination, orderBy, true);
      }

      if (result.recordset.length === 0) return [];
      return result.recordset.map((item: any) => ExpedicaoSepararConsultaDto.fromObject(item));
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  private buildParamsFromString(paramsString: string): string {
    if (!paramsString || paramsString.trim() === '') return '';
    const codSetorEstoqueRegex = /CodSetorEstoque\s*=\s*'?(\d+)'?/g;

    let result = paramsString;
    const matches = paramsString.match(codSetorEstoqueRegex);

    if (matches) {
      matches.forEach((match) => {
        const valueMatch = match.match(/CodSetorEstoque\s*=\s*'?(\d+)'?/);
        if (valueMatch) {
          const value = valueMatch[1];
          const existsClause = `EXISTS(
          SELECT *
          FROM Expedicao.ItemSepararEstoque ise
          WHERE ise.CodEmpresa = SepararConsulta.CodEmpresa
            AND ise.CodSepararEstoque = SepararConsulta.CodSepararEstoque
            AND ise.CodSetorEstoque = '${value}'
        )`;

          result = result.replace(match, existsClause);
        }
      });
    }

    return result;
  }
}
