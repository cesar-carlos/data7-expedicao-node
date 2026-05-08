import { getLocalDbContext } from '../../di/database.context';
import { DI_BIND } from '../../di/bind.tokens';
import { Pagination, OrderBy } from '../../contracts/local.base.params';

import AppDependencys from '../../aplication/app.dependencys';
import LocalBaseRepositorySequenceContract from '../../contracts/local.base.repository.sequence.contract';
import SequenceDto from '../../dto/common.data/sequence.dto';

export default class SequenciaRegistroRepository {
  public async select(name: string, pagination?: Pagination, orderBy?: OrderBy): Promise<SequenceDto | undefined> {
    try {
      const repository = this.repository();
      return await repository.select(name);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  private repository() {
    return AppDependencys.resolve<LocalBaseRepositorySequenceContract<SequenceDto>>({
      context: getLocalDbContext(),
      bind: DI_BIND.LocalBaseRepositorySequenceContract_SequenceDto,
    });
  }
}
