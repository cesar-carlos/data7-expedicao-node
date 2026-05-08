import path from 'path';
import { readSqlFileCached } from '../../infra/sql.file.cache';

import { ConnectionSybase } from '../../infra/connection.sybase';

import DatabaseOnlineDto from '../../dto/common.data/database.online.dto';
import DataBaseActiveContract from '../../contracts/data.base.active.contract';
import ParamsCommonRepository from '../common/params.common';

export default class LocalSybaseDatabaseOnlineRepository<DatabaseOnlineDto>
  implements DataBaseActiveContract<DatabaseOnlineDto | string>
{
  private connect = ConnectionSybase.getInstance();
  private basePatchSQL = ParamsCommonRepository.basePatchSQL('common.data');

  public async getDataBaseInfo(): Promise<DatabaseOnlineDto | string> {
    try {
      const connection = await this.connect.getConnection();
      const pool = await connection.connect();
      const patch = path.resolve(this.basePatchSQL, 'local.database.online.select.sql');
      const sql = readSqlFileCached(patch);
      const result = await pool.request().query(sql);
      pool.close();

      if (result.length === 0) return `Falha ao obter informacoes da base de dados (On-Line: SyBase).`;
      const databaseOnlineDto = result.map((item: any) => {
        return DatabaseOnlineDto.fromObject(item);
      });

      return databaseOnlineDto.shift();
    } catch (error: any) {
      return `Falha ao obter informacoes da base de dados (On-Line: SyBase). ${error.message}`;
    }
  }
}
