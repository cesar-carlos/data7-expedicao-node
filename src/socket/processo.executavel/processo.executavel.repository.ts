import { DI_BIND } from '../../di/bind.tokens';
import ProcessoExecutavelDto from '../../dto/common.data/processo.executavel.dto';
import BaseSocketRepository from '../base.socket.repository';

export default class ProcessoExecutavelRepository extends BaseSocketRepository<ProcessoExecutavelDto> {
  constructor() {
    super({
      repositoryBind: DI_BIND.LocalBaseRepositoryContract_ProcessoExecutavelDto,
      sequenceName: 'ProcessoExecutavel_Sequencia_1',
    });
  }
}
