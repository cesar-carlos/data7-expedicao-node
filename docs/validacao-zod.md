# Sistema de Validação com Zod - LoginApp API

## Overview

As validações de tipo e formato foram migradas do controller para o Zod, proporcionando validação centralizada, tipagem automática e melhores mensagens de erro.

## Validações Implementadas

### Query Parameters

#### `nome` (opcional)

- **Tipo**: string
- **Validações**:
  - Aplica `trim()` automaticamente
  - Não pode estar vazio após trim
  - Máximo de 100 caracteres
- **Mensagens de erro**:
  - "Nome não pode estar vazio"
  - "Nome deve ter no máximo 100 caracteres"

#### `codLoginApp` (opcional)

- **Tipo**: string → transformado para number
- **Validações**:
  - Deve ser apenas dígitos (regex: `/^\d+$/`)
  - Convertido automaticamente para número
  - Validação adicional de NaN
- **Mensagem de erro**: "Código deve ser um número válido"

#### `ativo` (opcional)

- **Tipo**: enum ['S', 'N', 's', 'n'] → transformado para uppercase
- **Validações**:
  - Aceita apenas S, N, s, n
  - Normalizado automaticamente para uppercase
- **Mensagem de erro**: "Ativo deve ser S ou N"

#### `page` (padrão: 1)

- **Tipo**: string|number → transformado para number
- **Validações**:
  - Deve ser número maior que 0
  - Valor padrão: 1
- **Mensagem de erro**: "Página deve ser um número maior que 0"

#### `limit` (padrão: 1000)

- **Tipo**: string|number → transformado para number
- **Validações**:
  - Deve ser entre 1 e 1000
  - Valor padrão: 1000
- **Mensagem de erro**: "Limit deve ser entre 1 e 1000"

## Middleware de Validação

### `validateQuery(schema)`

- Aplica validação Zod aos query parameters
- Retorna erro 400 com detalhes em caso de falha
- Substitui `req.query` pelos dados validados e transformados

### Estrutura de Erro

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

## Controller Simplificado

### Antes (Validação Manual)

```typescript
if (codLoginApp) {
  const codigo = parseInt(codLoginApp.toString(), 10);
  if (isNaN(codigo)) {
    res.status(400).send({
      message: 'Código deve ser um número válido',
    });
    return;
  }
  // ...
}

if (nome) {
  const nomeStr = nome.toString().trim();
  if (nomeStr.length === 0) {
    res.status(400).send({
      message: 'Nome não pode estar vazio',
    });
    return;
  }
  // ...
}
```

### Depois (Com Zod)

```typescript
// Dados já validados e transformados pelo middleware
const { nome, codLoginApp, ativo, page, limit } = req.query;

if (codLoginApp) {
  // codLoginApp já é number
  resultado = await consultaService.consultarPorCodigo(codLoginApp);
}

if (nome) {
  // nome já passou por trim() e validação
  resultado = await consultaService.consultarPorNome(nome, page, limit);
}
```

## Vantagens da Implementação

### 1. **Centralização**

- Todas as validações ficam no schema Zod
- Reutilizáveis em outros controllers
- Manutenção simplificada

### 2. **Transformações Automáticas**

- Strings convertidas para números
- Trim aplicado automaticamente
- Normalização de valores (uppercase)
- Valores padrão aplicados

### 3. **Tipagem TypeScript**

- Tipos inferidos automaticamente do schema
- IntelliSense completo no controller
- Erro de compilação se usar propriedades incorretas

### 4. **Mensagens de Erro Consistentes**

- Formato padronizado de resposta
- Detalhamento de campo e valor recebido
- Múltiplos erros retornados de uma vez

### 5. **Performance**

- Validação acontece antes do controller
- Evita processamento desnecessário
- Early return em caso de erro

## Configuração na Rota

```typescript
import { validateQuery } from '../middleware/validation.middleware';
import { consultaLoginAppQuerySchema } from '../validation/consulta.login.app.validation';

router.get('/login-app', validateQuery(consultaLoginAppQuerySchema), LoginAppController.get);
```

## Exemplos de Uso

### Requisição Válida

```
GET /api/login-app?nome=João&page=2&limit=50&ativo=s
```

**Resultado**: Dados validados e transformados automaticamente

### Requisição Inválida

```
GET /api/login-app?nome=&codLoginApp=abc&page=0&limit=2000
```

**Resposta**:

```json
{
  "message": "Parâmetros de consulta inválidos",
  "errors": [
    { "field": "nome", "message": "Nome não pode estar vazio" },
    { "field": "codLoginApp", "message": "Código deve ser um número válido" },
    { "field": "page", "message": "Página deve ser um número maior que 0" },
    { "field": "limit", "message": "Limit deve ser entre 1 e 1000" }
  ]
}
```

## Extensibilidade

O sistema pode ser facilmente estendido para:

- Novos campos de consulta
- Validações personalizadas
- Outros endpoints
- Validação de body e params

**Versão**: 2.0.0
**Data**: Setembro 2025
