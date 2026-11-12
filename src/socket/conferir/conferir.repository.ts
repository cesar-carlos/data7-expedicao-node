import { getLocalDbContext } from '../../di/database.context';
import { DI_BIND } from '../../di/bind.tokens';
import { pageLimitForGroups, Params, Pagination, OrderBy } from '../../contracts/local.base.params';

import AppDependencys from '../../aplication/app.dependencys';
import LocalBaseRepositoryContract from '../../contracts/local.base.repository.contract';
import LocalBaseRepositorySequenceContract from '../../contracts/local.base.repository.sequence.contract';
import ExpedicaoCarrinhoConferirConsultaDto from '../../dto/expedicao/expedicao.carrinho.conferir.consulta.dto';
import LocalBaseConsultaRepositoryContract from '../../contracts/local.base.consulta.repository.contract';
import ExpedicaoConferirConsultaDto from '../../dto/expedicao/expedicao.conferir.consulta.dto';
import ExpedicaoConferirDto from '../../dto/expedicao/expedicao.conferir.dto';
import SequenceDto from '../../dto/common.data/sequence.dto';
import SqlServerExpedicaoConferirConsultaRepository from '../../repository/expedicao/sql.server.expedicao.conferir.consulta.repository';
import { wrapRepositoryError } from '../../utils/repository.error';

export default class ConferirRepository {
  public async consulta(
    params: Params[] = [],
    pagination?: Pagination,
    orderBy?: OrderBy,
  ): Promise<ExpedicaoConferirConsultaDto[]> {
    try {
      const repository = this.repositoryConsulta();
      const result = await repository.selectWhere(params, pagination, orderBy);
      return result as ExpedicaoConferirConsultaDto[];
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Falha ao consultar conferir';
      throw new Error(message);
    }
  }

  public async consultaAny(
    groups: Params[][],
    pagination?: Pagination,
    orderBy?: OrderBy,
  ): Promise<ExpedicaoConferirConsultaDto[]> {
    if (groups.length === 0) return [];
    return this.repositoryConsultaSql().selectWhereAny(
      groups,
      pagination ?? Pagination.create(pageLimitForGroups(groups.length, 2)),
      orderBy,
    );
  }

  public async carrinhoConferirConsulta(
    params: Params[] = [],
    pagination?: Pagination,
    orderBy?: OrderBy,
  ): Promise<ExpedicaoCarrinhoConferirConsultaDto[]> {
    try {
      const repository = this.repositoryCarrinhoConferirConsulta();
      const result = await repository.selectWhere(params, pagination, orderBy);
      return result as ExpedicaoCarrinhoConferirConsultaDto[];
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async select(
    params: Params[] = [],
    pagination?: Pagination,
    orderBy?: OrderBy,
  ): Promise<ExpedicaoConferirDto[]> {
    try {
      const repository = this.repository();
      return await repository.selectWhere(params, pagination, orderBy);
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async insert(models: ExpedicaoConferirDto[]): Promise<void> {
    try {
      const repository = this.repository();
      for (const el of models) {
        await repository.insert(el);
      }
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async update(models: ExpedicaoConferirDto[]): Promise<void> {
    try {
      const repository = this.repository();
      for (const el of models) {
        await repository.update(el);
      }
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async delete(models: ExpedicaoConferirDto[]): Promise<void> {
    try {
      const repository = this.repository();
      for (const el of models) {
        await repository.delete(el);
      }
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async sequence(): Promise<SequenceDto | undefined> {
    try {
      const name = 'Expedicao.ConferirEstoque_Sequencia_1';
      const repository = this.sequenceRepository();
      return await repository.select(name);
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  private repository() {
    return AppDependencys.resolve<LocalBaseRepositoryContract<ExpedicaoConferirDto>>({
      context: getLocalDbContext(),
      bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoConferirDto,
    });
  }

  private repositoryConsultaSql(): SqlServerExpedicaoConferirConsultaRepository {
    return AppDependencys.resolve<SqlServerExpedicaoConferirConsultaRepository>({
      context: getLocalDbContext(),
      bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoConferirConsultaDto,
    });
  }

  private repositoryConsulta() {
    return AppDependencys.resolve<LocalBaseConsultaRepositoryContract<ExpedicaoConferirConsultaDto>>({
      context: getLocalDbContext(),
      bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoConferirConsultaDto,
    });
  }

  private repositoryCarrinhoConferirConsulta() {
    return AppDependencys.resolve<LocalBaseConsultaRepositoryContract<ExpedicaoCarrinhoConferirConsultaDto>>({
      context: getLocalDbContext(),
      bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoCarrinhoConferirConsultaDto,
    });
  }

  private sequenceRepository() {
    return AppDependencys.resolve<LocalBaseRepositorySequenceContract<SequenceDto>>({
      context: getLocalDbContext(),
      bind: DI_BIND.LocalBaseRepositorySequenceContract_SequenceDto,
    });
  }
}
