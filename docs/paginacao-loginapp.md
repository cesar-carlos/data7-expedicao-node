# Sistema de Paginação - LoginApp API

## Overview

O sistema de consulta de usuários LoginApp agora suporta paginação para melhorar a performance e experiência do usuário ao lidar com grandes volumes de dados.

## Funcionalidades

### Endpoints com Paginação

#### GET /api/login-app

Consulta usuários do sistema com suporte a paginação.

**Query Parameters:**

- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Número de registros por página (padrão: 1000, máximo: 1000)
- `nome` (opcional): Filtro por nome (busca parcial com LIKE)
- `codLoginApp` (opcional): Filtro por código específico
- `ativo` (opcional): Filtro por status ativo ('S' ou 'N')

**Exemplos de Uso:**

```bash
# Primeira página com 1000 registros (padrão)
GET /api/login-app

# Segunda página com 50 registros
GET /api/login-app?page=2&limit=50

# Busca por nome com paginação
GET /api/login-app?nome=João&page=1&limit=25

# Usuários ativos, página 3, 100 por página
GET /api/login-app?ativo=S&page=3&limit=100
```

**Resposta:**

```json
{
  "message": "X usuário(s) encontrado(s)",
  "data": [...], // Array com os dados dos usuários
  "total": 2500,  // Total de registros encontrados
  "page": 1,     // Página atual
  "limit": 1000,  // Registros por página
  "totalPages": 3 // Total de páginas disponíveis
}
```

## Implementação Técnica

### Validação de Parâmetros

- **page**: Deve ser um número maior que 0
- **limit**: Deve ser um número entre 1 e 1000
- Valores padrão são aplicados automaticamente quando não informados

### Métodos do Service

#### consultarTodos(page?, limit?)

- Retorna todos os usuários com paginação
- **Parâmetros**: page (padrão: 1), limit (padrão: 1000)
- **Retorno**: PaginatedResult

#### consultarPorNome(nome, page?, limit?)

- Busca usuários por nome com paginação
- **Parâmetros**: nome (obrigatório), page (padrão: 1), limit (padrão: 1000)
- **Retorno**: PaginatedResult

#### consultarAtivos(page?, limit?)

- Retorna usuários ativos com paginação
- **Parâmetros**: page (padrão: 1), limit (padrão: 1000)
- **Retorno**: PaginatedResult

#### consultarPorCodigo(codLoginApp)

- Busca usuário específico por código (não paginado)
- **Parâmetros**: codLoginApp (obrigatório)
- **Retorno**: ExpedicaoLoginAppConsultaDto | null

### Interface PaginatedResult

```typescript
interface PaginatedResult {
  data: ExpedicaoLoginAppConsultaDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

## Considerações de Performance

1. **Contagem Total**: Para métodos com filtro (nome, ativo), primeiro buscamos todos os registros para contar o total, depois aplicamos a paginação em memória.

2. **Método Otimizado**: Para `consultarTodos()`, usamos paginação direta no repository level.

3. **Limite Máximo**: Estabelecido limite de 1000 registros por página para evitar sobrecarga.

## Logs e Monitoramento

- Todos os erros são capturados e retornados com mensagens descritivas
- O sistema mantém a estrutura de resposta consistente para todos os endpoints

## Versionamento

- **Versão**: 1.0.0
- **Compatibilidade**: Mantém compatibilidade com versões anteriores através de valores padrão
- **Data**: Setembro 2025
