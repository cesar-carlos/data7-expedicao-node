# Guia de Consultas - LoginApp API

## Overview

O sistema de consultas do LoginApp oferece múltiplas formas de buscar usuários com paginação completa.

## Endpoints Disponíveis

### GET /api/login-app

#### 1. Consultar Todos os Usuários

```http
GET /api/login-app
GET /api/login-app?page=1&limit=100
```

**Descrição**: Retorna todos os usuários com paginação
**Parâmetros opcionais**:

- `page`: Número da página (padrão: 1)
- `limit`: Registros por página (padrão: 1000, máximo: 1000)

#### 2. Consultar por Nome de Usuário ✅

```http
GET /api/login-app?nome=João
GET /api/login-app?nome=Maria&page=2&limit=50
```

**Descrição**: Busca usuários que contenham o nome especificado
**Parâmetros**:

- `nome` (obrigatório): Nome ou parte do nome a ser pesquisado
- `page` (opcional): Página desejada
- `limit` (opcional): Registros por página

**Exemplo de resposta**:

```json
{
  "message": "3 usuário(s) encontrado(s)",
  "data": [
    {
      "CodLoginApp": 1,
      "Nome": "João Silva",
      "Ativo": "S",
      "CodUsuario": 101
      // ... outros campos
    }
  ],
  "total": 3,
  "page": 1,
  "limit": 100,
  "totalPages": 1
}
```

#### 3. Consultar por Código Específico

```http
GET /api/login-app?codLoginApp=123
```

**Descrição**: Busca um usuário específico pelo código
**Parâmetros**:

- `codLoginApp` (obrigatório): Código numérico do usuário

**Exemplo de resposta**:

```json
{
  "message": "Usuário encontrado",
  "data": {
    "CodLoginApp": 123,
    "Nome": "João Silva",
    "Ativo": "S"
    // ... outros campos
  },
  "total": 1
}
```

#### 4. Consultar Usuários Ativos

```http
GET /api/login-app?ativo=S
GET /api/login-app?ativo=S&page=2&limit=25
```

**Descrição**: Retorna apenas usuários com status ativo
**Parâmetros**:

- `ativo` (obrigatório): 'S' para ativos, 'N' para inativos
- `page` (opcional): Página desejada
- `limit` (opcional): Registros por página

## Funcionalidades Implementadas

### ✅ Consultas Disponíveis:

1. **Todos os usuários** - `GET /api/login-app`
2. **Por nome** - `GET /api/login-app?nome=João`
3. **Por código** - `GET /api/login-app?codLoginApp=123`
4. **Usuários ativos** - `GET /api/login-app?ativo=S`

### ✅ Recursos:

- **Paginação completa** em todas as consultas (exceto busca por código)
- **Validação automática** com Zod
- **Busca parcial** por nome (LIKE %nome%)
- **Contagem total** de registros
- **Informações de paginação** na resposta

## Exemplos Práticos

### Buscar usuários com nome "João"

```bash
curl "http://localhost:3000/api/login-app?nome=João"
```

### Buscar usuários com nome "Silva" na página 2

```bash
curl "http://localhost:3000/api/login-app?nome=Silva&page=2&limit=10"
```

### Buscar usuário específico por código

```bash
curl "http://localhost:3000/api/login-app?codLoginApp=123"
```

### Buscar todos os usuários ativos

```bash
curl "http://localhost:3000/api/login-app?ativo=S"
```

### Primeira página de todos os usuários

```bash
curl "http://localhost:3000/api/login-app?page=1&limit=50"
```

## Validações

### Nome

- Não pode estar vazio (após trim)
- Máximo 100 caracteres
- Busca parcial com LIKE

### Código

- Deve ser numérico
- Conversão automática string → number

### Ativo

- Aceita: 'S', 'N', 's', 'n'
- Conversão automática para uppercase

### Paginação

- `page`: Deve ser > 0 (padrão: 1)
- `limit`: Entre 1 e 1000 (padrão: 1000)

## Estrutura de Resposta

### Consultas Paginadas

```json
{
  "message": "X usuário(s) encontrado(s)",
  "data": [...],
  "total": 250,
  "page": 1,
  "limit": 100,
  "totalPages": 3
}
```

### Consulta por Código (sem paginação)

```json
{
  "message": "Usuário encontrado",
  "data": { ... },
  "total": 1
}
```

### Erros de Validação

```json
{
  "message": "Parâmetros de consulta inválidos",
  "errors": [
    {
      "field": "nome",
      "message": "Nome não pode estar vazio",
      "received": ""
    }
  ]
}
```

---

**Status**: ✅ Todas as consultas estão implementadas e funcionais
**Última atualização**: Setembro 2025
