import { DI_BIND } from '../di/bind.tokens';
import { resolveLocalRepository, resolveLocalSequenceRepository } from '../di/dependency.resolver';
import LocalBaseRepositoryContract from '../contracts/local.base.repository.contract';
import LocalBaseRepositorySequenceContract from '../contracts/local.base.repository.sequence.contract';
import ProcessoExecutavelDto from '../dto/common.data/processo.executavel.dto';
import SequenceDto from '../dto/common.data/sequence.dto';

export function createProcessoExecutavelRepository(): LocalBaseRepositoryContract<ProcessoExecutavelDto> {
  return resolveLocalRepository<ProcessoExecutavelDto>(DI_BIND.LocalBaseRepositoryContract_ProcessoExecutavelDto);
}

export function createSequenceRepository(): LocalBaseRepositorySequenceContract<SequenceDto> {
  return resolveLocalSequenceRepository();
}
