import { getLocalDbContext } from '../../di/database.context';
import { DI_BIND } from '../../di/bind.tokens';
import { pageLimitForGroups, Params, Pagination, OrderBy } from '../../contracts/local.base.params';

import AppDependencys from '../../aplication/app.dependencys';
import LocalBaseRepositoryContract from '../../contracts/local.base.repository.contract';
import LocalBaseConsultaRepositoryContract from '../../contracts/local.base.consulta.repository.contract';
import SqlServerExpedicaoItemSepararRepository from '../../repository/expedicao/sql.server.expedicao.item.separar.repository';
import SqlServerExpedicaoSepararItemConsultaRepository from '../../repository/expedicao/sql.server.expedicao.item.separar.consulta.repository';
import ExpedicaoItemSepararUnidadeMedidaConsultaDto from '../../dto/expedicao/expedicao.item.separar.unidade.medida.consulta.dto';
import ExpedicaoItemSepararConsultaDto from '../../dto/expedicao/expedicao.item.separar.consulta.dto';
import ExpedicaoItemSepararDto from '../../dto/expedicao/expedicao.item.separar.dto';
import { wrapRepositoryError } from '../../utils/repository.error';

export default class SepararItemRepository {
  public async consulta(
    params: Params[] = [],
    pagination?: Pagination,
    orderBy?: OrderBy,
  ): Promise<ExpedicaoItemSepararConsultaDto[]> {
    const repository = this.repositoryConsulta();
    const result = await repository.selectWhere(params, pagination, orderBy);
    return result as ExpedicaoItemSepararConsultaDto[];
  }

  public async consultaAny(
    groups: Params[][],
    pagination?: Pagination,
    orderBy?: OrderBy,
  ): Promise<ExpedicaoItemSepararConsultaDto[]> {
    if (groups.length === 0) return [];
    const repository = this.repositoryConsultaSql();
    return repository.selectWhereAny(groups, pagination ?? Pagination.create(pageLimitForGroups(groups.length)), orderBy);
  }

  public async consultaUnidadeMedida(
    params: Params[] = [],
    pagination?: Pagination,
    orderBy?: OrderBy,
  ): Promise<ExpedicaoItemSepararUnidadeMedidaConsultaDto[]> {
    try {
      const repository = this.repositoryUnidadeMedidaConsulta();
      const result = await repository.selectWhere(params, pagination, orderBy);
      return result as ExpedicaoItemSepararUnidadeMedidaConsultaDto[];
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async select(
    params: Params[] = [],
    pagination?: Pagination,
    orderBy?: OrderBy,
  ): Promise<ExpedicaoItemSepararDto[]> {
    try {
      const repository = this.repository();
      return await repository.selectWhere(params, pagination, orderBy);
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async insert(models: ExpedicaoItemSepararDto[]): Promise<ExpedicaoItemSepararDto[]> {
    try {
      const repository = this.repositorySpecific();
      const inserteds: ExpedicaoItemSepararDto[] = [];

      for (const el of models) {
        const inserted = await repository.insertWithReturn(el);
        inserteds.push(inserted);
      }

      return inserteds;
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async update(models: ExpedicaoItemSepararDto[]): Promise<void> {
    try {
      const repository = this.repository();
      for (const el of models) {
        await repository.update(el);
      }
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async delete(models: ExpedicaoItemSepararDto[]): Promise<void> {
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
    return AppDependencys.resolve<LocalBaseConsultaRepositoryContract<ExpedicaoItemSepararConsultaDto>>({
      context: getLocalDbContext(),
      bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoItemSepararConsultaDto,
    });
  }

  private repositoryConsultaSql(): SqlServerExpedicaoSepararItemConsultaRepository {
    return this.repositoryConsulta() as SqlServerExpedicaoSepararItemConsultaRepository;
  }

  private repositoryUnidadeMedidaConsulta() {
    return AppDependencys.resolve<LocalBaseConsultaRepositoryContract<ExpedicaoItemSepararUnidadeMedidaConsultaDto>>({
      context: getLocalDbContext(),
      bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoItemSepararUnidadeMedidaConsultaDto,
    });
  }

  private repository() {
    return AppDependencys.resolve<LocalBaseRepositoryContract<ExpedicaoItemSepararDto>>({
      context: getLocalDbContext(),
      bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoItemSepararDto,
    });
  }

  private repositorySpecific(): SqlServerExpedicaoItemSepararRepository {
    return AppDependencys.resolve<SqlServerExpedicaoItemSepararRepository>({
      context: getLocalDbContext(),
      bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoItemSepararDto,
    }) as SqlServerExpedicaoItemSepararRepository;
  }
}
