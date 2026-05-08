# Testes de Paginação - LoginApp API

## Exemplos de Requisições

### 1. Consulta Básica (sem parâmetros)

```http
GET http://localhost:3000/api/login-app
```

**Resposta esperada:**

- Primeira página
- 100 registros por página (padrão)
- Informações de paginação incluídas

### 2. Consulta com Paginação Personalizada

```http
GET http://localhost:3000/api/login-app?page=2&limit=50
```

**Resposta esperada:**

- Segunda página
- 50 registros por página
- Total de páginas calculado automaticamente

### 3. Busca por Nome com Paginação

```http
GET http://localhost:3000/api/login-app?nome=João&page=1&limit=25
```

**Resposta esperada:**

- Usuários com nome contendo "João"
- Primeira página, 25 registros

### 4. Usuários Ativos com Paginação

```http
GET http://localhost:3000/api/login-app?ativo=S&page=1&limit=100
```

**Resposta esperada:**

- Apenas usuários ativos
- Primeira página, 100 registros

### 5. Busca por Código Específico (sem paginação)

```http
GET http://localhost:3000/api/login-app?codLoginApp=123
```

**Resposta esperada:**

- Usuário específico ou null
- Sem informações de paginação

## Estrutura de Resposta

```json
{
  "message": "250 usuário(s) encontrado(s)",
  "data": [
    {
      "CodLoginApp": 1,
      "Nome": "João Silva",
      "Ativo": "S",
      "CodUsuario": 101,
      "FotoUsuario": null,
      "PermiteSepararForaSequencia": "S",
      "PermiteConferirForaSequencia": "S",
      "VisualizaTodasSeparacoes": "S",
      "VisualizaTodasConferencias": "S",
      "VisualizaTodasArmazenagem": "S",
      "CodSetorEstoque": 1,
      "CodSetorConferencia": 2,
      "CodSetorArmazenagem": 3,
      "SalvaCarrinhoOutroUsuario": "N",
      "EditaCarrinhoOutroUsuario": "N",
      "ExcluiCarrinhoOutroUsuario": "N",
      "PermiteDevolverItemEntregaBalcao": "S",
      "PermiteDevolverItemEmbalagem": "S"
    }
  ],
  "total": 250,
  "page": 1,
  "limit": 100,
  "totalPages": 3
}
```

## Validações

### Parâmetros Inválidos

```http
GET http://localhost:3000/api/login-app?page=0&limit=2000
```

**Resposta esperada:**

- Status 400
- Mensagem de erro sobre parâmetros inválidos

### Página Inexistente

```http
GET http://localhost:3000/api/login-app?page=999&limit=100
```

**Resposta esperada:**

- Status 200
- Array vazio em data
- Informações de paginação corretas

## Performance

### Cenários de Teste de Carga

1. **Consulta com 1000 registros**: `?limit=1000`
2. **Múltiplas páginas sequenciais**: Testar navegação entre páginas
3. **Filtros combinados**: `?nome=João&ativo=S&page=2&limit=50`

## Monitoramento

- Verificar tempo de resposta para diferentes tamanhos de página
- Monitorar uso de memória em consultas com filtros
- Avaliar performance de contagem total vs paginação direta
