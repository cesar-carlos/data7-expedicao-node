import { DI_BIND } from '../di/bind.tokens';
import { registerDependencies, type DependencyRegistration } from '../di/dependency.registration';
import { eContext } from '../dependency/container.dependency';

import LocalSqlServerDatabaseOnlineRepository from '../repository/common.data/local.sql.server.database.online.repository';
import LocalSqlServerUsuarioConsultaRepository from '../repository/common.data/local.sql.server.usuario.consulta.repository';
import LocalSybaseItemLiberacaoBloqueioRepository from '../repository/common.data/local.sybase.item.liberacao.bloqueio.repository';
import LocalSqlServerItemLiberacaoBloqueioRepository from '../repository/common.data/local.sql.server.item.liberacao.bloqueio.repository';
import LocalSqlServerEstoqueProdutoConsultaRepository from '../repository/common.data/local.sql.server.estoque.produto.consulta.repository';
import LocalSqlServerEstoqueConversaoUnidadeConsulta from '../repository/common.data/local.sql.server.estoque.conversao.unidade.consulta';
import LocalSqlServerProcessoExecutavelRepository from '../repository/common.data/local.sql.server.processo.executavel.repository';
import LocalSqlServerEstoqueProdutoRepository from '../repository/common.data/local.sql.server.estoque.produto.repository';
import LocalSybaseDatabaseOnlineRepository from '../repository/common.data/local.sybase.database.online.repository';
import LocalSqlServerSequences from '../repository/common.data/local.sql.server.sequences';

const registrations: DependencyRegistration[] = [
  {
    context: eContext.sql_server,
    bind: DI_BIND.DataBaseActiveContract_DatabaseOnlineDto,
    create: () => new LocalSqlServerDatabaseOnlineRepository(),
  },
  {
    context: eContext.sybase,
    bind: DI_BIND.DataBaseActiveContract_DatabaseOnlineDto,
    create: () => new LocalSybaseDatabaseOnlineRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseRepositoryContract_ItemLiberacaoBloqueioDto,
    create: () => new LocalSqlServerItemLiberacaoBloqueioRepository(),
  },
  {
    context: eContext.sybase,
    bind: DI_BIND.LocalBaseRepositoryContract_ItemLiberacaoBloqueioDto,
    create: () => new LocalSybaseItemLiberacaoBloqueioRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseRepositoryContract_EstoqueProdutoDto,
    create: () => new LocalSqlServerEstoqueProdutoRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseRepositoryContract_ProcessoExecutavelDto,
    create: () => new LocalSqlServerProcessoExecutavelRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseRepositorySequenceContract_SequenceDto,
    create: () => new LocalSqlServerSequences(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseConsultaRepositoryContract_EstoqueProdutoConsultaDto,
    create: () => new LocalSqlServerEstoqueProdutoConsultaRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseConsultaRepositoryContract_EstoqueConversaoUnidadeConsultaDto,
    create: () => new LocalSqlServerEstoqueConversaoUnidadeConsulta(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseConsultaRepositoryContract_UsuarioConsultaDto,
    create: () => new LocalSqlServerUsuarioConsultaRepository(),
  },
];

export default class AppDependencysGeral {
  public static load() {
    registerDependencies(registrations);
  }
}
