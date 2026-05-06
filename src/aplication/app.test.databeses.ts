import { getLocalDbContext, getOnlineDbContext } from '../di/database.context';
import { DI_BIND } from '../di/bind.tokens';

import ProcessInfo from '../entities/process.info';
import DatabaseOnlineDto from '../dto/common.data/database.online.dto';
import DataBaseActiveContract from '../contracts/data.base.active.contract';
import DatabaseStatusService from '../services/database.status.service';
import AppDependencys from './app.dependencys';

export default class AppTestDatabeses {
  private localRepo = AppDependencys.resolve<DataBaseActiveContract<DatabaseOnlineDto>>({
    context: getLocalDbContext(),
    bind: DI_BIND.DataBaseActiveContract_DatabaseOnlineDto,
  });

  private onlineRepo = AppDependencys.resolve<DataBaseActiveContract<DatabaseOnlineDto>>({
    context: getOnlineDbContext(),
    bind: DI_BIND.DataBaseActiveContract_DatabaseOnlineDto,
  });

  public async execute(): Promise<ProcessInfo> {
    const databaseStatusService = new DatabaseStatusService([this.localRepo, this.onlineRepo]);
    const info = await databaseStatusService.execute();
    return info;
  }
}
