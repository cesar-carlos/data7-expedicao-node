import { ConnectionPool } from 'mssql';
import ConnectionSqlServerMssql from '../../infra/connection.sql.server.mssql';

import LocalBaseRepositorySequenceContract from '../../contracts/local.base.repository.sequence.contract';
import SequenceDto from '../../dto/common.data/sequence.dto';
import { wrapRepositoryError } from '../../utils/repository.error';

export default class LocalSqlServerSequences implements LocalBaseRepositorySequenceContract<SequenceDto> {
  private connect = ConnectionSqlServerMssql.getInstance();

  public async select(name: string): Promise<SequenceDto | undefined> {
    const pool: ConnectionPool = await this.connect.getConnection();

    try {
      if (!/^[\w.#\[\]]+$/.test(name) || name.length > 256) {
        throw new Error('Nome de sequência inválido');
      }
      const sql = `SELECT NEXT VALUE FOR ${name} AS value`;
      const result = await pool.request().query(sql);

      if (result.recordset.length === 0) return undefined;
      const sequence: SequenceDto[] = result.recordset.map((item: any) => {
        const value = Number.parseInt(item.value) ?? 0;
        return new SequenceDto({ Nome: name, Valor: value });
      });

      return sequence.shift();
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    } finally {
    }
  }
}
