import { DI_BIND } from '../../di/bind.tokens';
import { pageLimitForGroups, OrderBy, Pagination, Params } from '../../contracts/local.base.params';
import UsuarioConsultaDto from '../../dto/common.data/usuario.consulta.dto';
import UsuarioDto from '../../dto/common.data/usuario';
import LocalSqlServerUsuarioConsultaRepository from '../../repository/common.data/local.sql.server.usuario.consulta.repository';
import BaseSocketRepository from '../base.socket.repository';

export default class UsuarioRepository extends BaseSocketRepository<UsuarioDto, UsuarioConsultaDto> {
  constructor() {
    super({
      repositoryBind: DI_BIND.LocalBaseRepositoryContract_UsuarioDto,
      consultaBind: DI_BIND.LocalBaseConsultaRepositoryContract_UsuarioConsultaDto,
      sequenceName: 'Usuario_Sequencia',
    });
  }

  public override async insert(models: UsuarioDto[]): Promise<void> {
    void models;
    throw new Error('Not implemented');
  }

  public override async update(models: UsuarioDto[]): Promise<void> {
    void models;
    throw new Error('Not implemented');
  }

  public override async delete(models: UsuarioDto[]): Promise<void> {
    void models;
    throw new Error('Not implemented');
  }

  public async consultaAny(
    groups: Params[][],
    pagination?: Pagination,
    orderBy?: OrderBy,
  ): Promise<UsuarioConsultaDto[]> {
    if (groups.length === 0) return [];
    const repository = this.consultaRepository() as LocalSqlServerUsuarioConsultaRepository;
    return repository.selectWhereAny(
      groups,
      pagination ?? Pagination.create(pageLimitForGroups(groups.length, 5)),
      orderBy,
    );
  }
}
