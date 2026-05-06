import fs from 'fs';
import path from 'path';

import { ConnectionPool } from 'mssql';
import { Params, Param, Pagination, OrderBy } from '../../contracts/local.base.params';

import ConnectionSqlServerMssql from '../../infra/connection.sql.server.mssql';
import LocalBaseConsultaRepositoryContract from '../../contracts/local.base.consulta.repository.contract';
import ExpedicaoSepararConsultaDto from '../../dto/expedicao/expedicao.separar.consulta.dto';
import ParamsCommonRepository from '../common/params.common';

export default class SqlServerExpedicaoSepararConsultaRepository
  implements LocalBaseConsultaRepositoryContract<ExpedicaoSepararConsultaDto>
{
  private connect = ConnectionSqlServerMssql.getInstance();
  private basePatchSQL = ParamsCommonRepository.basePatchSQL('expedicao');
  private cachedSelectSql: string | null = null;

  private getSelectSql(): string {
    if (this.cachedSelectSql === null) {
      const patchSQL = path.resolve(this.basePatchSQL, 'expedicao.separar.consulta.sql');
      this.cachedSelectSql = fs.readFileSync(patchSQL).toString();
    }
    return this.cachedSelectSql;
  }

  public async select(pagination: Pagination): Promise<ExpedicaoSepararConsultaDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const sql = this.getSelectSql();
      const sqlWithPagination = `${sql} ORDER BY (SELECT NULL) OFFSET ${pagination?.offset} ROWS FETCH NEXT ${pagination?.limit} ROWS ONLY`;
      const result = await pool.request().query(sqlWithPagination);

      if (result.recordset.length === 0) return [];
      const entity = result.recordset.map((item: any) => {
        return ExpedicaoSepararConsultaDto.fromObject(item);
      });

      return entity;
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
    }
  }

  public async selectWhere(
    params: Params[] = [],
    pagination?: Pagination,
    orderBy?: OrderBy,
  ): Promise<ExpedicaoSepararConsultaDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const select = this.getSelectSql();

      let _params: string;
      if (typeof params === 'string') {
        _params = this.buildParamsFromString(params);
      } else if (Array.isArray(params)) {
        _params = this.buildParamsWithSpecialHandling(params as unknown as Param[]);
      } else {
        _params = ParamsCommonRepository.build(params);
      }

      const paramOrderBy =
        orderBy && orderBy.isValid() ? `ORDER BY ${orderBy.getFullOrderBy()}` : 'ORDER BY (SELECT NULL)';
      const sql = _params ? `${select} WHERE ${_params}` : select;
      const sqlWithPagination = `${sql} ${paramOrderBy} OFFSET ${pagination?.offset} ROWS FETCH NEXT ${pagination?.limit} ROWS ONLY`;
      const sqlWithoutPagination = `${sql} ${paramOrderBy}`;
      const result = await pool.request().query(pagination ? sqlWithPagination : sqlWithoutPagination);

      if (result.recordset.length === 0) return [];
      const entitys = result.recordset.map((item: any) => {
        return ExpedicaoSepararConsultaDto.fromObject(item);
      });

      return entitys;
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
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

  private buildParamsWithSpecialHandling(params: Param[]): string {
    if (!params || params.length === 0) return '';

    const processedParams = params
      .map((param: Param) => {
        if (!param || !param.key) return '';

        if (param.key === 'CodSetorEstoque') {
          const value = typeof param.value === 'string' ? `'${param.value}'` : param.value;
          const existsClause = `EXISTS(
          SELECT *
          FROM Expedicao.ItemSepararEstoque ise
          WHERE ise.CodEmpresa = SepararConsulta.CodEmpresa
            AND ise.CodSepararEstoque = SepararConsulta.CodSepararEstoque
            AND ise.CodSetorEstoque = ${value}
        )`;

          return existsClause;
        }

        const _value = typeof param.value === 'string' ? `'${param.value}'` : param.value;
        const _operator = param.operator ? param.operator : '=';
        const clause = `${param.key} ${_operator} ${_value}`;
        return clause;
      })
      .filter((clause) => clause !== '');

    const result = processedParams.join(' AND ');
    return result;
  }
}
