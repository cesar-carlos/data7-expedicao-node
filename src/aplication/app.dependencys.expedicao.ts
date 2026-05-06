import { DI_BIND } from '../di/bind.tokens';
import { eContext } from '../dependency/container.dependency';
import ContainerDependency from '../dependency/container.dependency';

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

export default class AppDependencysExpedicao {
  public static load() {
    ContainerDependency.instance.register({
      context: eContext.sql_server,
      bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoCancelamentoDto,
      instance: new SqlServerCancelamentoRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sql_server,
      bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoSetorEstoqueDto,
      instance: new SqlServerExpedicaoSetorEstoqueRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sql_server,
      bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoPrioridadeDto,
      instance: new SqlServerExpedicaoPrioridadeRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sql_server,
      bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoMotivoRecusaDto,
      instance: new SqlServerExpedicaoMotivoRecusaRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sql_server,
      bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoCarrinhoDto,
      instance: new SqlServerExpedicaoCarrinhoRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sql_server,
      bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoTipoOperacaoExpedicaoDto,
      instance: new SqlServerExpedicaoTipoOperacaoExpedicaoRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sql_server,
      bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoTipoOperacaoArmazenagemDto,
      instance: new SqlServerExpedicaoTipoOperacaoArmazenagemRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sql_server,
      bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoArmazenarDto,
      instance: new SqlServerExpedicaoArmazenarRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sql_server,
      bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoItemArmazenarDto,
      instance: new SqlServerExpedicaoItemArmazenarRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sql_server,
      bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoItemArmazenarConsultaDto,
      instance: new SqlServerExpedicaoItemArmazenarConsultaRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sql_server,
      bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoSepararDto,
      instance: new SqlServerExpedicaoSepararRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sql_server,
      bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoConferirDto,
      instance: new SqlServerExpedicaoConferirRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sql_server,
      bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoItemSepararDto,
      instance: new SqlServerExpedicaoItemSepararRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sql_server,
      bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoItemConferirDto,
      instance: new SqlServerExpedicaoItemConferirRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sql_server,
      bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoCarrinhoPercursoAgrupamento,
      instance: new SqlServerExpedicaoCarrinhoPercursoAgrupamentoRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sql_server,
      bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoItemSeparacaoDto,
      instance: new SqlServerExpedicaoItemSeparacaoRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sql_server,
      bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoItemConferenciaDto,
      instance: new SqlServerExpedicaoItemConferenciaRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sql_server,
      bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoCarrinhoPercursoDto,
      instance: new SqlServerExpedicaoCarrinhoPercursoRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sql_server,
      bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoCarrinhoPercursoEstagioDto,
      instance: new SqlServerExpedicaoCarrinhoPercursoEstagioRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sql_server,
      bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoPercursoEstagioDto,
      instance: new SqlServerExpedicaoPercursoEstagioRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sql_server,
      bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoSeparacaoUsuarioSetorDto,
      instance: new SqlServerExpedicaoSeparacaoUsuarioSetorRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sql_server,
      bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoCarrinhoPercursoEstagioConsultaDto,
      instance: new SqlServerExpedicaoCarrinhoPercursoEstagioConsultaRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sql_server,
      bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoCarrinhoConsultaDto,
      instance: new SqlServerExpedicaoCarrinhoConsultaRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sql_server,
      bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoProgressoSeparacaoConsultaDto,
      instance: new SqlServerExpedicaoProgressoSeparacaoConsultaRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sql_server,
      bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoSeparacaoUsuarioSetorConsultaDto,
      instance: new SqlServerExpedicaoSeparacaoUsuarioSetorConsultaRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sql_server,
      bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoSepararConsultaDto,
      instance: new SqlServerExpedicaoSepararConsultaRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sql_server,
      bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoConferirConsultaDto,
      instance: new SqlServerExpedicaoConferirConsultaRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sql_server,
      bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoCarrinhoConferirConsultaDto,
      instance: new SqlServerExpedicaoCarrinhoConferirConsultaRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sql_server,
      bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoItemSepararConsultaDto,
      instance: new SqlServerExpedicaoSepararItemConsultaRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sql_server,
      bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoItemSepararUnidadeMedidaConsultaDto,
      instance: new SqlServerExpedicaoItemSepararUnidadeMedidaConsultaRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sql_server,
      bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoItemConferirConsultaDto,
      instance: new SqlServerExpedicaoItemConferirConsultaRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sql_server,
      bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoItemConferirUnidadeMedidaConsultaDto,
      instance: new SqlServerExpedicaoItemConferirUnidadeMedidaConsultaRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sql_server,
      bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoItemSeparacaoConferirConsultaDto,
      instance: new SqlServerExpedicaoItemConferirSeparacaoConsultaRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sql_server,
      bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoItemSeparacaoConsultaDto,
      instance: new SqlServerExpedicaoItemSeparacaoConsultaRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sql_server,
      bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoItemSeparacaoResumoConsultaDto,
      instance: new SqlServerExpedicaoItemSeparacaoResumoConsultaRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sql_server,
      bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoItemConferenciaConsultaDto,
      instance: new SqlServerExpedicaoItemConferenciaConsultaRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sql_server,
      bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoCarrinhoPercursoAgrupamentoConsulta,
      instance: new SqlServerExpedicaoCarrinhoPercursoAgrupamentoConsultaRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sql_server,
      bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoLoginAppDto,
      instance: new SqlServerExpedicaoLoginAppRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sql_server,
      bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoLoginAppConsultaDto,
      instance: new SqlServerExpedicaoLoginAppConsultaRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sql_server,
      bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoVersaoAppConsultaDto,
      instance: new LocalSqlServerExpedicaoVersaoAppConsultaRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sql_server,
      bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoItemImpressoConsultaDto,
      instance: new SqlServerExpedicaoItemImpressoConsultaRepository(),
    });
  }
}
