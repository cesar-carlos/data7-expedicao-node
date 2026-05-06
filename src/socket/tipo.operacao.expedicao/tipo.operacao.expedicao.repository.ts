import { DI_BIND } from '../../di/bind.tokens';
import ExpedicaoTipoOperacaoExpedicaoDto from '../../dto/expedicao/expedicao.tipo.operacao.expedicao.dto';
import BaseSocketRepository from '../base.socket.repository';

export default class TipoOperacaoExpedicaoRepository extends BaseSocketRepository<ExpedicaoTipoOperacaoExpedicaoDto> {
  constructor() {
    super({
      repositoryBind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoTipoOperacaoExpedicaoDto,
      sequenceName: 'Expedicao.TipoOperacaoExpedicao_Sequencia_1',
    });
  }
}
