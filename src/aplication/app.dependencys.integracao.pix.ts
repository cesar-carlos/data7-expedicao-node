import { DI_BIND } from '../di/bind.tokens';
import { registerDependencies, type DependencyRegistration } from '../di/dependency.registration';
import { eContext } from '../dependency/container.dependency';

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

const registrations: DependencyRegistration[] = [
  {
    context: eContext.firebase,
    bind: DI_BIND.ContractBaseRepository_CobrancaPix,
    create: () => new FirebaseCobrancaPixRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseRepositoryContract_CobrancaDigitalPixDto,
    create: () => new LocalSqlServerCobrancaDigitalPixRepository(),
  },
  {
    context: eContext.sybase,
    bind: DI_BIND.LocalBaseRepositoryContract_CobrancaDigitalPixDto,
    create: () => new LocalSybaseCobrancaDigitalPixRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseRepositoryContract_CobrancaDigitalTituloDto,
    create: () => new LocalSqlServerCobrancaDigitalTituloRepository(),
  },
  {
    context: eContext.sybase,
    bind: DI_BIND.LocalBaseRepositoryContract_CobrancaDigitalTituloDto,
    create: () => new LocalSybaseCobrancaDigitalTituloRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseRepositoryContract_CobrancaDigitalPagamentoDto,
    create: () => new LocalSqlServerCobrancaDigitalPagamentoRepository(),
  },
  {
    context: eContext.sybase,
    bind: DI_BIND.LocalBaseRepositoryContract_CobrancaDigitalPagamentoDto,
    create: () => new LocalSybaseCobrancaDigitalPagamentoRepository(),
  },
  {
    context: eContext.sql_server,
    bind: DI_BIND.LocalBaseRepositoryContract_CobrancaDigitalDto,
    create: () => new LocalSqlServerCobrancaDigitalRepository(),
  },
  {
    context: eContext.sybase,
    bind: DI_BIND.LocalBaseRepositoryContract_CobrancaDigitalDto,
    create: () => new LocalSybaseCobrancaDigitalRepository(),
  },
  {
    context: eContext.firebase,
    bind: DI_BIND.DataBaseActiveContract_DatabaseOnlineDto,
    create: () => new FirebaseDatabaseOnlineRepository(),
  },
  {
    context: eContext.firebase,
    bind: DI_BIND.ContractBaseRepository_PagamentoPix,
    create: () => new FirebasePagamentoPixRepository(),
  },
];

export default class AppDependencysIntegracaoPix {
  public static load() {
    registerDependencies(registrations);

    const apiPixContext = process.env.API_PIX?.toLocaleLowerCase();
    if (apiPixContext) {
      registerDependencies([
        {
          context: apiPixContext,
          bind: DI_BIND.CreatePixApiContract,
          create: () => new CreatePixApiStub(),
        },
      ]);
    }
  }
}
