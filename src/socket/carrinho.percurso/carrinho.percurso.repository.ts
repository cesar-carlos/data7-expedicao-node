import { getLocalDbContext } from '../../di/database.context';
import { DI_BIND } from '../../di/bind.tokens';
import { pageLimitForGroups, Params, Pagination, OrderBy } from '../../contracts/local.base.params';

import AppDependencys from '../../aplication/app.dependencys';
import LocalBaseRepositoryContract from '../../contracts/local.base.repository.contract';
import ExpedicaoCarrinhoPercursoDto from '../../dto/expedicao/expedicao.carrinho.percurso.dto';
import LocalBaseConsultaRepositoryContract from '../../contracts/local.base.consulta.repository.contract';
import ExpedicaoCarrinhoPercursoEstagioConsultaDto from '../../dto/expedicao/expedicao.carrinho.percurso.estagio.consulta.dto';
import LocalBaseRepositorySequenceContract from '../../contracts/local.base.repository.sequence.contract';
import SequenceDto from '../../dto/common.data/sequence.dto';
import SqlServerExpedicaoCarrinhoPercursoRepository from '../../repository/expedicao/sql.server.expedicao.carrinho.percurso.repository';
import { wrapRepositoryError } from '../../utils/repository.error';

export default class CarrinhoPercursoRepository {
  public async consulta(
    params: Params[] = [],
    pagination?: Pagination,
    orderBy?: OrderBy,
  ): Promise<ExpedicaoCarrinhoPercursoEstagioConsultaDto[]> {
    try {
      const repository = this.repositoryConsulta();
      const result = await repository.selectWhere(params, pagination, orderBy);
      return result as ExpedicaoCarrinhoPercursoEstagioConsultaDto[];
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async select(
    params: Params[] = [],
    pagination?: Pagination,
    orderBy?: OrderBy,
  ): Promise<ExpedicaoCarrinhoPercursoDto[]> {
    try {
      const repository = this.repository();
      return await repository.selectWhere(params, pagination, orderBy);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Falha ao selecionar percurso';
      throw new Error(message);
    }
  }

  public async selectAny(
    groups: Params[][],
    pagination?: Pagination,
    orderBy?: OrderBy,
  ): Promise<ExpedicaoCarrinhoPercursoDto[]> {
    if (groups.length === 0) return [];
    return this.repositorySql().selectWhereAny(
      groups,
      pagination ?? Pagination.create(pageLimitForGroups(groups.length, 2)),
      orderBy,
    );
  }

  public async insert(models: ExpedicaoCarrinhoPercursoDto[]): Promise<void> {
    try {
      const repository = this.repository();
      for (const el of models) {
        await repository.insert(el);
      }
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async update(models: ExpedicaoCarrinhoPercursoDto[]): Promise<void> {
    try {
      const repository = this.repository();
      for (const el of models) {
        await repository.update(el);
      }
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  public async delete(models: ExpedicaoCarrinhoPercursoDto[]): Promise<void> {
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
      const name = 'CarrinhoPercurso_Sequencia_1';
      const repository = this.sequenceRepository();
      return await repository.select(name);
    } catch (error: unknown) {
      throw wrapRepositoryError(error);
    }
  }

  private repositoryConsulta() {
    return AppDependencys.resolve<LocalBaseConsultaRepositoryContract<ExpedicaoCarrinhoPercursoEstagioConsultaDto>>({
      context: getLocalDbContext(),
      bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoCarrinhoPercursoEstagioConsultaDto,
    });
  }

  private repositorySql(): SqlServerExpedicaoCarrinhoPercursoRepository {
    return AppDependencys.resolve<SqlServerExpedicaoCarrinhoPercursoRepository>({
      context: getLocalDbContext(),
      bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoCarrinhoPercursoDto,
    });
  }

  private repository() {
    return AppDependencys.resolve<LocalBaseRepositoryContract<ExpedicaoCarrinhoPercursoDto>>({
      context: getLocalDbContext(),
      bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoCarrinhoPercursoDto,
    });
  }

  private sequenceRepository() {
    return AppDependencys.resolve<LocalBaseRepositorySequenceContract<SequenceDto>>({
      context: getLocalDbContext(),
      bind: DI_BIND.LocalBaseRepositorySequenceContract_SequenceDto,
    });
  }
}
