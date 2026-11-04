import { DI_BIND } from '../../di/bind.tokens';
import { pageLimitForGroups, Pagination, Params, OrderBy } from '../../contracts/local.base.params';
import ExpedicaoCarrinhoConsultaDto from '../../dto/expedicao/expedicao.carrinho.consulta.dto';
import ExpedicaoCarrinhoDto from '../../dto/expedicao/expedicao.carrinho.dto';
import SqlServerExpedicaoCarrinhoConsultaRepository from '../../repository/expedicao/sql.server.expedicao.carrinho.consulta.repository';
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

  public async consultaAny(
    groups: Params[][],
    pagination?: Pagination,
    orderBy?: OrderBy,
  ): Promise<ExpedicaoCarrinhoConsultaDto[]> {
    if (groups.length === 0) return [];
    const repository = this.consultaRepository() as SqlServerExpedicaoCarrinhoConsultaRepository;
    return repository.selectWhereAny(
      groups,
      pagination ?? Pagination.create(pageLimitForGroups(groups.length, 5)),
      orderBy,
    );
  }
}
