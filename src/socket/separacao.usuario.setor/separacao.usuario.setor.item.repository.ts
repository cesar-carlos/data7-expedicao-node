import { getLocalDbContext } from '../../di/database.context';
import { DI_BIND } from '../../di/bind.tokens';
import { Params, Pagination, OrderBy } from '../../contracts/local.base.params';

import LocalBaseRepositoryContract from '../../contracts/local.base.repository.contract';
import LocalBaseConsultaRepositoryContract from '../../contracts/local.base.consulta.repository.contract';
import ExpedicaoSeparacaoUsuarioSetorConsultaDto from '../../dto/expedicao/expedicao.separacao.usuario.setor.consulta.dto';
import SqlServerExpedicaoSeparacaoUsuarioSetorRepository from '../../repository/expedicao/sql.server.expedicao.separacao.usuario.setor.repository';
import ExpedicaoSeparacaoUsuarioSetorDto from '../../dto/expedicao/expedicao.separacao.usuario.setor.dto';
import AppDependencys from '../../aplication/app.dependencys';

export default class SeparacaoUsuarioSetorItemRepository {
  public async consulta(
    params: Params[] = [],
    pagination?: Pagination,
    orderBy?: OrderBy,
  ): Promise<ExpedicaoSeparacaoUsuarioSetorConsultaDto[]> {
    try {
      const repository = this.repositoryConsulta();
      const result = await repository.selectWhere(params, pagination, orderBy);
      return result as ExpedicaoSeparacaoUsuarioSetorConsultaDto[];
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async select(
    params: Params[] = [],
    pagination?: Pagination,
    orderBy?: OrderBy,
  ): Promise<ExpedicaoSeparacaoUsuarioSetorDto[]> {
    try {
      const repository = this.repository();
      return await repository.selectWhere(params, pagination, orderBy);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async insert(models: ExpedicaoSeparacaoUsuarioSetorDto[]): Promise<ExpedicaoSeparacaoUsuarioSetorDto[]> {
    try {
      const repository = this.repositorySpecific();
      const inserteds: ExpedicaoSeparacaoUsuarioSetorDto[] = [];

      for (const el of models) {
        const inserted = await repository.insertWithReturn(el);
        inserteds.push(inserted);
      }

      return inserteds;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async update(models: ExpedicaoSeparacaoUsuarioSetorDto[]): Promise<void> {
    try {
      const repository = this.repository();
      for (const el of models) {
        await repository.update(el);
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async delete(models: ExpedicaoSeparacaoUsuarioSetorDto[]): Promise<void> {
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
    return AppDependencys.resolve<LocalBaseConsultaRepositoryContract<ExpedicaoSeparacaoUsuarioSetorConsultaDto>>({
      context: getLocalDbContext(),
      bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoSeparacaoUsuarioSetorConsultaDto,
    });
  }

  private repository() {
    return AppDependencys.resolve<LocalBaseRepositoryContract<ExpedicaoSeparacaoUsuarioSetorDto>>({
      context: getLocalDbContext(),
      bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoSeparacaoUsuarioSetorDto,
    });
  }

  private repositorySpecific(): SqlServerExpedicaoSeparacaoUsuarioSetorRepository {
    return AppDependencys.resolve<SqlServerExpedicaoSeparacaoUsuarioSetorRepository>({
      context: getLocalDbContext(),
      bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoSeparacaoUsuarioSetorDto,
    }) as SqlServerExpedicaoSeparacaoUsuarioSetorRepository;
  }
}
