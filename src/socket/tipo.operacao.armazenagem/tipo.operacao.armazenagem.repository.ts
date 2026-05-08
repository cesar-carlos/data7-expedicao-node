import { DI_BIND } from '../../di/bind.tokens';
import ExpedicaoTipoOperacaoArmazenagemDto from '../../dto/expedicao/expedicao.tipo.operacao.armazenagem.dto';
import BaseSocketRepository from '../base.socket.repository';

export default class TipoOperacaoArmazenagemRepository extends BaseSocketRepository<ExpedicaoTipoOperacaoArmazenagemDto> {
  constructor() {
    super({
      repositoryBind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoTipoOperacaoArmazenagemDto,
      sequenceName: 'Expedicao.TipoOperacaoArmazenagem_Sequencia_1',
    });
  }
}
