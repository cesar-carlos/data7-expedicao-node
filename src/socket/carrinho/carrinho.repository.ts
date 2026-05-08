import { DI_BIND } from '../../di/bind.tokens';
import ExpedicaoCarrinhoConsultaDto from '../../dto/expedicao/expedicao.carrinho.consulta.dto';
import ExpedicaoCarrinhoDto from '../../dto/expedicao/expedicao.carrinho.dto';
import BaseSocketRepository from '../base.socket.repository';

export default class CarrinhoRepository extends BaseSocketRepository<
  ExpedicaoCarrinhoDto,
  ExpedicaoCarrinhoConsultaDto
> {
  constructor() {
    super({
      repositoryBind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoCarrinhoDto,
      consultaBind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoCarrinhoConsultaDto,
      sequenceName: 'Carrinho_Sequencia_1',
    });
  }
}
