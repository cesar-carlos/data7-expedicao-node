import { DI_BIND } from '../di/bind.tokens';
import { getLocalDbContext } from '../di/database.context';
import AppDependencys from '../aplication/app.dependencys';
import LocalBaseConsultaRepositoryContract from '../contracts/local.base.consulta.repository.contract';
import UsuarioConsultaDto from '../dto/common.data/usuario.consulta.dto';
import { Params, Pagination, OrderBy } from '../contracts/local.base.params';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  offset: number;
}

export default class UsuarioConsultaService {
  /**
   * Consultar todos os usuários com paginação
   * @param page Número da página (inicia em 1)
   * @param limit Quantidade de registros por página
   * @returns Resultado paginado com dados e metadados
   */
  public async consultarTodos(page: number = 1, limit: number = 100): Promise<PaginatedResult<UsuarioConsultaDto>> {
    try {
      this.validatePagination(page, limit);
      const repository = this.repository();

      const pagination = Pagination.create(limit, (page - 1) * limit, page);
      const orderBy = OrderBy.create('CodUsuario', 'ASC');

      // Buscar os dados paginados
      const usuarios = await repository.selectWhere([], pagination, orderBy);

      // Para obter o total, fazemos uma consulta sem limite nem ordenação
      const allUsuarios = await repository.selectWhere([]);
      const total = allUsuarios.length;
      const totalPages = Math.ceil(total / limit);

      return {
        data: usuarios,
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
      throw new Error(`Erro ao consultar usuários: ${error.message}`);
    }
  }

  /**
   * Consultar usuário específico por código
   * @param codUsuario Código único do usuário
   * @returns Dados do usuário ou null se não encontrado
   */
  public async consultarPorCodigo(codUsuario: number): Promise<UsuarioConsultaDto | null> {
    try {
      if (!codUsuario || codUsuario <= 0) {
        throw new Error('Código do usuário deve ser um número positivo');
      }

      const repository = this.repository();
      const params = [Params.equals('CodUsuario', codUsuario)];
      const usuarios = await repository.selectWhere(params);

      if (usuarios.length === 0) {
        return null;
      }

      return usuarios[0];
    } catch (error: any) {
      console.error('Erro ao consultar usuário por código:', {
        error: error.message,
        stack: error.stack,
        codUsuario,
      });
      throw new Error(`Erro ao consultar usuário por código: ${error.message}`);
    }
  }

  /**
   * Consultar usuários por nome com paginação (busca com LIKE)
   * @param nome Nome ou parte do nome para buscar
   * @param page Número da página (inicia em 1)
   * @param limit Quantidade de registros por página
   * @returns Resultado paginado com dados e metadados
   */
  public async consultarPorNome(
    nome: string,
    page: number = 1,
    limit: number = 100,
  ): Promise<PaginatedResult<UsuarioConsultaDto>> {
    try {
      this.validatePagination(page, limit);
      if (!nome || nome.trim().length === 0) {
        throw new Error('Nome é obrigatório para a busca');
      }

      const repository = this.repository();

      const pagination = Pagination.create(limit, (page - 1) * limit, page);
      const orderBy = OrderBy.create('NomeUsuario', 'ASC');
      const params = [Params.like('NomeUsuario', `%${nome}%`)];

      // Buscar os dados paginados
      const usuarios = await repository.selectWhere(params, pagination, orderBy);

      // Para obter o total, buscar todos os registros que atendem ao critério
      const allUsuarios = await repository.selectWhere(params);
      const total = allUsuarios.length;
      const totalPages = Math.ceil(total / limit);

      return {
        data: usuarios,
        total,
        page,
        limit,
        totalPages,
        offset: pagination.offset,
      };
    } catch (error: any) {
      console.error('Erro ao consultar usuário por nome:', {
        error: error.message,
        stack: error.stack,
        nome,
        page,
        limit,
      });
      throw new Error(`Erro ao consultar usuário por nome: ${error.message}`);
    }
  }

  /**
   * Consultar apenas usuários ativos com paginação
   * @param page Número da página (inicia em 1)
   * @param limit Quantidade de registros por página
   * @returns Resultado paginado com dados e metadados
   */
  public async consultarAtivos(page: number = 1, limit: number = 100): Promise<PaginatedResult<UsuarioConsultaDto>> {
    try {
      this.validatePagination(page, limit);
      const repository = this.repository();

      const pagination = Pagination.create(limit, (page - 1) * limit, page);
      const orderBy = OrderBy.create('NomeUsuario', 'ASC');
      const params = [Params.equals('Ativo', 'S')];

      // Buscar os dados paginados
      const usuarios = await repository.selectWhere(params, pagination, orderBy);

      // Para obter o total, buscar todos os usuários ativos
      const allUsuarios = await repository.selectWhere(params);
      const total = allUsuarios.length;
      const totalPages = Math.ceil(total / limit);

      return {
        data: usuarios,
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
   * Consultar usuários por empresa com paginação
   * @param codEmpresa Código da empresa
   * @param page Número da página (inicia em 1)
   * @param limit Quantidade de registros por página
   * @returns Resultado paginado com dados e metadados
   */
  public async consultarPorEmpresa(
    codEmpresa: number,
    page: number = 1,
    limit: number = 100,
  ): Promise<PaginatedResult<UsuarioConsultaDto>> {
    try {
      this.validatePagination(page, limit);
      if (!codEmpresa || codEmpresa <= 0) {
        throw new Error('Código da empresa deve ser um número positivo');
      }

      const repository = this.repository();

      const pagination = Pagination.create(limit, (page - 1) * limit, page);
      const orderBy = OrderBy.create('NomeUsuario', 'ASC');
      const params = [Params.equals('CodEmpresa', codEmpresa)];

      // Buscar os dados paginados
      const usuarios = await repository.selectWhere(params, pagination, orderBy);

      // Para obter o total, buscar todos os usuários da empresa
      const allUsuarios = await repository.selectWhere(params);
      const total = allUsuarios.length;
      const totalPages = Math.ceil(total / limit);

      return {
        data: usuarios,
        total,
        page,
        limit,
        totalPages,
        offset: pagination.offset,
      };
    } catch (error: any) {
      console.error('Erro ao consultar usuários por empresa:', {
        error: error.message,
        stack: error.stack,
        codEmpresa,
        page,
        limit,
      });
      throw new Error(`Erro ao consultar usuários por empresa: ${error.message}`);
    }
  }

  /**
   * Consultar usuários por status ativo/inativo com paginação
   * @param ativo Status do usuário ('S' para ativo, 'N' para inativo)
   * @param page Número da página (inicia em 1)
   * @param limit Quantidade de registros por página
   * @returns Resultado paginado com dados e metadados
   */
  public async consultarPorStatus(
    ativo: 'S' | 'N',
    page: number = 1,
    limit: number = 100,
  ): Promise<PaginatedResult<UsuarioConsultaDto>> {
    try {
      this.validatePagination(page, limit);
      if (ativo !== 'S' && ativo !== 'N') {
        throw new Error('Status deve ser "S" para ativo ou "N" para inativo');
      }

      const repository = this.repository();

      const pagination = Pagination.create(limit, (page - 1) * limit, page);
      const orderBy = OrderBy.create('NomeUsuario', 'ASC');
      const params = [Params.equals('Ativo', ativo)];

      // Buscar os dados paginados
      const usuarios = await repository.selectWhere(params, pagination, orderBy);

      // Para obter o total, buscar todos os usuários com o status
      const allUsuarios = await repository.selectWhere(params);
      const total = allUsuarios.length;
      const totalPages = Math.ceil(total / limit);

      return {
        data: usuarios,
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
      const usuarios = await repository.selectWhere([]);
      return usuarios.length;
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
      const usuarios = await repository.selectWhere(params);
      return usuarios.length;
    } catch (error: any) {
      console.error('Erro ao contar usuários ativos:', {
        error: error.message,
        stack: error.stack,
      });
      throw new Error(`Erro ao contar usuários ativos: ${error.message}`);
    }
  }

  /**
   * Contar usuários por empresa
   * @param codEmpresa Código da empresa
   * @returns Número de usuários da empresa
   */
  public async contarUsuariosPorEmpresa(codEmpresa: number): Promise<number> {
    try {
      if (!codEmpresa || codEmpresa <= 0) {
        throw new Error('Código da empresa deve ser um número positivo');
      }

      const repository = this.repository();
      const params = [Params.equals('CodEmpresa', codEmpresa)];
      const usuarios = await repository.selectWhere(params);
      return usuarios.length;
    } catch (error: any) {
      console.error('Erro ao contar usuários por empresa:', {
        error: error.message,
        stack: error.stack,
        codEmpresa,
      });
      throw new Error(`Erro ao contar usuários por empresa: ${error.message}`);
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
    return AppDependencys.resolve<LocalBaseConsultaRepositoryContract<UsuarioConsultaDto>>({
      context: getLocalDbContext(),
      bind: DI_BIND.LocalBaseConsultaRepositoryContract_UsuarioConsultaDto,
    });
  }
}
