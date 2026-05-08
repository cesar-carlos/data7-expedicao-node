import { DI_BIND } from '../di/bind.tokens';
import { registerDependencies, type DependencyRegistration } from '../di/dependency.registration';
import { eContext } from '../dependency/container.dependency';

import SqlServerExpedicaoPercursoEstagioRepository from '../repository/expedicao/sql.server.expedicao.percurso.estagio.repository';
import SqlServerExpedicaoConferirRepository from '../repository/expedicao/sql.server.expedicao.conferir.repository';
import SqlServerExpedicaoPrioridadeRepository from '../repository/expedicao/sql.server.expedicao.prioridade.repository';
import SqlServerExpedicaoMotivoRecusaRepository from '../repository/expedicao/sql.server.expedicao.motivo.recusa.repository';
import SqlServerExpedicaoSepararConsultaRepository from '../repository/expedicao/sql.server.expedicao.separar.consulta.repository';
import SqlServerExpedicaoCarrinhoPercursoRepository from '../repository/expedicao/sql.server.expedicao.carrinho.percurso.repository';
import SqlServerExpedicaoCarrinhoConsultaRepository from '../repository/expedicao/sql.server.expedicao.carrinho.consulta.repository';
import SqlServerExpedicaoSepararItemConsultaRepository from '../repository/expedicao/sql.server.expedicao.item.separar.consulta.repository';
import SqlServerExpedicaoItemArmazenarConsultaRepository from '../repository/expedicao/sql.server.expedicao.item.armazenar.consulta.repository';
import SqlServerExpedicaoItemConferenciaConsultaRepository from '../repository/expedicao/sql.server.expedicao.item.conferencia.consulta.repository';
import SqlServerExpedicaoItemSeparacaoResumoConsultaRepository from '../repository/expedicao/sql.server.expedicao.item.separacao.resumo.consulta.repository';
import SqlServerExpedicaoCarrinhoPercursoAgrupamentoConsultaRepository from '../repository/expedicao/sql.server.expedicao.carrinho.percurso.agrupamento.consulta.repository';
import SqlServerExpedicaoItemConferirUnidadeMedidaConsultaRepository from '../repository/expedicao/sql.server.expedicao.item.conferir.unidade.medida.consulta.repository';
import SqlServerExpedicaoItemSepararUnidadeMedidaConsultaRepository from '../repository/expedicao/sql.server.expedicao.item.separar.unidade.medida.consulta.repository';
import SqlServerExpedicaoCarrinhoPercursoEstagioConsultaRepository from '../repository/expedicao/sql.server.expedicao.carrinho.percurso.estagio.consulta.repository';
import SqlServerExpedicaoItemConferirSeparacaoConsultaRepository from '../repository/expedicao/sql.server.expedicao.item.conferir.separacao.consulta.repository';
import SqlServerExpedicaoCarrinhoPercursoAgrupamentoRepository from '../repository/expedicao/sql.server.expedicao.carrinho.percurso.agrupamento.repository';
import SqlServerExpedicaoCarrinhoConferirConsultaRepository from '../repository/expedicao/sql.server.expedicao.carrinho.conferir.consulta.repository';
import SqlServerExpedicaoCarrinhoPercursoEstagioRepository from '../repository/expedicao/sql.server.expedicao.carrinho.percurso.estagio.repository';
import SqlServerExpedicaoTipoOperacaoArmazenagemRepository from '../repository/expedicao/sql.server.expedicao.tipo.operacao.armazenagem.repository';
import SqlServerExpedicaoTipoOperacaoExpedicaoRepository from '../repository/expedicao/sql.server.expedicao.tipo.operacao.expedicao.repository';
import SqlServerExpedicaoItemSeparacaoConsultaRepository from '../repository/expedicao/sql.server.expedicao.item.separacao.consulta.repository';
import SqlServerExpedicaoItemConferirConsultaRepository from '../repository/expedicao/sql.server.expedicao.item.conferir.consulta.repository';
import SqlServerExpedicaoConferirConsultaRepository from '../repository/expedicao/sql.server.expedicao.conferir.consulta.repository';
import SqlServerExpedicaoItemConferenciaRepository from '../repository/expedicao/sql.server.expedicao.item.conferencia.repository';
import SqlServerExpedicaoItemArmazenarRepository from '../repository/expedicao/sql.server.expedicao.item.armazenar.repository';
import SqlServerExpedicaoItemSeparacaoRepository from '../repository/expedicao/sql.server.expedicao.item.separacao.repository';
import SqlServerExpedicaoItemConferirRepository from '../repository/expedicao/sql.server.expedicao.item.conferir.repository';
import SqlServerExpedicaoSetorEstoqueRepository from '../repository/expedicao/sql.server.expedicao.setor.estoque.repository';
import SqlServerExpedicaoItemSepararRepository from '../repository/expedicao/sql.server.expedicao.item.separar.repository';
import SqlServerExpedicaoArmazenarRepository from '../repository/expedicao/sql.server.expedicao.armazenar.repository';
import SqlServerExpedicaoCarrinhoRepository from '../repository/expedicao/sql.server.expedicao.carrinho.repository';
import SqlServerExpedicaoSepararRepository from '../repository/expedicao/sql.server.expedicao.separar.repository';
import SqlServerCancelamentoRepository from '../repository/expedicao/sql.server.cancelamento.repository';
import SqlServerExpedicaoLoginAppRepository from '../repository/expedicao/sql.server.expedicao.login.app.repository';
import SqlServerExpedicaoLoginAppConsultaRepository from '../repository/expedicao/sql.server.expedicao.login.app.consulta.repository';
import SqlServerExpedicaoProgressoSeparacaoConsultaRepository from '../repository/expedicao/sql.server.expedicao.progresso.separacao.consulta.repository';
import SqlServerExpedicaoSeparacaoUsuarioSetorRepository from '../repository/expedicao/sql.server.expedicao.separacao.usuario.setor.repository';
import SqlServerExpedicaoSeparacaoUsuarioSetorConsultaRepository from '../repository/expedicao/sql.server.expedicao.separacao.usuario.setor.consulta.repository';
import LocalSqlServerExpedicaoVersaoAppConsultaRepository from '../repository/expedicao/sql.server.expedicao.versaoapp.consulta.repository';
import SqlServerExpedicaoItemImpressoConsultaRepository from '../repository/expedicao/sql.server.expedicao.item.impresso.consulta.repository';

const registrations: DependencyRegistration[] = [
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoCancelamentoDto,
    create: () => new SqlServerCancelamentoRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoSetorEstoqueDto,
    create: () => new SqlServerExpedicaoSetorEstoqueRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoPrioridadeDto,
    create: () => new SqlServerExpedicaoPrioridadeRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoMotivoRecusaDto,
    create: () => new SqlServerExpedicaoMotivoRecusaRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoCarrinhoDto,
    create: () => new SqlServerExpedicaoCarrinhoRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoTipoOperacaoExpedicaoDto,
    create: () => new SqlServerExpedicaoTipoOperacaoExpedicaoRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoTipoOperacaoArmazenagemDto,
    create: () => new SqlServerExpedicaoTipoOperacaoArmazenagemRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoArmazenarDto,
    create: () => new SqlServerExpedicaoArmazenarRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoItemArmazenarDto,
    create: () => new SqlServerExpedicaoItemArmazenarRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoItemArmazenarConsultaDto,
    create: () => new SqlServerExpedicaoItemArmazenarConsultaRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoSepararDto,
    create: () => new SqlServerExpedicaoSepararRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoConferirDto,
    create: () => new SqlServerExpedicaoConferirRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoItemSepararDto,
    create: () => new SqlServerExpedicaoItemSepararRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoItemConferirDto,
    create: () => new SqlServerExpedicaoItemConferirRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoCarrinhoPercursoAgrupamento,
    create: () => new SqlServerExpedicaoCarrinhoPercursoAgrupamentoRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoItemSeparacaoDto,
    create: () => new SqlServerExpedicaoItemSeparacaoRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoItemConferenciaDto,
    create: () => new SqlServerExpedicaoItemConferenciaRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoCarrinhoPercursoDto,
    create: () => new SqlServerExpedicaoCarrinhoPercursoRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoCarrinhoPercursoEstagioDto,
    create: () => new SqlServerExpedicaoCarrinhoPercursoEstagioRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoPercursoEstagioDto,
    create: () => new SqlServerExpedicaoPercursoEstagioRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoSeparacaoUsuarioSetorDto,
    create: () => new SqlServerExpedicaoSeparacaoUsuarioSetorRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoCarrinhoPercursoEstagioConsultaDto,
    create: () => new SqlServerExpedicaoCarrinhoPercursoEstagioConsultaRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoCarrinhoConsultaDto,
    create: () => new SqlServerExpedicaoCarrinhoConsultaRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoProgressoSeparacaoConsultaDto,
    create: () => new SqlServerExpedicaoProgressoSeparacaoConsultaRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoSeparacaoUsuarioSetorConsultaDto,
    create: () => new SqlServerExpedicaoSeparacaoUsuarioSetorConsultaRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoSepararConsultaDto,
    create: () => new SqlServerExpedicaoSepararConsultaRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoConferirConsultaDto,
    create: () => new SqlServerExpedicaoConferirConsultaRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoCarrinhoConferirConsultaDto,
    create: () => new SqlServerExpedicaoCarrinhoConferirConsultaRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoItemSepararConsultaDto,
    create: () => new SqlServerExpedicaoSepararItemConsultaRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoItemSepararUnidadeMedidaConsultaDto,
    create: () => new SqlServerExpedicaoItemSepararUnidadeMedidaConsultaRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoItemConferirConsultaDto,
    create: () => new SqlServerExpedicaoItemConferirConsultaRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoItemConferirUnidadeMedidaConsultaDto,
    create: () => new SqlServerExpedicaoItemConferirUnidadeMedidaConsultaRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoItemSeparacaoConferirConsultaDto,
    create: () => new SqlServerExpedicaoItemConferirSeparacaoConsultaRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoItemSeparacaoConsultaDto,
    create: () => new SqlServerExpedicaoItemSeparacaoConsultaRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoItemSeparacaoResumoConsultaDto,
    create: () => new SqlServerExpedicaoItemSeparacaoResumoConsultaRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoItemConferenciaConsultaDto,
    create: () => new SqlServerExpedicaoItemConferenciaConsultaRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoCarrinhoPercursoAgrupamentoConsulta,
    create: () => new SqlServerExpedicaoCarrinhoPercursoAgrupamentoConsultaRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoLoginAppDto,
    create: () => new SqlServerExpedicaoLoginAppRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoLoginAppConsultaDto,
    create: () => new SqlServerExpedicaoLoginAppConsultaRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoVersaoAppConsultaDto,
    create: () => new LocalSqlServerExpedicaoVersaoAppConsultaRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoItemImpressoConsultaDto,
    create: () => new SqlServerExpedicaoItemImpressoConsultaRepository(),
  },
];

export default class AppDependencysExpedicao {
  public static load() {
    registerDependencies(registrations);
  }
}
