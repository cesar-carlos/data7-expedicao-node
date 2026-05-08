# 📚 Documentação - Data7 API PIX

Bem-vindo à documentação do sistema Data7 API PIX. Esta pasta contém toda a documentação técnica e guias de uso do projeto.

## 📋 Índice da Documentação

### 🔐 Autenticação e Segurança

- [**CRIPTOGRAFIA_SENHAS.md**](./CRIPTOGRAFIA_SENHAS.md) - Sistema de criptografia de senhas com bcrypt

### 👥 Gestão de Usuários

- [**CONSULTA_LOGIN_APP.md**](./CONSULTA_LOGIN_APP.md) - API de consulta de usuários do sistema

### ✅ Validação de Dados

- [**EXEMPLO_USO_ZOD.md**](./EXEMPLO_USO_ZOD.md) - Implementação e uso do Zod para validação

## 🚀 Funcionalidades Implementadas

### Sistema de Login e Usuários

- ✅ Criação de usuários com validação
- ✅ Autenticação segura com bcrypt
- ✅ Consulta de usuários com filtros
- ✅ Validação de dados com Zod
- ✅ Upload de fotos de usuário (varbinary)

### Endpoints Principais

#### Criação de Usuário

```http
POST /expedicao/create-login-app
```

- Cria novo usuário com senha criptografada
- Validação completa dos dados de entrada
- Suporte a foto do usuário

#### Autenticação

```http
POST /expedicao/login-app
```

- Login seguro com verificação bcrypt
- Retorna dados do usuário (sem senha)

#### Consulta de Usuários

```http
GET /expedicao/login-app
```

- Consultar todos os usuários
- Filtros por nome, código ou status
- DTO otimizado para performance

## 🛠️ Tecnologias Utilizadas

- **Node.js** + **TypeScript**
- **Express.js** - Framework web
- **Zod** - Validação de esquemas
- **bcryptjs** - Criptografia de senhas
- **mssql** - Conexão SQL Server
- **Buffer** - Manipulação de dados binários

## 📁 Estrutura do Projeto

```
src/
├── controllers/     # Controladores HTTP
├── services/       # Lógica de negócio
├── dto/           # Objetos de transferência de dados
├── validation/    # Esquemas de validação Zod
├── middleware/    # Middlewares Express
├── helper/        # Utilitários e helpers
├── repository/    # Acesso a dados
└── routes/        # Definição de rotas
```

## 🔍 Como Navegar na Documentação

1. **Para desenvolvedores iniciantes**: Comece pelo `EXEMPLO_USO_ZOD.md`
2. **Para implementar autenticação**: Consulte `CRIPTOGRAFIA_SENHAS.md`
3. **Para consultas de dados**: Veja `CONSULTA_LOGIN_APP.md`

## 🤝 Contribuindo

Ao adicionar novas funcionalidades:

1. Crie documentação na pasta `docs/`
2. Atualize este README.md
3. Inclua exemplos práticos de uso
4. Documente endpoints e validações

## 📞 Suporte

Para dúvidas sobre a documentação ou implementação, consulte os arquivos específicos de cada funcionalidade nesta pasta.

---

_Última atualização: Setembro 2025_
