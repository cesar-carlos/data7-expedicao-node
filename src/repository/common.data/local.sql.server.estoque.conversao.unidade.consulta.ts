import path from 'path';

import { readSqlFileCached } from '../../infra/sql.file.cache';
import { ConnectionPool } from 'mssql';
import { Params, Pagination } from '../../contracts/local.base.params';

import ConnectionSqlServerMssql from '../../infra/connection.sql.server.mssql';
import LocalBaseConsultaRepositoryContract from '../../contracts/local.base.consulta.repository.contract';
import EstoqueConversaoUnidadeConsultaDto from '../../dto/common.data/estoque.conversao.unidade.consulta.dto';
import ParamsCommonRepository from '../common/params.common';
import { executeSelectPaged, executeSelectWhere } from '../common/consulta.sql.helper';
import { wrapRepositoryError } from '../../utils/repository.error';

export default class LocalSqlServerEstoqueConversaoUnidadeConsulta
  implements LocalBaseConsultaRepositoryContract<EstoqueConversaoUnidadeConsultaDto>
{
  private connect = ConnectionSqlServerMssql.getInstance();
  private basePatchSQL = ParamsCommonRepository.basePatchSQL('common.data');

  public async select(page: Pagination): Promise<EstoqueConversaoUnidadeConsultaDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'estoque.conversao.unidada.consulta.sql');
      const sql = readSqlFileCached(patchSQL);
      const result = await executeSelectPaged(pool, sql, page);

      if (result.recordset.length === 0) return [];
      return result.recordset.map((item: any) => EstoqueConversaoUnidadeConsultaDto.fromObject(item));
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async selectWhere(params: Params[] = []): Promise<EstoqueConversaoUnidadeConsultaDto[]> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      const patchSQL = path.resolve(this.basePatchSQL, 'estoque.conversao.unidada.consulta.sql');
      const select = readSqlFileCached(patchSQL);

      const result = await executeSelectWhere(pool, select, params, undefined, undefined);

      if (result.recordset.length === 0) return [];
      return result.recordset.map((item: any) => EstoqueConversaoUnidadeConsultaDto.fromObject(item));
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }
}
