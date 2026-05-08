import { DI_BIND } from '../../di/bind.tokens';
import ExpedicaoSetorEstoqueDto from '../../dto/expedicao/expedicao.setor.estoque.dto';
import BaseSocketRepository from '../base.socket.repository';

export default class SetorEstoqueRepository extends BaseSocketRepository<ExpedicaoSetorEstoqueDto> {
  constructor() {
    super({
      repositoryBind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoSetorEstoqueDto,
      sequenceName: 'Expedicao.SetorEstoque_Sequencia_1',
    });
  }
}
