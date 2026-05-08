import AppDependencys from '../aplication/app.dependencys';
import ContractBaseRepository from '../contracts/base.repository.contract';
import LocalBaseConsultaRepositoryContract from '../contracts/local.base.consulta.repository.contract';
import LocalBaseRepositoryContract from '../contracts/local.base.repository.contract';
import LocalBaseRepositorySequenceContract from '../contracts/local.base.repository.sequence.contract';
import SequenceDto from '../dto/common.data/sequence.dto';
import { DI_BIND } from './bind.tokens';
import { getLocalDbContext, getOnlineDbContext } from './database.context';

export function resolveDependency<T>(params: { context: string; bind: string }): T {
  return AppDependencys.resolve<T>(params);
}

export function resolveLocalRepository<T>(bind: string): LocalBaseRepositoryContract<T> {
  return resolveDependency<LocalBaseRepositoryContract<T>>({
    context: getLocalDbContext(),
    bind,
  });
}

export function resolveLocalConsultaRepository<T>(bind: string): LocalBaseConsultaRepositoryContract<T> {
  return resolveDependency<LocalBaseConsultaRepositoryContract<T>>({
    context: getLocalDbContext(),
    bind,
  });
}

export function resolveLocalSequenceRepository(): LocalBaseRepositorySequenceContract<SequenceDto> {
  return resolveDependency<LocalBaseRepositorySequenceContract<SequenceDto>>({
    context: getLocalDbContext(),
    bind: DI_BIND.LocalBaseRepositorySequenceContract_SequenceDto,
  });
}

export function resolveOnlineRepository<T>(bind: string): ContractBaseRepository<T> {
  return resolveDependency<ContractBaseRepository<T>>({
    context: getOnlineDbContext(),
    bind,
  });
}
