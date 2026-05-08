import { getLocalDbContext } from '../di/database.context';
import { DI_BIND } from '../di/bind.tokens';
import { Params, Pagination, OrderBy } from '../contracts/local.base.params';

import AppDependencys from '../aplication/app.dependencys';
import LocalBaseConsultaRepositoryContract from '../contracts/local.base.consulta.repository.contract';
import ExpedicaoLoginAppConsultaDto from '../dto/expedicao/expedicao.login.app.consulta.dto';

export interface PaginatedResult {
  data: ExpedicaoLoginAppConsultaDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  offset: number;
}

export default class ConsultaLoginAppService {
  /**
   * Consultar todos os usuários com paginação
   * @param page Número da página (inicia em 1)
   * @param limit Quantidade de registros por página
   * @returns Resultado paginado com dados e metadados
   */
  public async consultarTodos(page: number = 1, limit: number = 100): Promise<PaginatedResult> {
    try {
      this.validatePagination(page, limit);
      const repository = this.repository();

      const pagination = Pagination.create(limit, (page - 1) * limit, page);
      const orderBy = OrderBy.create('CodLoginApp', 'ASC');

      // Buscar os dados paginados
      const users = await repository.selectWhere([], pagination, orderBy);

      // Para obter o total, fazemos uma consulta sem limite nem ordenação
      const allUsers = await repository.selectWhere([]);
      const total = allUsers.length;
      const totalPages = Math.ceil(total / limit);

      return {
        data: users,
        total,
        page,
        limit,
        totalPages,
        offset: pagination.offset,
      };
    } catch (error: any) {
      console.error('Erro ao consultar todos os usuários:', {
        error: error.message,
        stack: error.stack,
        page,
        limit,
      });
      throw new Error(`Erro ao consultar todos os usuários: ${error.message}`);
    }
  }

  /**
   * Consultar usuários por nome com paginação (busca com LIKE)
   * @param nome Nome ou parte do nome para buscar
   * @param page Número da página (inicia em 1)
   * @param limit Quantidade de registros por página
   * @returns Resultado paginado com dados e metadados
   */
  public async consultarPorNome(nome: string, page: number = 1, limit: number = 100): Promise<PaginatedResult> {
    try {
      this.validatePagination(page, limit);
      if (!nome || nome.trim().length === 0) {
        throw new Error('Nome é obrigatório para a busca');
      }
      const repository = this.repository();

      const pagination = Pagination.create(limit, (page - 1) * limit, page);
      const orderBy = OrderBy.create('Nome', 'ASC');
      const params = [Params.like('Nome', `%${nome}%`)];

      // Buscar os dados paginados
      const users = await repository.selectWhere(params, pagination, orderBy);

      // Para obter o total, buscar todos os registros que atendem ao critério
      const allUsers = await repository.selectWhere(params);
      const total = allUsers.length;
      const totalPages = Math.ceil(total / limit);

      return {
        data: users,
        total,
        page,
        limit,
        totalPages,
        offset: pagination.offset,
      };
    } catch (error: any) {
      console.error('Erro ao consultar usuários por nome:', {
        error: error.message,
        stack: error.stack,
        nome,
        page,
        limit,
      });
      throw new Error(`Erro ao consultar usuários por nome: ${error.message}`);
    }
  }

  /**
   * Consultar usuário específico por código
   * @param codLoginApp Código único do usuário
   * @returns Dados do usuário ou null se não encontrado
   */
  public async consultarPorCodigo(codLoginApp: number): Promise<ExpedicaoLoginAppConsultaDto | null> {
    try {
      if (!codLoginApp || codLoginApp <= 0) {
        throw new Error('Código do usuário deve ser um número positivo');
      }
      const repository = this.repository();

      const params = [Params.equals('CodLoginApp', codLoginApp)];
      const users = await repository.selectWhere(params);

      if (users.length === 0) {
        return null;
      }

      return users[0];
    } catch (error: any) {
      console.error('Erro ao consultar usuário por código:', {
        error: error.message,
        stack: error.stack,
        codLoginApp,
      });
      throw new Error(`Erro ao consultar usuário por código: ${error.message}`);
    }
  }

  /**
   * Consultar apenas usuários ativos com paginação
   * @param page Número da página (inicia em 1)
   * @param limit Quantidade de registros por página
   * @returns Resultado paginado com dados e metadados
   */
  public async consultarAtivos(page: number = 1, limit: number = 100): Promise<PaginatedResult> {
    try {
      this.validatePagination(page, limit);
      const repository = this.repository();

      const pagination = Pagination.create(limit, (page - 1) * limit, page);
      const orderBy = OrderBy.create('Nome', 'ASC');
      const params = [Params.equals('Ativo', 'S')];

      // Buscar os dados paginados
      const users = await repository.selectWhere(params, pagination, orderBy);

      // Para obter o total, buscar todos os usuários ativos
      const allUsers = await repository.selectWhere(params);
      const total = allUsers.length;
      const totalPages = Math.ceil(total / limit);

      return {
        data: users,
        total,
        page,
        limit,
        totalPages,
        offset: pagination.offset,
      };
    } catch (error: any) {
      console.error('Erro ao consultar usuários ativos:', {
        error: error.message,
        stack: error.stack,
        page,
        limit,
      });
      throw new Error(`Erro ao consultar usuários ativos: ${error.message}`);
    }
  }

  /**
   * Consultar usuários por status ativo/inativo com paginação
   * @param ativo Status do usuário ('S' para ativo, 'N' para inativo)
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
      const orderBy = OrderBy.create('Nome', 'ASC');
      const params = [Params.equals('Ativo', ativo)];

      // Buscar os dados paginados
      const users = await repository.selectWhere(params, pagination, orderBy);

      // Para obter o total, buscar todos os usuários com o status
      const allUsers = await repository.selectWhere(params);
      const total = allUsers.length;
      const totalPages = Math.ceil(total / limit);

      return {
        data: users,
        total,
        page,
        limit,
        totalPages,
        offset: pagination.offset,
      };
    } catch (error: any) {
      console.error('Erro ao consultar usuários por status:', {
        error: error.message,
        stack: error.stack,
        ativo,
        page,
        limit,
      });
      throw new Error(`Erro ao consultar usuários por status: ${error.message}`);
    }
  }

  /**
   * Contar total de usuários no sistema
   * @returns Número total de usuários
   */
  public async contarUsuarios(): Promise<number> {
    try {
      const repository = this.repository();
      const users = await repository.selectWhere([]);
      return users.length;
    } catch (error: any) {
      console.error('Erro ao contar usuários:', {
        error: error.message,
        stack: error.stack,
      });
      throw new Error(`Erro ao contar usuários: ${error.message}`);
    }
  }

  /**
   * Contar usuários ativos no sistema
   * @returns Número de usuários ativos
   */
  public async contarUsuariosAtivos(): Promise<number> {
    try {
      const repository = this.repository();
      const params = [Params.equals('Ativo', 'S')];
      const users = await repository.selectWhere(params);
      return users.length;
    } catch (error: any) {
      console.error('Erro ao contar usuários ativos:', {
        error: error.message,
        stack: error.stack,
      });
      throw new Error(`Erro ao contar usuários ativos: ${error.message}`);
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
    return AppDependencys.resolve<LocalBaseConsultaRepositoryContract<ExpedicaoLoginAppConsultaDto>>({
      context: getLocalDbContext(),
      bind: DI_BIND.LocalBaseConsultaRepositoryContract_ExpedicaoLoginAppConsultaDto,
    });
  }
}
