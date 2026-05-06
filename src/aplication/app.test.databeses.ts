import ProcessInfo from '../entities/process.info';
import DatabaseStatusService from '../services/database.status.service';
import { createDatabaseStatusRepositories } from '../factory/integracao.pix.factory';

export default class AppTestDatabeses {
  public async execute(): Promise<ProcessInfo> {
    const databaseStatusService = new DatabaseStatusService(createDatabaseStatusRepositories());
    const info = await databaseStatusService.execute();
    return info;
  }
}
