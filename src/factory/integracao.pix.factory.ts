import ContractBaseRepository from '../contracts/base.repository.contract';
import DataBaseActiveContract from '../contracts/data.base.active.contract';
import LocalBaseRepositoryContract from '../contracts/local.base.repository.contract';
import CreatePixApiContract from '../contracts/create.pix.api.contract';
import DatabaseOnlineDto from '../dto/common.data/database.online.dto';
import ItemLiberacaoBloqueioDto from '../dto/common.data/item.liberacao.bloqueio.dto';
import CobrancaDigitalDto from '../dto/integracao/cobranca.digital.dto';
import CobrancaDigitalPagamentoDto from '../dto/integracao/cobranca.digital.pagamento.dto';
import CobrancaDigitalPixDto from '../dto/integracao/cobranca.digital.pix.dto';
import CobrancaDigitalTituloDto from '../dto/integracao/cobranca.digital.titulo.dto';
import CobrancaPix from '../entities/cobranca.pix';
import PagamentoPix from '../entities/pagamento.pix';
import { DI_BIND } from '../di/bind.tokens';
import { getLocalDbContext, getOnlineDbContext } from '../di/database.context';
import { resolveDependency, resolveLocalRepository, resolveOnlineRepository } from '../di/dependency.resolver';
import CancelamentoPixService from '../services/cancelamento.pix.service';
import CobrancaPixConsultaPagamentoService from '../services/cobranca.pix.consulta.pagamento.service';
import CobrancaPixLiberacaoBloqueioService from '../services/cobranca.pix.liberacao.bloqueio.service';
import CobrancaPixListenService from '../services/cobranca.pix.listen.service';
import DatabaseStatusService from '../services/database.status.service';
import RegraStatusCobrancaPixService from '../services/regra.status.cobranca.pix.service';

export function createCobrancaDigitalTituloRepository(): LocalBaseRepositoryContract<CobrancaDigitalTituloDto> {
  return resolveLocalRepository<CobrancaDigitalTituloDto>(DI_BIND.LocalBaseRepositoryContract_CobrancaDigitalTituloDto);
}

export function createCobrancaDigitalRepository(): LocalBaseRepositoryContract<CobrancaDigitalDto> {
  return resolveLocalRepository<CobrancaDigitalDto>(DI_BIND.LocalBaseRepositoryContract_CobrancaDigitalDto);
}

export function createCobrancaDigitalPixRepository(): LocalBaseRepositoryContract<CobrancaDigitalPixDto> {
  return resolveLocalRepository<CobrancaDigitalPixDto>(DI_BIND.LocalBaseRepositoryContract_CobrancaDigitalPixDto);
}

export function createCobrancaDigitalPagamentoRepository(): LocalBaseRepositoryContract<CobrancaDigitalPagamentoDto> {
  return resolveLocalRepository<CobrancaDigitalPagamentoDto>(DI_BIND.LocalBaseRepositoryContract_CobrancaDigitalPagamentoDto);
}

export function createItemLiberacaoBloqueioRepository(): LocalBaseRepositoryContract<ItemLiberacaoBloqueioDto> {
  return resolveLocalRepository<ItemLiberacaoBloqueioDto>(DI_BIND.LocalBaseRepositoryContract_ItemLiberacaoBloqueioDto);
}

export function createOnlineCobrancaRepository(): ContractBaseRepository<CobrancaPix> {
  return resolveOnlineRepository<CobrancaPix>(DI_BIND.ContractBaseRepository_CobrancaPix);
}

export function createOnlinePagamentoRepository(): ContractBaseRepository<PagamentoPix> {
  return resolveOnlineRepository<PagamentoPix>(DI_BIND.ContractBaseRepository_PagamentoPix);
}

export function createPixApiContract(apiContext: string): CreatePixApiContract {
  return resolveDependency<CreatePixApiContract>({
    context: apiContext,
    bind: DI_BIND.CreatePixApiContract,
  });
}

export function createDatabaseStatusRepositories(): DataBaseActiveContract<DatabaseOnlineDto>[] {
  return [
    resolveDependency<DataBaseActiveContract<DatabaseOnlineDto>>({
      context: getLocalDbContext(),
      bind: DI_BIND.DataBaseActiveContract_DatabaseOnlineDto,
    }),
    resolveDependency<DataBaseActiveContract<DatabaseOnlineDto>>({
      context: getOnlineDbContext(),
      bind: DI_BIND.DataBaseActiveContract_DatabaseOnlineDto,
    }),
  ];
}

export function createCancelamentoPixService(): CancelamentoPixService {
  return new CancelamentoPixService(createCobrancaDigitalTituloRepository(), createOnlineCobrancaRepository());
}

export function createCobrancaPixConsultaPagamentoService(): CobrancaPixConsultaPagamentoService {
  return new CobrancaPixConsultaPagamentoService(
    createCobrancaDigitalPixRepository(),
    createOnlinePagamentoRepository(),
  );
}

export function createCobrancaPixLiberacaoBloqueioService(): CobrancaPixLiberacaoBloqueioService {
  return new CobrancaPixLiberacaoBloqueioService(
    createCobrancaDigitalRepository(),
    createCobrancaDigitalTituloRepository(),
    createCobrancaDigitalPixRepository(),
    createItemLiberacaoBloqueioRepository(),
    createOnlineCobrancaRepository(),
    createOnlinePagamentoRepository(),
  );
}

export function createCobrancaPixListenService(): CobrancaPixListenService {
  return new CobrancaPixListenService(
    createOnlineCobrancaRepository(),
    createOnlinePagamentoRepository(),
    createCobrancaDigitalTituloRepository(),
    createCobrancaDigitalPagamentoRepository(),
  );
}

export function createDatabaseStatusService(): DatabaseStatusService {
  return new DatabaseStatusService(createDatabaseStatusRepositories());
}

export function createRegraStatusCobrancaPixService(): RegraStatusCobrancaPixService {
  return new RegraStatusCobrancaPixService(
    createItemLiberacaoBloqueioRepository(),
    createCobrancaDigitalRepository(),
    createOnlineCobrancaRepository(),
  );
}
