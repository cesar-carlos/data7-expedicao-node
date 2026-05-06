import { OrderBy, Pagination, Params } from '../contracts/local.base.params';
import LocalBaseConsultaRepositoryContract from '../contracts/local.base.consulta.repository.contract';
import LocalBaseRepositoryContract from '../contracts/local.base.repository.contract';
import LocalBaseRepositorySequenceContract from '../contracts/local.base.repository.sequence.contract';
import SequenceDto from '../dto/common.data/sequence.dto';
import {
  resolveLocalConsultaRepository,
  resolveLocalRepository,
  resolveLocalSequenceRepository,
} from '../di/dependency.resolver';

type BaseSocketRepositoryOptions = {
  repositoryBind: string;
  consultaBind?: string;
  sequenceName?: string;
};

export default class BaseSocketRepository<TEntity, TConsulta = TEntity> {
  constructor(private readonly options: BaseSocketRepositoryOptions) {}

  public async consulta(
    params: Params[] = [],
    pagination?: Pagination,
    orderBy?: OrderBy,
  ): Promise<TConsulta[]> {
    return await this.consultaRepository().selectWhere(params, pagination, orderBy);
  }

  public async select(
    params: Params[] = [],
    pagination?: Pagination,
    orderBy?: OrderBy,
  ): Promise<TEntity[]> {
    return await this.repository().selectWhere(params, pagination, orderBy);
  }

  public async insert(models: TEntity[]): Promise<void> {
    for (const model of models) {
      await this.repository().insert(model);
    }
  }

  public async update(models: TEntity[]): Promise<void> {
    for (const model of models) {
      await this.repository().update(model);
    }
  }

  public async delete(models: TEntity[]): Promise<void> {
    for (const model of models) {
      await this.repository().delete(model);
    }
  }

  public async sequence(): Promise<SequenceDto | undefined> {
    if (!this.options.sequenceName) {
      return undefined;
    }

    return await this.sequenceRepository().select(this.options.sequenceName);
  }

  protected repository(): LocalBaseRepositoryContract<TEntity> {
    return resolveLocalRepository<TEntity>(this.options.repositoryBind);
  }

  protected consultaRepository(): LocalBaseConsultaRepositoryContract<TConsulta> {
    if (!this.options.consultaBind) {
      throw new Error(`Consulta repository not configured for ${this.options.repositoryBind}`);
    }

    return resolveLocalConsultaRepository<TConsulta>(this.options.consultaBind);
  }

  protected sequenceRepository(): LocalBaseRepositorySequenceContract<SequenceDto> {
    return resolveLocalSequenceRepository();
  }
}
