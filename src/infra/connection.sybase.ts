import { DriverConnectionSybase } from './driver.connection.sybase';

import config from '../assets/config.sybase';
import ConnectionBaseSqlContract from '../contracts/connection.base.sql.contract';

export class ConnectionSybase implements ConnectionBaseSqlContract<DriverConnectionSybase> {
  private static instance: ConnectionSybase;
  private pool: DriverConnectionSybase;

  private constructor() {
    this.pool = new DriverConnectionSybase(config);
  }

  public static getInstance(): ConnectionSybase {
    if (!ConnectionSybase.instance) {
      ConnectionSybase.instance = new ConnectionSybase();
    }

    return ConnectionSybase.instance;
  }

  async getConnection(): Promise<DriverConnectionSybase> {
    return this.pool;
  }

  async closeConnection(): Promise<void> {
    this.pool.close();
  }
}
