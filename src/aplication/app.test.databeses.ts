import ProcessInfo from '../entities/process.info';
import { createDatabaseStatusService } from '../factory/integracao.pix.factory';

export default class AppTestDatabeses {
  public async execute(): Promise<ProcessInfo> {
    const databaseStatusService = createDatabaseStatusService();
    const info = await databaseStatusService.execute();
    return info;
  }
}
