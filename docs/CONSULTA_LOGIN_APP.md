# API de Consulta - Login App

## 📋 Funcionalidade GET Implementada

O método GET do LoginAppController foi implementado para permitir consultas flexíveis aos usuários do sistema.

## 🎯 Endpoints de Consulta

### 1. Consultar Todos os Usuários

```http
GET /expedicao/login-app
```

**Resposta:**

```json
{
  "message": "5 usuário(s) encontrado(s)",
  "data": [
    {
      "CodLoginApp": 1,
      "Ativo": "S",
      "Nome": "joao.silva",
      "CodUsuario": null
    },
    {
      "CodLoginApp": 2,
      "Ativo": "N",
      "Nome": "maria.santos",
      "CodUsuario": 123
    }
  ],
  "total": 5
}
```

### 2. Consultar por Nome (busca parcial)

```http
GET /expedicao/login-app?nome=joao
```

**Resposta:**

```json
{
  "message": "2 usuário(s) encontrado(s)",
  "data": [
    {
      "CodLoginApp": 1,
      "Ativo": "S",
      "Nome": "joao.silva",
      "CodUsuario": null
    },
    {
      "CodLoginApp": 5,
      "Ativo": "S",
      "Nome": "joao.pedro",
      "CodUsuario": 456
    }
  ],
  "total": 2
}
```

### 3. Consultar por Código Específico

```http
GET /expedicao/login-app?codLoginApp=1
```

**Resposta:**

```json
{
  "message": "Usuário encontrado",
  "data": {
    "CodLoginApp": 1,
    "Ativo": "S",
    "Nome": "joao.silva",
    "CodUsuario": null
  },
  "total": 1
}
```

### 4. Consultar Apenas Usuários Ativos

```http
GET /expedicao/login-app?ativo=S
```

**Resposta:**

```json
{
  "message": "3 usuário(s) ativo(s) encontrado(s)",
  "data": [
    {
      "CodLoginApp": 1,
      "Ativo": "S",
      "Nome": "joao.silva",
      "CodUsuario": null
    },
    {
      "CodLoginApp": 3,
      "Ativo": "S",
      "Nome": "carlos.mendes",
      "CodUsuario": 789
    }
  ],
  "total": 3
}
```

## 🔍 Filtros Disponíveis

| Parâmetro     | Tipo   | Descrição                   | Exemplo          |
| ------------- | ------ | --------------------------- | ---------------- |
| `nome`        | string | Busca parcial por nome      | `?nome=joao`     |
| `codLoginApp` | number | Busca por código específico | `?codLoginApp=1` |
| `ativo`       | S/N    | Filtrar por status ativo    | `?ativo=S`       |

## 🛡️ Segurança

- ✅ **Senha nunca retornada**: Por segurança, senhas não aparecem nas consultas
- ✅ **FotoUsuario não retornada**: Por performance, fotos não são incluídas nas consultas
- ✅ **DTO específico**: `ExpedicaoLoginAppDtoConsulta` com campos limitados
- ✅ **Validação de entrada**: Query parameters validados

## 📦 Estrutura de Resposta

### Resposta de Sucesso (múltiplos resultados)

```json
{
  "message": "X usuário(s) encontrado(s)",
  "data": [
    /* array de usuários */
  ],
  "total": 5
}
```

### Resposta de Sucesso (resultado único)

```json
{
  "message": "Usuário encontrado",
  "data": {
    /* objeto do usuário */
  },
  "total": 1
}
```

### Resposta de Erro

```json
{
  "message": "Usuário não encontrado"
}
```

```json
{
  "message": "Código deve ser um número válido"
}
```

```json
{
  "message": "Nome não pode estar vazio"
}
```

## 🔧 Serviços Implementados

### ConsultaLoginAppService

- `consultarTodos()`: Retorna todos os usuários
- `consultarPorNome(nome)`: Busca por nome parcial (LIKE)
- `consultarPorCodigo(codLoginApp)`: Busca por código específico
- `consultarAtivos()`: Retorna apenas usuários ativos

### ExpedicaoLoginAppDtoConsulta

DTO otimizado para consultas que inclui apenas:

- `CodLoginApp`
- `Ativo`
- `Nome`
- `CodUsuario`

**Não inclui:** `Senha` e `FotoUsuario` por segurança e performance.

## 💡 Exemplos Práticos

### Buscar todos os usuários ativos com nome "silva"

```http
GET /expedicao/login-app?nome=silva&ativo=S
```

_Nota: Atualmente não suporta múltiplos filtros simultaneamente_

### Buscar usuário específico para edição

```http
GET /expedicao/login-app?codLoginApp=123
```

### Listar todos para administração

```http
GET /expedicao/login-app
```

## 🚀 Próximos Melhoramentos Sugeridos

- [ ] Suporte a múltiplos filtros simultâneos
- [ ] Paginação para grandes volumes de dados
- [ ] Ordenação por campos específicos
- [ ] Cache para consultas frequentes
- [ ] Filtro por data de criação/modificação
