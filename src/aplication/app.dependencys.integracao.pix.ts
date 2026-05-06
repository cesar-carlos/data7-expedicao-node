import { DI_BIND } from '../di/bind.tokens';
import { eContext } from '../dependency/container.dependency';

import ContainerDependency from '../dependency/container.dependency';
//import GerencianetCreatePixAdapter from '../adapter/gerencianet.create.pix.adapter';
import FirebaseCobrancaPixRepository from '../repository/firebase/firebase.cobranca.pix.repository';
import FirebasePagamentoPixRepository from '../repository/firebase/firebase.pagamento.pix.repository';
import FirebaseDatabaseOnlineRepository from '../repository/firebase/firebase.database.online.repository';
import LocalSqlServerCobrancaDigitalPagamentoRepository from '../repository/integracao/local.sql.server.cobranca.digital.pagamento.repository';
import LocalSqlServerCobrancaDigitalPixRepository from '../repository/integracao/local.sql.server.cobranca.digital.pix.repository';
import LocalSqlServerCobrancaDigitalRepository from '../repository/integracao/local.sql.server.cobranca.digital.repository';
import LocalSqlServerCobrancaDigitalTituloRepository from '../repository/integracao/local.sql.server.cobranca.digital.titulo.repository';
import LocalSybaseCobrancaDigitalPagamentoRepository from '../repository/integracao/local.sybase.cobranca.digital.pagamento.repository';
import LocalSybaseCobrancaDigitalTituloRepository from '../repository/integracao/local.sybase.cobranca.digital.titulo.repository';
import LocalSybaseCobrancaDigitalPixRepository from '../repository/integracao/local.sybase.cobranca.digital.pix.repository';
import LocalSybaseCobrancaDigitalRepository from '../repository/integracao/local.sybase.cobranca.digital.repository';
import CreatePixApiStub from '../infra/create.pix.api.stub';

export default class AppDependencysIntegracaoPix {
  public static load() {
    ContainerDependency.instance.register({
      context: eContext.firebase,
      bind: DI_BIND.ContractBaseRepository_CobrancaPix,
      instance: new FirebaseCobrancaPixRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sql_server,
      bind: DI_BIND.LocalBaseRepositoryContract_CobrancaDigitalPixDto,
      instance: new LocalSqlServerCobrancaDigitalPixRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sybase,
      bind: DI_BIND.LocalBaseRepositoryContract_CobrancaDigitalPixDto,
      instance: new LocalSybaseCobrancaDigitalPixRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sql_server,
      bind: DI_BIND.LocalBaseRepositoryContract_CobrancaDigitalTituloDto,
      instance: new LocalSqlServerCobrancaDigitalTituloRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sybase,
      bind: DI_BIND.LocalBaseRepositoryContract_CobrancaDigitalTituloDto,
      instance: new LocalSybaseCobrancaDigitalTituloRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sql_server,
      bind: DI_BIND.LocalBaseRepositoryContract_CobrancaDigitalPagamentoDto,
      instance: new LocalSqlServerCobrancaDigitalPagamentoRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sybase,
      bind: DI_BIND.LocalBaseRepositoryContract_CobrancaDigitalPagamentoDto,
      instance: new LocalSybaseCobrancaDigitalPagamentoRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sql_server,
      bind: DI_BIND.LocalBaseRepositoryContract_CobrancaDigitalDto,
      instance: new LocalSqlServerCobrancaDigitalRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.sybase,
      bind: DI_BIND.LocalBaseRepositoryContract_CobrancaDigitalDto,
      instance: new LocalSybaseCobrancaDigitalRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.firebase,
      bind: DI_BIND.DataBaseActiveContract_DatabaseOnlineDto,
      instance: new FirebaseDatabaseOnlineRepository(),
    });

    ContainerDependency.instance.register({
      context: eContext.firebase,
      bind: DI_BIND.ContractBaseRepository_PagamentoPix,
      instance: new FirebasePagamentoPixRepository(),
    });

    const apiPixContext = process.env.API_PIX?.toLocaleLowerCase();
    if (apiPixContext) {
      ContainerDependency.instance.register({
        context: apiPixContext,
        bind: DI_BIND.CreatePixApiContract,
        instance: new CreatePixApiStub(),
      });
    }
  }
}
