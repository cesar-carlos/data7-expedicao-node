import { getLocalDbContext } from '../../di/database.context';
import { DI_BIND } from '../../di/bind.tokens';
import { pageForSeparacaoItens, pageLimitForGroups, Params, Pagination, OrderBy } from '../../contracts/local.base.params';

import LocalBaseRepositoryContract from '../../contracts/local.base.repository.contract';
import LocalBaseConsultaRepositoryContract from '../../contracts/local.base.consulta.repository.contract';
import ExpedicaoItemSeparacaoResumoConsultaDto from '../../dto/expedicao/expedicao.item.separacao.resumo.consulta.dto';
import ExpedicaoItemSeparacaoConsultaDto from '../../dto/expedicao/expedicao.item.separacao.consulta.dto';
import ExpedicaoItemSeparacaoDto from '../../dto/expedicao/expedicao.item.separacao.dto';
import AppDependencys from '../../aplication/app.dependencys';
import SqlServerExpedicaoItemSeparacaoRepository from '../../repository/expedicao/sql.server.expedicao.item.separacao.repository';
import SqlServerExpedicaoItemSeparacaoConsultaRepository from '../../repository/expedicao/sql.server.expedicao.item.separacao.consulta.repository';

export default class SeparacaoItemRepository {
  public async consultaResumo(
    params: Params[] = [],
    pagination?: Pagination,
    orderBy?: OrderBy,
  ): Promise<ExpedicaoItemSeparacaoResumoConsultaDto[]> {
    try {
      const repository = this.repositoryResumoConsulta();
      const result = await repository.selectWhere(params, pagination, orderBy);
      return result as ExpedicaoItemSeparacaoResumoConsultaDto[];
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async sumQuantidadeAtiva(produto: {
    CodEmpresa: number;
    CodSepararEstoque: number;
    CodProduto: number;
  }): Promise<number> {
    return this.repositorySpecific().sumQuantidadeAtiva(produto);
  }

  public async consultaAny(
    groups: Params[][],
    pagination?: Pagination,
    orderBy?: OrderBy,
  ): Promise<ExpedicaoItemSeparacaoConsultaDto[]> {
    if (groups.length === 0) return [];
    return this.repositoryConsultaSql().selectWhereAny(
      groups,
      pagination ?? Pagination.create(pageLimitForGroups(groups.length)),
      orderBy,
    );
  }

  public async consulta(
    params: Params[] = [],
    pagination?: Pagination,
    orderBy?: OrderBy,
  ): Promise<ExpedicaoItemSeparacaoConsultaDto[]> {
    try {
      const repository = this.repositoryConsulta();
      const result = await repository.selectWhere(params, pageForSeparacaoItens(pagination), orderBy);
      return result as ExpedicaoItemSeparacaoConsultaDto[];
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async select(
    params: Params[] = [],
    pagination?: Pagination,
    orderBy?: OrderBy,
  ): Promise<ExpedicaoItemSeparacaoDto[]> {
    try {
      const repository = this.repository();
      return await repository.selectWhere(params, pageForSeparacaoItens(pagination), orderBy);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async insert(models: ExpedicaoItemSeparacaoDto[]): Promise<ExpedicaoItemSeparacaoDto[]> {
    try {
      const repository = this.repositorySpecific();
      const inserteds: ExpedicaoItemSeparacaoDto[] = [];

      for (const el of models) {
        const inserted = await repository.insertWithReturn(el);
        inserteds.push(inserted);
      }

      return inserteds;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async update(models: ExpedicaoItemSeparacaoDto[]): Promise<void> {
    try {
      const repository = this.repository();
      for (const el of models) {
        await repository.update(el);
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async delete(models: ExpedicaoItemSeparacaoDto[]): Promise<void> {
    try {
      const repository = this.repository();
      for (const el of models) {
        await repository.delete(el);
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  private repositoryConsulta() {
    return AppDependencys.resolve<LocalBaseConsultaRepositoryContract<ExpedicaoItemSeparacaoConsultaDto>>({
      context: getLocalDbContext(),
      bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoItemSeparacaoConsultaDto,
    });
  }

  private repositoryConsultaSql(): SqlServerExpedicaoItemSeparacaoConsultaRepository {
    return this.repositoryConsulta() as SqlServerExpedicaoItemSeparacaoConsultaRepository;
  }

  private repositoryResumoConsulta() {
    return AppDependencys.resolve<LocalBaseConsultaRepositoryContract<ExpedicaoItemSeparacaoResumoConsultaDto>>({
      context: getLocalDbContext(),
      bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoItemSeparacaoResumoConsultaDto,
    });
  }

  private repository() {
    return AppDependencys.resolve<LocalBaseRepositoryContract<ExpedicaoItemSeparacaoDto>>({
      context: getLocalDbContext(),
      bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoItemSeparacaoDto,
    });
  }

  private repositorySpecific(): SqlServerExpedicaoItemSeparacaoRepository {
    return AppDependencys.resolve<SqlServerExpedicaoItemSeparacaoRepository>({
      context: getLocalDbContext(),
      bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoItemSeparacaoDto,
    }) as SqlServerExpedicaoItemSeparacaoRepository;
  }
}
