import { DI_BIND } from '../../di/bind.tokens';
import ExpedicaoArmazenarDto from '../../dto/expedicao/expedicao.armazenar.dto';
import BaseSocketRepository from '../base.socket.repository';

export default class ArmazenarRepository extends BaseSocketRepository<ExpedicaoArmazenarDto> {
  constructor() {
    super({
      repositoryBind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoArmazenarDto,
      sequenceName: 'Expedicao.Armazenar_Sequencia_1',
    });
  }
}
