import { DI_BIND } from '../../di/bind.tokens';
import ExpedicaoCancelamentoDto from '../../dto/expedicao/expedicao.cancelamento.dto';
import BaseSocketRepository from '../base.socket.repository';

export default class CancelamentoRepository extends BaseSocketRepository<ExpedicaoCancelamentoDto> {
  constructor() {
    super({
      repositoryBind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoCancelamentoDto,
      sequenceName: 'Expedicao.Cancelamento_Sequencia_1',
    });
  }
}
