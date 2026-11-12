import { getLocalDbContext } from '../../di/database.context';
import { DI_BIND } from '../../di/bind.tokens';
import { pageLimitForGroups, Params, Pagination, OrderBy } from '../../contracts/local.base.params';

import LocalBaseRepositoryContract from '../../contracts/local.base.repository.contract';
import LocalBaseConsultaRepositoryContract from '../../contracts/local.base.consulta.repository.contract';
import ExpedicaoItemConferenciaConsultaDto from '../../dto/expedicao/expedicao.item.conferencia.consulta.dto';
import ExpedicaoItemConferenciaDto from '../../dto/expedicao/expedicao.item.conferencia.dto';
import AppDependencys from '../../aplication/app.dependencys';
import SqlServerExpedicaoItemConferenciaRepository from '../../repository/expedicao/sql.server.expedicao.item.conferencia.repository';
import SqlServerExpedicaoItemConferenciaConsultaRepository, {
  type ConferenciaQuantidadeTotal,
} from '../../repository/expedicao/sql.server.expedicao.item.conferencia.consulta.repository';
import { wrapRepositoryError } from '../../utils/repository.error';

export default class ConferenciaItemRepository {
  public async consultaAny(
    groups: Params[][],
    pagination?: Pagination,
    orderBy?: OrderBy,
  ): Promise<ExpedicaoItemConferenciaConsultaDto[]> {
    if (groups.length === 0) return [];
    return this.repositoryConsultaSql().selectWhereAny(
      groups,
      pagination ?? Pagination.create(pageLimitForGroups(groups.length)),
      orderBy,
    );
  }

  public async sumQuantidadeAtiva(groups: Params[][]): Promise<ConferenciaQuantidadeTotal[]> {
    return this.repositoryConsultaSql().sumQuantidadeAtiva(groups);
  }

  public async consulta(
    params: Params[] = [],
    pagination?: Pagination,
    orderBy?: OrderBy,
  ): Promise<ExpedicaoItemConferenciaConsultaDto[]> {
    const repository = this.repositoryConsulta();
    const result = await repository.selectWhere(params, pagination, orderBy);
    return result as ExpedicaoItemConferenciaConsultaDto[];
  }

  public async select(
    params: Params[] = [],
    pagination?: Pagination,
    orderBy?: OrderBy,
  ): Promise<ExpedicaoItemConferenciaDto[]> {
    try {
      const repository = this.repository();
      return await repository.selectWhere(params, pagination, orderBy);
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async insert(models: ExpedicaoItemConferenciaDto[]): Promise<ExpedicaoItemConferenciaDto[]> {
    try {
      const repository = this.repositorySpecific();
      const inserteds: ExpedicaoItemConferenciaDto[] = [];

      for (const el of models) {
        const inserted = await repository.insertWithReturn(el);
        inserteds.push(inserted);
      }

      return inserteds;
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async update(models: ExpedicaoItemConferenciaDto[]): Promise<void> {
    try {
      const repository = this.repository();
      for (const el of models) {
        await repository.update(el);
      }
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async delete(models: ExpedicaoItemConferenciaDto[]): Promise<void> {
    try {
      const repository = this.repository();
      for (const el of models) {
        await repository.delete(el);
      }
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  private repositoryConsulta() {
    return AppDependencys.resolve<LocalBaseConsultaRepositoryContract<ExpedicaoItemConferenciaConsultaDto>>({
      context: getLocalDbContext(),
      bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoItemConferenciaConsultaDto,
    });
  }

  private repositoryConsultaSql(): SqlServerExpedicaoItemConferenciaConsultaRepository {
    return this.repositoryConsulta() as SqlServerExpedicaoItemConferenciaConsultaRepository;
  }

  private repository() {
    return AppDependencys.resolve<LocalBaseRepositoryContract<ExpedicaoItemConferenciaDto>>({
      context: getLocalDbContext(),
      bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoItemConferenciaDto,
    });
  }

  private repositorySpecific(): SqlServerExpedicaoItemConferenciaRepository {
    return AppDependencys.resolve<SqlServerExpedicaoItemConferenciaRepository>({
      context: getLocalDbContext(),
      bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoItemConferenciaDto,
    }) as SqlServerExpedicaoItemConferenciaRepository;
  }
}
