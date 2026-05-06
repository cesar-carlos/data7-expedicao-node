import { getLocalDbContext } from '../di/database.context';
import { DI_BIND } from '../di/bind.tokens';
import { Params, Pagination, OrderBy } from '../contracts/local.base.params';

import AppDependencys from '../aplication/app.dependencys';
import LocalBaseConsultaRepositoryContract from '../contracts/local.base.consulta.repository.contract';
import ExpedicaoVersaoAppConsultaDto from '../dto/expedicao/expedicao.versaoapp.consulta.dto';

export interface PaginatedResult {
  data: ExpedicaoVersaoAppConsultaDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  offset: number;
}

export default class ConsultaVersaoAppService {
  /**
   * Consultar todas as versões de app com paginação
   * @param page Número da página (inicia em 1)
   * @param limit Quantidade de registros por página
   * @returns Resultado paginado com dados e metadados
   */
  public async consultarTodos(page: number = 1, limit: number = 100): Promise<PaginatedResult> {
    try {
      this.validatePagination(page, limit);
      const repository = this.repository();

      const pagination = Pagination.create(limit, (page - 1) * limit, page);
      const orderBy = OrderBy.create('CodVersaoApp', 'DESC');

      // Buscar os dados paginados
      const versoes = await repository.selectWhere([], pagination, orderBy);

      // Para obter o total, fazemos uma consulta sem limite nem ordenação
      const allVersoes = await repository.selectWhere([]);
      const total = allVersoes.length;
      const totalPages = Math.ceil(total / limit);

      return {
        data: versoes,
        total,
        page,
        limit,
        totalPages,
        offset: pagination.offset,
      };
    } catch (error: any) {
      console.error('Erro ao consultar todas as versões de app:', {
        error: error.message,
        stack: error.stack,
        page,
        limit,
      });
      throw new Error(`Erro ao consultar todas as versões de app: ${error.message}`);
    }
  }

  /**
   * Consultar versões de app por nome com paginação (busca com LIKE)
   * @param nomeApp Nome ou parte do nome para buscar
   * @param page Número da página (inicia em 1)
   * @param limit Quantidade de registros por página
   * @returns Resultado paginado com dados e metadados
   */
  public async consultarPorNomeApp(nomeApp: string, page: number = 1, limit: number = 100): Promise<PaginatedResult> {
    try {
      this.validatePagination(page, limit);
      if (!nomeApp || nomeApp.trim().length === 0) {
        throw new Error('Nome do App é obrigatório para a busca');
      }
      const repository = this.repository();

      const pagination = Pagination.create(limit, (page - 1) * limit, page);
      const orderBy = OrderBy.create('NomeApp', 'ASC');
      const params = [Params.like('NomeApp', `%${nomeApp}%`)];

      // Buscar os dados paginados
      const versoes = await repository.selectWhere(params, pagination, orderBy);

      // Para obter o total, buscar todos os registros que atendem ao critério
      const allVersoes = await repository.selectWhere(params);
      const total = allVersoes.length;
      const totalPages = Math.ceil(total / limit);

      return {
        data: versoes,
        total,
        page,
        limit,
        totalPages,
        offset: pagination.offset,
      };
    } catch (error: any) {
      console.error('Erro ao consultar versões por nome do app:', {
        error: error.message,
        stack: error.stack,
        nomeApp,
        page,
        limit,
      });
      throw new Error(`Erro ao consultar versões por nome do app: ${error.message}`);
    }
  }

  /**
   * Consultar versão específica por código
   * @param codVersaoApp Código único da versão
   * @returns Dados da versão ou null se não encontrado
   */
  public async consultarPorCodigo(codVersaoApp: number): Promise<ExpedicaoVersaoAppConsultaDto | null> {
    try {
      if (!codVersaoApp || codVersaoApp <= 0) {
        throw new Error('Código da versão deve ser um número positivo');
      }
      const repository = this.repository();

      const params = [Params.equals('CodVersaoApp', codVersaoApp)];
      const versoes = await repository.selectWhere(params);

      if (versoes.length === 0) {
        return null;
      }

      return versoes[0];
    } catch (error: any) {
      console.error('Erro ao consultar versão por código:', {
        error: error.message,
        stack: error.stack,
        codVersaoApp,
      });
      throw new Error(`Erro ao consultar versão por código: ${error.message}`);
    }
  }

  /**
   * Consultar apenas versões ativas com paginação
   * @param page Número da página (inicia em 1)
   * @param limit Quantidade de registros por página
   * @returns Resultado paginado com dados e metadados
   */
  public async consultarAtivos(page: number = 1, limit: number = 100): Promise<PaginatedResult> {
    try {
      this.validatePagination(page, limit);
      const repository = this.repository();

      const pagination = Pagination.create(limit, (page - 1) * limit, page);
      const orderBy = OrderBy.create('NomeApp', 'ASC');
      const params = [Params.equals('Ativo', 'S')];

      // Buscar os dados paginados
      const versoes = await repository.selectWhere(params, pagination, orderBy);

      // Para obter o total, buscar todas as versões ativas
      const allVersoes = await repository.selectWhere(params);
      const total = allVersoes.length;
      const totalPages = Math.ceil(total / limit);

      return {
        data: versoes,
        total,
        page,
        limit,
        totalPages,
        offset: pagination.offset,
      };
    } catch (error: any) {
      console.error('Erro ao consultar versões ativas:', {
        error: error.message,
        stack: error.stack,
        page,
        limit,
      });
      throw new Error(`Erro ao consultar versões ativas: ${error.message}`);
    }
  }

  /**
   * Consultar versões por status ativo/inativo com paginação
   * @param ativo Status da versão ('S' para ativo, 'N' para inativo)
   * @param page Número da página (inicia em 1)
   * @param limit Quantidade de registros por página
   * @returns Resultado paginado com dados e metadados
   */
  public async consultarPorStatus(ativo: 'S' | 'N', page: number = 1, limit: number = 100): Promise<PaginatedResult> {
    try {
      this.validatePagination(page, limit);
      if (ativo !== 'S' && ativo !== 'N') {
        throw new Error('Status deve ser "S" para ativo ou "N" para inativo');
      }
      const repository = this.repository();

      const pagination = Pagination.create(limit, (page - 1) * limit, page);
      const orderBy = OrderBy.create('NomeApp', 'ASC');
      const params = [Params.equals('Ativo', ativo)];

      // Buscar os dados paginados
      const versoes = await repository.selectWhere(params, pagination, orderBy);

      // Para obter o total, buscar todas as versões com o status
      const allVersoes = await repository.selectWhere(params);
      const total = allVersoes.length;
      const totalPages = Math.ceil(total / limit);

      return {
        data: versoes,
        total,
        page,
        limit,
        totalPages,
        offset: pagination.offset,
      };
    } catch (error: any) {
      console.error('Erro ao consultar versões por status:', {
        error: error.message,
        stack: error.stack,
        ativo,
        page,
        limit,
      });
      throw new Error(`Erro ao consultar versões por status: ${error.message}`);
    }
  }

  /**
   * Validar se página e limit são válidos
   * @private
   */
  private validatePagination(page: number, limit: number): void {
    if (page < 1) {
      throw new Error('Página deve ser maior que 0');
    }
    if (limit < 1 || limit > 1000) {
      throw new Error('Limit deve estar entre 1 e 1000');
    }
  }

  private repository() {
    return AppDependencys.resolve<LocalBaseConsultaRepositoryContract<ExpedicaoVersaoAppConsultaDto>>({
      context: getLocalDbContext(),
      bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoVersaoAppConsultaDto,
    });
  }
}
