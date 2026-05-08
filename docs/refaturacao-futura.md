# 🏗️ Refatoração Futura - DDD + Clean Architecture

## 📋 Análise da Estrutura Atual

### **Estrutura Atual (Layers Tradicionais)**

```
src/
├── aplication/          # Configuração da aplicação
├── controllers/         # Controladores HTTP
├── services/           # Lógica de negócio
├── repository/         # Acesso a dados
├── entities/           # Entidades de domínio
├── dto/               # Data Transfer Objects
├── contracts/         # Interfaces/Contratos
├── infra/             # Infraestrutura
├── validation/        # Validações (Zod)
├── middleware/        # Middlewares
└── route/            # Rotas
```

### **Pontos Positivos Identificados**

1. ✅ **Separação de responsabilidades** - Controllers, Services, Repositories
2. ✅ **Injeção de dependência** - Container de dependências implementado
3. ✅ **Validação com Zod** - Validação robusta de dados
4. ✅ **Contratos/Interfaces** - Abstrações bem definidas
5. ✅ **Paginação** - Sistema de paginação implementado
6. ✅ **Múltiplos bancos** - SQL Server, Sybase, Firebase

### **Problemas para Refatoração DDD**

1. ❌ **Entities anêmicas** - Apenas dados, sem comportamento
2. ❌ **Lógica de negócio em Services** - Deveria estar no domínio
3. ❌ **DTOs misturados com entidades** - Sem separação clara
4. ❌ **Acoplamento forte** - Dependências diretas entre camadas
5. ❌ **Falta de Value Objects** - Tipos primitivos em todo lugar
6. ❌ **Sem Aggregates** - Entidades isoladas
7. ❌ **Sem Domain Events** - Comunicação síncrona

## 🎯 Proposta de Refatoração para DDD + Clean Architecture

### **Nova Estrutura Proposta**

```
src/
├── domain/                           # Camada de Domínio (Core)
│   ├── entities/                    # Entidades de Domínio
│   │   ├── usuario.entity.ts
│   │   ├── cobranca-pix.entity.ts
│   │   ├── pagamento.entity.ts
│   │   └── expedicao.entity.ts
│   ├── value-objects/               # Value Objects
│   │   ├── usuario-id.vo.ts
│   │   ├── nome-usuario.vo.ts
│   │   ├── empresa-id.vo.ts
│   │   ├── valor-monetario.vo.ts
│   │   └── status-cobranca.vo.ts
│   ├── aggregates/                  # Aggregates
│   │   ├── usuario.aggregate.ts
│   │   ├── cobranca-pix.aggregate.ts
│   │   └── expedicao.aggregate.ts
│   ├── domain-services/             # Domain Services
│   │   ├── usuario.domain-service.ts
│   │   ├── cobranca-pix.domain-service.ts
│   │   └── expedicao.domain-service.ts
│   ├── repositories/                # Interfaces de Repositório
│   │   ├── usuario.repository.ts
│   │   ├── cobranca-pix.repository.ts
│   │   └── expedicao.repository.ts
│   ├── events/                      # Domain Events
│   │   ├── usuario-criado.event.ts
│   │   ├── cobranca-pix-criada.event.ts
│   │   └── expedicao-separada.event.ts
│   └── exceptions/                  # Domain Exceptions
│       ├── domain.exception.ts
│       ├── usuario-nao-encontrado.exception.ts
│       └── cobranca-invalida.exception.ts
├── application/                     # Camada de Aplicação
│   ├── use-cases/                   # Use Cases
│   │   ├── usuario/
│   │   │   ├── consultar-usuario.use-case.ts
│   │   │   ├── consultar-usuarios-paginado.use-case.ts
│   │   │   ├── criar-usuario.use-case.ts
│   │   │   ├── ativar-usuario.use-case.ts
│   │   │   ├── desativar-usuario.use-case.ts
│   │   │   └── alterar-dados-usuario.use-case.ts
│   │   ├── cobranca-pix/
│   │   │   ├── criar-cobranca-pix.use-case.ts
│   │   │   ├── consultar-cobranca-pix.use-case.ts
│   │   │   ├── cancelar-cobranca-pix.use-case.ts
│   │   │   └── processar-pagamento-pix.use-case.ts
│   │   └── expedicao/
│   │       ├── separar-pedido.use-case.ts
│   │       ├── conferir-pedido.use-case.ts
│   │       └── finalizar-expedicao.use-case.ts
│   ├── dto/                         # DTOs de Aplicação
│   │   ├── usuario/
│   │   │   ├── usuario.dto.ts
│   │   │   ├── usuario-dados-completos.dto.ts
│   │   │   ├── usuario-permissoes.dto.ts
│   │   │   └── usuario-setores.dto.ts
│   │   ├── cobranca-pix/
│   │   │   ├── cobranca-pix.dto.ts
│   │   │   ├── pagamento-pix.dto.ts
│   │   │   └── qrcode-pix.dto.ts
│   │   └── expedicao/
│   │       ├── pedido.dto.ts
│   │       ├── separacao.dto.ts
│   │       └── conferencia.dto.ts
│   ├── services/                    # Application Services
│   │   ├── usuario.application-service.ts
│   │   ├── cobranca-pix.application-service.ts
│   │   └── expedicao.application-service.ts
│   └── interfaces/                  # Interfaces de Aplicação
│       ├── event-bus.interface.ts
│       ├── logger.interface.ts
│       └── notification.interface.ts
├── infrastructure/                  # Camada de Infraestrutura
│   ├── persistence/                 # Implementações de Repositório
│   │   ├── sql-server/
│   │   │   ├── usuario.repository.impl.ts
│   │   │   ├── cobranca-pix.repository.impl.ts
│   │   │   └── expedicao.repository.impl.ts
│   │   ├── sybase/
│   │   │   ├── usuario.repository.impl.ts
│   │   │   └── expedicao.repository.impl.ts
│   │   └── firebase/
│   │       ├── cobranca-pix.repository.impl.ts
│   │       └── pagamento.repository.impl.ts
│   ├── external-services/           # Serviços Externos
│   │   ├── pix/
│   │   │   ├── gerencianet-pix.service.ts
│   │   │   └── sicredi-pix.service.ts
│   │   ├── notification/
│   │   │   ├── email.service.ts
│   │   │   └── sms.service.ts
│   │   └── integration/
│   │       ├── data7-pix.service.ts
│   │       └── webhook.service.ts
│   ├── messaging/                   # Event Bus, etc.
│   │   ├── event-bus.impl.ts
│   │   ├── event-handlers/
│   │   │   ├── usuario-criado.handler.ts
│   │   │   ├── cobranca-pix-criada.handler.ts
│   │   │   └── expedicao-separada.handler.ts
│   │   └── event-store/
│   │       └── in-memory-event-store.ts
│   ├── config/                      # Configurações
│   │   ├── database.config.ts
│   │   ├── firebase.config.ts
│   │   ├── pix.config.ts
│   │   └── app.config.ts
│   └── connections/                 # Conexões
│       ├── sql-server.connection.ts
│       ├── sybase.connection.ts
│       └── firebase.connection.ts
├── presentation/                    # Camada de Apresentação
│   ├── controllers/                 # Controllers HTTP
│   │   ├── usuario.controller.ts
│   │   ├── cobranca-pix.controller.ts
│   │   └── expedicao.controller.ts
│   ├── middleware/                  # Middlewares
│   │   ├── validation.middleware.ts
│   │   ├── authentication.middleware.ts
│   │   ├── error-handler.middleware.ts
│   │   └── logging.middleware.ts
│   ├── validators/                  # Validadores
│   │   ├── usuario.validator.ts
│   │   ├── cobranca-pix.validator.ts
│   │   └── expedicao.validator.ts
│   ├── routes/                      # Rotas
│   │   ├── usuario.routes.ts
│   │   ├── cobranca-pix.routes.ts
│   │   └── expedicao.routes.ts
│   └── dto/                         # DTOs de Apresentação
│       ├── request/
│       │   ├── usuario.request.dto.ts
│       │   ├── cobranca-pix.request.dto.ts
│       │   └── expedicao.request.dto.ts
│       └── response/
│           ├── usuario.response.dto.ts
│           ├── cobranca-pix.response.dto.ts
│           └── expedicao.response.dto.ts
├── shared/                          # Código Compartilhado
│   ├── types/                       # Tipos compartilhados
│   │   ├── common.types.ts
│   │   ├── pagination.types.ts
│   │   └── result.types.ts
│   ├── utils/                       # Utilitários
│   │   ├── date.util.ts
│   │   ├── string.util.ts
│   │   ├── validation.util.ts
│   │   └── crypto.util.ts
│   ├── constants/                   # Constantes
│   │   ├── app.constants.ts
│   │   ├── database.constants.ts
│   │   └── pix.constants.ts
│   └── helpers/                     # Helpers
│       ├── cnpj.helper.ts
│       ├── cpf.helper.ts
│       ├── password.helper.ts
│       └── txid.helper.ts
├── aplication/                      # Configuração da Aplicação (Legado)
│   ├── app.ts
│   ├── app.api.ts
│   ├── app.dependencys.ts
│   ├── app.firebase.ts
│   └── app.socket.config.ts
├── assets/                          # Assets de Configuração
│   ├── config.msql.ts
│   └── config.sybase.ts
├── certificates/                    # Certificados
│   ├── secret_firebase.json
│   └── pix_certificates/
├── dependency/                      # Container de Dependências
│   └── container.dependency.ts
├── infra/                          # Infraestrutura Legada
│   ├── connection.sql.server.mssql.ts
│   ├── connection.sybase.ts
│   └── driver.connection.sybase.ts
├── model/                          # Modelos Legados
│   ├── usuario.model.ts
│   └── cobranca.model.ts
├── socket/                         # Socket.io
│   ├── cobranca-pix.socket.ts
│   ├── expedicao.socket.ts
│   └── notification.socket.ts
├── sql/                           # Scripts SQL
│   ├── common.data/
│   │   ├── usuario.consulta.sql
│   │   └── empresa.consulta.sql
│   ├── expedicao/
│   │   ├── separacao.sql
│   │   └── conferencia.sql
│   └── integracao/
│       ├── cobranca-pix.sql
│       └── pagamento.sql
├── type/                          # Tipos Legados
│   ├── chave.status.type.ts
│   ├── config.api.pix.type.ts
│   └── process.info.status.type.ts
├── validation/                    # Validações Legadas
│   ├── usuario.consulta.validation.ts
│   ├── login.app.validation.ts
│   └── cobranca-pix.validation.ts
├── server.ts                      # Ponto de Entrada
└── tests/                         # Testes
    ├── unit/
    │   ├── domain/
    │   ├── application/
    │   └── infrastructure/
    ├── integration/
    │   ├── controllers/
    │   └── repositories/
    └── e2e/
        ├── usuario.e2e.test.ts
        ├── cobranca-pix.e2e.test.ts
        └── expedicao.e2e.test.ts
```

### **Estrutura de Pastas Detalhada**

#### **1. Domain Layer (Camada de Domínio)**

- **entities/**: Entidades de domínio com comportamento
- **value-objects/**: Objetos de valor imutáveis
- **aggregates/**: Agregados que agrupam entidades relacionadas
- **domain-services/**: Serviços de domínio para lógica complexa
- **repositories/**: Interfaces de repositório (contratos)
- **events/**: Eventos de domínio
- **exceptions/**: Exceções específicas do domínio

#### **2. Application Layer (Camada de Aplicação)**

- **use-cases/**: Casos de uso organizados por módulo
- **dto/**: DTOs de aplicação para transferência de dados
- **services/**: Serviços de aplicação
- **interfaces/**: Interfaces de aplicação

#### **3. Infrastructure Layer (Camada de Infraestrutura)**

- **persistence/**: Implementações de repositório por banco
- **external-services/**: Integrações com serviços externos
- **messaging/**: Event bus e handlers
- **config/**: Configurações da aplicação
- **connections/**: Gerenciamento de conexões

#### **4. Presentation Layer (Camada de Apresentação)**

- **controllers/**: Controllers HTTP
- **middleware/**: Middlewares do Express
- **validators/**: Validadores de entrada
- **routes/**: Definição de rotas
- **dto/**: DTOs específicos para apresentação

#### **5. Shared (Compartilhado)**

- **types/**: Tipos compartilhados
- **utils/**: Utilitários
- **constants/**: Constantes
- **helpers/**: Helpers específicos

### **Use Cases na Arquitetura**

Use Cases são essenciais em DDD + Clean Architecture. Eles encapsulam a lógica de aplicação e orquestram o domínio.

### **DTOs e Repositories na Composição do Domínio**

DTOs e Repositories são fundamentais para compor os modelos de domínio, fornecendo:

- **DTOs**: Estruturas de dados para transferência entre camadas
- **Repositories**: Abstrações para persistência e recuperação de dados
- **Composição**: Modelos de domínio ricos construídos a partir de múltiplas fontes

#### **Estrutura com Use Cases**

```
application/
├── use-cases/           # Use Cases (NOVA CAMADA)
│   ├── usuario/
│   │   ├── consultar-usuario.use-case.ts
│   │   ├── criar-usuario.use-case.ts
│   │   ├── ativar-usuario.use-case.ts
│   │   └── desativar-usuario.use-case.ts
│   ├── cobranca-pix/
│   │   ├── criar-cobranca-pix.use-case.ts
│   │   ├── consultar-cobranca-pix.use-case.ts
│   │   └── cancelar-cobranca-pix.use-case.ts
│   └── expedicao/
│       ├── separar-pedido.use-case.ts
│       └── conferir-pedido.use-case.ts
```

### **Migração da Estrutura Atual**

#### **Mapeamento de Arquivos Existentes**

| **Estrutura Atual** | **Nova Estrutura**                               | **Status**   |
| ------------------- | ------------------------------------------------ | ------------ |
| `src/entities/`     | `src/domain/entities/`                           | 🔄 Refatorar |
| `src/services/`     | `src/application/use-cases/`                     | 🔄 Refatorar |
| `src/repository/`   | `src/infrastructure/persistence/`                | 🔄 Refatorar |
| `src/controllers/`  | `src/presentation/controllers/`                  | 🔄 Refatorar |
| `src/dto/`          | `src/application/dto/` + `src/presentation/dto/` | 🔄 Refatorar |
| `src/validation/`   | `src/presentation/validators/`                   | 🔄 Refatorar |
| `src/middleware/`   | `src/presentation/middleware/`                   | 🔄 Refatorar |
| `src/route/`        | `src/presentation/routes/`                       | 🔄 Refatorar |
| `src/helper/`       | `src/shared/helpers/`                            | 🔄 Mover     |
| `src/type/`         | `src/shared/types/`                              | 🔄 Mover     |
| `src/infra/`        | `src/infrastructure/connections/`                | 🔄 Refatorar |
| `src/aplication/`   | `src/aplication/` (manter)                       | ✅ Manter    |
| `src/sql/`          | `src/sql/` (manter)                              | ✅ Manter    |
| `src/socket/`       | `src/socket/` (manter)                           | ✅ Manter    |
| `src/certificates/` | `src/certificates/` (manter)                     | ✅ Manter    |
| `src/dependency/`   | `src/dependency/` (manter)                       | ✅ Manter    |

#### **Estratégia de Migração**

1. **Fase 1**: Criar nova estrutura de pastas
2. **Fase 2**: Mover arquivos mantendo compatibilidade
3. **Fase 3**: Refatorar gradualmente
4. **Fase 4**: Remover arquivos legados
5. **Fase 5**: Otimizar e limpar

## 📝 Exemplos de Refatoração

### **Exemplo 1: Entidade Usuário**

#### **Antes (Atual):**

```typescript
// entities/usuario.ts - Entidade anêmica
export default class Usuario {
  readonly codUsuario: number;
  readonly nomeUsuario: string;
  readonly estacaoTrabalho: string;

  constructor(params: { codUsuario: number; nomeUsuario: string; estacaoTrabalho: string }) {
    this.codUsuario = params.codUsuario;
    this.nomeUsuario = params.nomeUsuario;
    this.estacaoTrabalho = params.estacaoTrabalho;
  }

  static create = (params: { codUsuario: number; nomeUsuario: string; estacaoTrabalho: string }) => {
    return new Usuario(params);
  };

  static fromObject = (object: any) => {
    return new Usuario({
      codUsuario: object.CodUsuario,
      nomeUsuario: object.NomeUsuario,
      estacaoTrabalho: object.EstacaoTrabalho,
    });
  };
}
```

#### **Depois (DDD com DTOs e Repositories):**

```typescript
// domain/entities/usuario.entity.ts
export class Usuario {
  private constructor(
    private readonly _id: UsuarioId,
    private _nome: NomeUsuario,
    private _ativo: boolean,
    private _empresa: EmpresaId,
    private _estacaoTrabalho: string,
    private _dadosCompletos?: UsuarioDadosCompletos, // DTO composto
  ) {}

  static create(nome: string, empresaId: number, estacaoTrabalho: string): Usuario {
    return new Usuario(
      UsuarioId.generate(),
      NomeUsuario.create(nome),
      true,
      EmpresaId.create(empresaId),
      estacaoTrabalho,
    );
  }

  // Factory method usando DTO
  static fromDTO(dto: UsuarioDTO): Usuario {
    return new Usuario(
      UsuarioId.create(dto.codUsuario),
      NomeUsuario.create(dto.nomeUsuario),
      dto.ativo === 'S',
      EmpresaId.create(dto.codEmpresa),
      dto.estacaoTrabalho,
      dto.dadosCompletos,
    );
  }

  // Método para compor dados completos via repository
  async carregarDadosCompletos(repository: UsuarioRepository): Promise<void> {
    if (!this._dadosCompletos) {
      this._dadosCompletos = await repository.buscarDadosCompletos(this._id);
    }
  }

  ativar(): void {
    this._ativo = true;
  }

  desativar(): void {
    this._ativo = false;
  }

  alterarNome(novoNome: string): void {
    this._nome = NomeUsuario.create(novoNome);
  }

  // Converter para DTO
  toDTO(): UsuarioDTO {
    return {
      codUsuario: this._id.value,
      nomeUsuario: this._nome.value,
      ativo: this._ativo ? 'S' : 'N',
      codEmpresa: this._empresa.value,
      estacaoTrabalho: this._estacaoTrabalho,
      dadosCompletos: this._dadosCompletos,
    };
  }

  // Getters
  get id(): UsuarioId {
    return this._id;
  }
  get nome(): NomeUsuario {
    return this._nome;
  }
  get ativo(): boolean {
    return this._ativo;
  }
  get empresa(): EmpresaId {
    return this._empresa;
  }
  get estacaoTrabalho(): string {
    return this._estacaoTrabalho;
  }
  get dadosCompletos(): UsuarioDadosCompletos | undefined {
    return this._dadosCompletos;
  }
}
```

#### **DTOs de Composição:**

```typescript
// application/dto/usuario.dto.ts
export interface UsuarioDTO {
  codUsuario: number;
  nomeUsuario: string;
  ativo: string;
  codEmpresa: number;
  estacaoTrabalho: string;
  dadosCompletos?: UsuarioDadosCompletos;
}

export interface UsuarioDadosCompletos {
  nomeEmpresa?: string;
  nomeVendedor?: string;
  nomeLocalArmazenagem?: string;
  nomeContaFinanceira?: string;
  permissoes: UsuarioPermissoes;
  setores: UsuarioSetores;
}

export interface UsuarioPermissoes {
  permiteSepararForaSequencia: boolean;
  visualizaTodasSeparacoes: boolean;
  permiteConferirForaSequencia: boolean;
  visualizaTodasConferencias: boolean;
  permiteArmazenarForaSequencia: boolean;
  visualizaTodasArmazenagem: boolean;
  editaCarrinhoOutroUsuario: boolean;
  salvaCarrinhoOutroUsuario: boolean;
  excluiCarrinhoOutroUsuario: boolean;
  expedicaoEntregaBalcaoPreVenda: boolean;
}

export interface UsuarioSetores {
  estoque?: SetorInfo;
  conferencia?: SetorInfo;
  armazenagem?: SetorInfo;
}

export interface SetorInfo {
  codigo: number;
  nome: string;
}
```

#### **Repository Interface:**

```typescript
// domain/repositories/usuario.repository.ts
export interface UsuarioRepository {
  findById(id: UsuarioId): Promise<Usuario | null>;
  findByCodigo(codigo: number): Promise<Usuario | null>;
  findByNome(nome: string): Promise<Usuario[]>;
  findByEmpresa(empresaId: EmpresaId): Promise<Usuario[]>;
  findAtivos(): Promise<Usuario[]>;
  save(usuario: Usuario): Promise<void>;
  delete(id: UsuarioId): Promise<void>;

  // Métodos para composição de dados
  buscarDadosCompletos(id: UsuarioId): Promise<UsuarioDadosCompletos>;
  buscarComPermissoes(id: UsuarioId): Promise<Usuario>;
  buscarComSetores(id: UsuarioId): Promise<Usuario>;
}
```

### **Exemplo 2: Use Case - Consultar Usuário**

#### **Antes (Service atual):**

```typescript
// services/usuario.consulta.service.ts
export default class UsuarioConsultaService {
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
}
```

#### **Depois (Use Case com DTOs e Repositories):**

```typescript
// application/use-cases/usuario/consultar-usuario.use-case.ts
export interface ConsultarUsuarioUseCaseInput {
  codUsuario: number;
  incluirDadosCompletos?: boolean;
}

export interface ConsultarUsuarioUseCaseOutput {
  usuario: UsuarioDTO | null;
}

export class ConsultarUsuarioUseCase {
  constructor(
    private readonly usuarioRepository: UsuarioRepository,
    private readonly logger: Logger,
  ) {}

  async execute(input: ConsultarUsuarioUseCaseInput): Promise<ConsultarUsuarioUseCaseOutput> {
    try {
      // Validação de entrada
      if (!input.codUsuario || input.codUsuario <= 0) {
        throw new DomainException('Código do usuário deve ser um número positivo');
      }

      // Buscar no repositório
      const usuario = await this.usuarioRepository.findById(UsuarioId.create(input.codUsuario));

      if (!usuario) {
        this.logger.info(`Usuário não encontrado: ${input.codUsuario}`);
        return { usuario: null };
      }

      // Carregar dados completos se solicitado
      if (input.incluirDadosCompletos) {
        await usuario.carregarDadosCompletos(this.usuarioRepository);
      }

      this.logger.info(`Usuário encontrado: ${usuario.nome.value}`);
      return { usuario: usuario.toDTO() };
    } catch (error) {
      this.logger.error('Erro ao consultar usuário', error);
      throw error;
    }
  }
}

// Use Case para consulta paginada com DTOs
export class ConsultarUsuariosPaginadoUseCase {
  constructor(
    private readonly usuarioRepository: UsuarioRepository,
    private readonly logger: Logger,
  ) {}

  async execute(input: {
    page: number;
    limit: number;
    filtros?: {
      nome?: string;
      empresa?: number;
      ativo?: boolean;
    };
  }): Promise<{
    usuarios: UsuarioDTO[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      // Buscar usuários com filtros
      let usuarios: Usuario[];

      if (input.filtros?.nome) {
        usuarios = await this.usuarioRepository.findByNome(input.filtros.nome);
      } else if (input.filtros?.empresa) {
        usuarios = await this.usuarioRepository.findByEmpresa(EmpresaId.create(input.filtros.empresa));
      } else if (input.filtros?.ativo !== undefined) {
        usuarios = input.filtros.ativo
          ? await this.usuarioRepository.findAtivos()
          : await this.usuarioRepository.findInativos();
      } else {
        usuarios = await this.usuarioRepository.findAll();
      }

      // Aplicar paginação
      const total = usuarios.length;
      const totalPages = Math.ceil(total / input.limit);
      const startIndex = (input.page - 1) * input.limit;
      const endIndex = startIndex + input.limit;
      const usuariosPaginados = usuarios.slice(startIndex, endIndex);

      // Converter para DTOs
      const usuariosDTO = usuariosPaginados.map((usuario) => usuario.toDTO());

      return {
        usuarios: usuariosDTO,
        total,
        page: input.page,
        limit: input.limit,
        totalPages,
      };
    } catch (error) {
      this.logger.error('Erro ao consultar usuários paginados', error);
      throw error;
    }
  }
}
```

### **Exemplo 3: Controller Refatorado**

#### **Antes (Atual):**

```typescript
// controllers/geral/usuario.consulta.controller.ts
export default class UsuarioConsultaController {
  public static async get(req: Request, res: Response): Promise<void> {
    try {
      const usuarioConsultaService = new UsuarioConsultaService();
      const { CodUsuario, NomeUsuario, CodEmpresa, Ativo, Page, Offset, Limit } = (req as any)
        .validatedQuery as UsuarioConsultaQuery;

      let currentPage: number;
      let currentOffset: number;

      if (Offset !== undefined) {
        currentOffset = Offset;
        currentPage = Math.floor(Offset / Limit) + 1;
      } else {
        currentPage = Page;
        currentOffset = (Page - 1) * Limit;
      }

      const currentLimit = Limit;

      let resultado;

      if (CodUsuario) {
        resultado = await usuarioConsultaService.consultarPorCodigo(CodUsuario);
        if (!resultado) {
          res.status(404).send({
            message: 'Usuário não encontrado',
          });
          return;
        }

        res.status(200).send({
          message: 'Usuário encontrado',
          data: resultado.toJson(),
          total: 1,
        });
        return;
      }
      // ... resto da lógica
    } catch (error: any) {
      res.status(400).send({
        message: `Erro na consulta de usuários: ${error.message}`,
      });
    }
  }
}
```

#### **Depois (DDD com DTOs e Repositories):**

```typescript
// presentation/controllers/usuario.controller.ts
export class UsuarioController {
  constructor(
    private readonly consultarUsuarioUseCase: ConsultarUsuarioUseCase,
    private readonly consultarUsuariosPaginadoUseCase: ConsultarUsuariosPaginadoUseCase,
    private readonly criarUsuarioUseCase: CriarUsuarioUseCase,
    private readonly ativarUsuarioUseCase: AtivarUsuarioUseCase,
  ) {}

  async consultarPorCodigo(req: Request, res: Response): Promise<void> {
    try {
      const { codUsuario } = req.params;
      const { incluirDadosCompletos } = req.query;

      const result = await this.consultarUsuarioUseCase.execute({
        codUsuario: parseInt(codUsuario),
        incluirDadosCompletos: incluirDadosCompletos === 'true',
      });

      if (!result.usuario) {
        res.status(404).json({
          message: 'Usuário não encontrado',
        });
        return;
      }

      res.status(200).json({
        message: 'Usuário encontrado',
        data: result.usuario, // Já é um DTO
      });
    } catch (error) {
      res.status(400).json({
        message: error.message,
      });
    }
  }

  async consultarPaginado(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, nome, empresa, ativo } = req.query;

      const result = await this.consultarUsuariosPaginadoUseCase.execute({
        page: parseInt(page as string) || 1,
        limit: parseInt(limit as string) || 100,
        filtros: {
          nome: nome as string,
          empresa: empresa ? parseInt(empresa as string) : undefined,
          ativo: ativo === 'S',
        },
      });

      res.status(200).json({
        message: `${result.total} usuário(s) encontrado(s)`,
        data: result.usuarios, // Já são DTOs
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      res.status(400).json({
        message: error.message,
      });
    }
  }
}
```

### **Exemplo 4: Implementação do Repository**

#### **Repository Implementation:**

```typescript
// infrastructure/persistence/usuario.repository.impl.ts
export class UsuarioRepositoryImpl implements UsuarioRepository {
  constructor(
    private readonly connection: ConnectionPool,
    private readonly logger: Logger,
  ) {}

  async findById(id: UsuarioId): Promise<Usuario | null> {
    try {
      const sql = `
        SELECT CodUsuario, NomeLegivel, Ativo, CodEmpresa, EstacaoTrabalho
        FROM Usuario
        WHERE CodUsuario = @codUsuario AND Grupo = 'N'
      `;

      const result = await this.connection.request().input('codUsuario', id.value).query(sql);

      if (result.recordset.length === 0) {
        return null;
      }

      const dto = this.mapToDTO(result.recordset[0]);
      return Usuario.fromDTO(dto);
    } catch (error) {
      this.logger.error('Erro ao buscar usuário por ID', error);
      throw error;
    }
  }

  async buscarDadosCompletos(id: UsuarioId): Promise<UsuarioDadosCompletos> {
    try {
      const sql = `
        SELECT
          e.Nome as NomeEmpresa,
          v.Nome as NomeVendedor,
          la.Nome as NomeLocalArmazenagem,
          cf.Nome as NomeContaFinanceira,
          co.PermiteSepararForaSequencia,
          co.VisualizaTodasSeparacoes,
          co.PermiteConferirForaSequencia,
          co.VisualizaTodasConferencias,
          co.PermiteArmazenarForaSequencia,
          co.VisualizaTodasArmazenagem,
          co.EditaCarrinhoOutroUsuario,
          co.SalvaCarrinhoOutroUsuario,
          co.ExcluiCarrinhoOutroUsuario,
          co.ExpedicaoEntregaBalcaoPreVenda,
          ese.CodSetorEstoque,
          ese.Descricao as NomeSetorEstoque,
          esc.CodSetorConferencia,
          esc.Descricao as NomeSetorConferencia,
          esa.CodSetorArmazenagem,
          esa.Descricao as NomeSetorArmazenagem
        FROM Usuario usa
        LEFT JOIN CaixaOperador co ON co.CodUsuario = usa.CodUsuario
        LEFT JOIN Empresa e ON e.CodEmpresa = co.CodEmpresa
        LEFT JOIN Vendedor v ON v.CodVendedor = co.CodVendedor
        LEFT JOIN LocalArmazenagem la ON la.CodLocalArmazenagem = co.CodLocalArmazenagem
        LEFT JOIN ContaFinanceira cf ON cf.CodContaFinanceira = co.CodContaFinanceira
        LEFT JOIN Expedicao.SetorEstoque ese ON ese.CodSetorEstoque = co.CodSetorEstoque
        LEFT JOIN Expedicao.SetorConferencia esc ON esc.CodSetorConferencia = co.CodSetorConferencia
        LEFT JOIN Expedicao.SetorArmazenagem esa ON esa.CodSetorArmazenagem = co.CodSetorArmazenagem
        WHERE usa.CodUsuario = @codUsuario AND usa.Grupo = 'N'
      `;

      const result = await this.connection.request().input('codUsuario', id.value).query(sql);

      if (result.recordset.length === 0) {
        throw new Error('Usuário não encontrado');
      }

      const row = result.recordset[0];
      return this.mapToDadosCompletos(row);
    } catch (error) {
      this.logger.error('Erro ao buscar dados completos do usuário', error);
      throw error;
    }
  }

  private mapToDTO(row: any): UsuarioDTO {
    return {
      codUsuario: row.CodUsuario,
      nomeUsuario: row.NomeLegivel,
      ativo: row.Ativo || 'S',
      codEmpresa: row.CodEmpresa,
      estacaoTrabalho: row.EstacaoTrabalho,
    };
  }

  private mapToDadosCompletos(row: any): UsuarioDadosCompletos {
    return {
      nomeEmpresa: row.NomeEmpresa,
      nomeVendedor: row.NomeVendedor,
      nomeLocalArmazenagem: row.NomeLocalArmazenagem,
      nomeContaFinanceira: row.NomeContaFinanceira,
      permissoes: {
        permiteSepararForaSequencia: row.PermiteSepararForaSequencia === 'S',
        visualizaTodasSeparacoes: row.VisualizaTodasSeparacoes === 'S',
        permiteConferirForaSequencia: row.PermiteConferirForaSequencia === 'S',
        visualizaTodasConferencias: row.VisualizaTodasConferencias === 'S',
        permiteArmazenarForaSequencia: row.PermiteArmazenarForaSequencia === 'S',
        visualizaTodasArmazenagem: row.VisualizaTodasArmazenagem === 'S',
        editaCarrinhoOutroUsuario: row.EditaCarrinhoOutroUsuario === 'S',
        salvaCarrinhoOutroUsuario: row.SalvaCarrinhoOutroUsuario === 'S',
        excluiCarrinhoOutroUsuario: row.ExcluiCarrinhoOutroUsuario === 'S',
        expedicaoEntregaBalcaoPreVenda: row.ExpedicaoEntregaBalcaoPreVenda === 'S',
      },
      setores: {
        estoque: row.CodSetorEstoque
          ? {
              codigo: row.CodSetorEstoque,
              nome: row.NomeSetorEstoque,
            }
          : undefined,
        conferencia: row.CodSetorConferencia
          ? {
              codigo: row.CodSetorConferencia,
              nome: row.NomeSetorConferencia,
            }
          : undefined,
        armazenagem: row.CodSetorArmazenagem
          ? {
              codigo: row.CodSetorArmazenagem,
              nome: row.NomeSetorArmazenagem,
            }
          : undefined,
      },
    };
  }

  // Implementar outros métodos...
  async findByCodigo(codigo: number): Promise<Usuario | null> {
    // Implementação...
  }

  async findByNome(nome: string): Promise<Usuario[]> {
    // Implementação...
  }

  async findByEmpresa(empresaId: EmpresaId): Promise<Usuario[]> {
    // Implementação...
  }

  async findAtivos(): Promise<Usuario[]> {
    // Implementação...
  }

  async save(usuario: Usuario): Promise<void> {
    // Implementação...
  }

  async delete(id: UsuarioId): Promise<void> {
    // Implementação...
  }
}
```

## 🚀 Plano de Refatoração Gradual

### **Fase 1: Preparação da Estrutura**

1. ✅ Criar nova estrutura de pastas
2. ✅ Mover arquivos existentes para novas pastas
3. ✅ Ajustar imports e dependências
4. ✅ Configurar novos contratos

### **Fase 2: Refatoração do Domínio**

1. 🔄 Transformar Entities em Domain Entities
2. 🔄 Criar Value Objects (UsuarioId, NomeUsuario, etc.)
3. 🔄 Implementar Aggregates
4. 🔄 Criar Domain Services
5. 🔄 Implementar Domain Events

### **Fase 3: Refatoração da Aplicação**

1. 🔄 Criar Use Cases
2. 🔄 Implementar Application Services
3. 🔄 Refatorar DTOs
4. 🔄 Configurar Event Bus

### **Fase 4: Refatoração da Infraestrutura**

1. 🔄 Implementar Repositories
2. 🔄 Configurar Event Bus
3. 🔄 Ajustar conexões de banco
4. 🔄 Implementar External Services

### **Fase 5: Refatoração da Apresentação**

1. 🔄 Refatorar Controllers
2. 🔄 Implementar novos middlewares
3. 🔄 Ajustar validações
4. 🔄 Configurar rotas

## 📊 Use Cases para o Módulo Usuário

### **Use Cases Básicos**

1. `ConsultarUsuarioUseCase` - Buscar usuário por ID
2. `ConsultarUsuariosPaginadoUseCase` - Listar usuários com paginação
3. `CriarUsuarioUseCase` - Criar novo usuário

### **Use Cases de Negócio**

1. `AtivarUsuarioUseCase` - Ativar usuário
2. `DesativarUsuarioUseCase` - Desativar usuário
3. `AlterarDadosUsuarioUseCase` - Alterar dados do usuário

### **Use Cases Complexos**

1. `ConsultarUsuariosPorEmpresaUseCase` - Filtrar por empresa
2. `ConsultarUsuariosAtivosUseCase` - Filtrar apenas ativos
3. `ValidarPermissoesUsuarioUseCase` - Validar permissões

### **Use Cases de Outros Módulos**

1. **Cobrança PIX:**
   - `CriarCobrancaPixUseCase`
   - `ConsultarCobrancaPixUseCase`
   - `CancelarCobrancaPixUseCase`

2. **Expedição:**
   - `SepararPedidoUseCase`
   - `ConferirPedidoUseCase`

## ✅ Vantagens da Nova Arquitetura

### **1. Separação Clara de Responsabilidades**

- **Domain**: Regras de negócio puras
- **Application**: Orquestração e casos de uso
- **Infrastructure**: Detalhes técnicos
- **Presentation**: Interface com usuário

### **2. Composição Rica com DTOs e Repositories**

- **DTOs**: Estruturas de dados bem definidas para transferência
- **Repositories**: Abstrações para persistência e recuperação
- **Composição**: Modelos de domínio ricos construídos a partir de múltiplas fontes
- **Lazy Loading**: Carregamento sob demanda de dados complexos
- **Mapeamento**: Conversão clara entre camadas

### **3. Testabilidade**

- Use Cases testáveis isoladamente
- Domain Entities com comportamento testável
- Mocks fáceis de implementar
- DTOs testáveis independentemente
- Repositories mockáveis para testes

### **4. Reutilização**

- Use Cases reutilizáveis em diferentes interfaces
- Domain Services compartilhados
- Value Objects reutilizáveis
- DTOs reutilizáveis entre camadas
- Repositories reutilizáveis para diferentes contextos

### **5. Independência de Frameworks**

- Domain não depende de Express, SQL Server, etc.
- Fácil migração de tecnologias
- Testes sem dependências externas
- DTOs independentes de frameworks
- Repositories abstraem detalhes de persistência

### **6. Manutenibilidade**

- Código organizado por domínio
- Responsabilidades bem definidas
- Fácil localização de funcionalidades
- DTOs centralizam estruturas de dados
- Repositories centralizam lógica de acesso a dados

### **7. Rastreabilidade**

- Cada Use Case representa uma funcionalidade
- Fácil mapeamento de requisitos
- Documentação viva do sistema
- DTOs documentam estruturas de dados
- Repositories documentam operações de persistência

## 🎯 Próximos Passos Recomendados

### **1. Começar pelo Módulo Usuário**

- Módulo mais simples
- Boa base para entender a arquitetura
- Menor risco de quebra

### **2. Criar Estrutura de Pastas**

- Implementar nova estrutura
- Mover arquivos gradualmente
- Manter compatibilidade

### **3. Refatorar uma Entidade por Vez**

- Começar com Usuario
- Implementar Value Objects
- Criar DTOs de composição
- Implementar Repositories
- Criar Use Cases

### **4. Manter Compatibilidade**

- Não quebrar APIs existentes
- Migração gradual
- Testes de regressão

### **5. Implementar Testes**

- Testes unitários para Use Cases
- Testes de integração
- Testes de DTOs e mapeamentos
- Testes de Repositories
- Cobertura de código

## 📚 Referências e Padrões

### **Domain-Driven Design (DDD)**

- **Entities**: Objetos com identidade
- **Value Objects**: Objetos imutáveis
- **Aggregates**: Conjuntos de entidades
- **Domain Services**: Lógica que não pertence a uma entidade
- **Domain Events**: Eventos do domínio
- **Repositories**: Abstrações para persistência
- **DTOs**: Objetos de transferência de dados

### **Clean Architecture**

- **Dependency Rule**: Dependências apontam para dentro
- **Use Cases**: Casos de uso da aplicação
- **Interface Adapters**: Controllers, Presenters
- **Frameworks & Drivers**: Detalhes externos
- **DTOs**: Transferência de dados entre camadas
- **Repositories**: Abstrações de persistência

### **SOLID Principles**

- **S** - Single Responsibility
- **O** - Open/Closed
- **L** - Liskov Substitution
- **I** - Interface Segregation
- **D** - Dependency Inversion

## 🔧 Ferramentas e Tecnologias

### **Atuais (Mantidas)**

- TypeScript
- Express.js
- Zod (validação)
- SQL Server / Sybase
- Firebase

### **Novas (Adicionadas)**

- Event Bus (para Domain Events)
- Logger estruturado
- Testes unitários (Jest/Vitest)
- Mocks para testes

## 📈 Métricas de Sucesso

### **Antes da Refatoração**

- ❌ Entities anêmicas
- ❌ Lógica de negócio em Services
- ❌ Acoplamento forte
- ❌ Testes difíceis

### **Depois da Refatoração**

- ✅ Entities com comportamento
- ✅ Lógica de negócio no domínio
- ✅ Baixo acoplamento
- ✅ Testes fáceis e rápidos
- ✅ Código mais limpo
- ✅ Manutenção facilitada
- ✅ DTOs bem estruturados
- ✅ Repositories abstratos
- ✅ Composição rica de dados
- ✅ Lazy loading implementado

---

**Data de Criação**: Janeiro 2025
**Autor**: Análise de Arquitetura
**Status**: Plano de Refatoração
**Próxima Revisão**: Após implementação da Fase 1
