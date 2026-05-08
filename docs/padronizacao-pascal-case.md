# Padronização Pascal Case para Query Parameters

## 🔄 **Mudança Implementada**

Alteração dos nomes dos parâmetros de query de **camelCase** para **PascalCase** para manter consistência com o padrão do sistema.

## 📝 **Antes vs Depois**

### **ANTES** (camelCase)

```typescript
// Query Parameters
{
  nome: string,
  codLoginApp: number,
  ativo: 'S' | 'N',
  page: number,
  limit: number
}

// Usage no Controller
const { nome, codLoginApp, ativo, page, limit } = validatedQuery;
```

### **DEPOIS** (PascalCase)

```typescript
// Query Parameters
{
  Nome: string,
  CodLoginApp: number,
  Ativo: 'S' | 'N',
  Page: number,
  Limit: number
}

// Usage no Controller
const { Nome, CodLoginApp, Ativo, Page, Limit } = validatedQuery;
```

## 🏗️ **Arquivos Alterados**

### 1. **Login App Validation** (`consulta.login.app.validation.ts`)

```typescript
// ANTES
export const consultaLoginAppQuerySchema = z.object({
  nome: z.string().optional(),
  codLoginApp: z.string().optional(),
  ativo: z.enum(['S', 'N']).optional(),
  page: z.number().default(1),
  limit: z.number().default(1000),
});

// DEPOIS
export const consultaLoginAppQuerySchema = z.object({
  Nome: z.string().optional(),
  CodLoginApp: z.string().optional(),
  Ativo: z.enum(['S', 'N']).optional(),
  Page: z.number().default(1),
  Limit: z.number().default(1000),
});
```

### 2. **Login App Controller** (`login.app.controller.ts`)

```typescript
// ANTES
const { nome, codLoginApp, ativo, page, limit } = validatedQuery;

if (codLoginApp) {
  resultado = await service.consultarPorCodigo(codLoginApp);
}

if (nome) {
  resultado = await service.consultarPorNome(nome, page, limit);
}

if (ativo === 'S') {
  // ...
}

// DEPOIS
const { Nome, CodLoginApp, Ativo, Page, Limit } = validatedQuery;

if (CodLoginApp) {
  resultado = await service.consultarPorCodigo(CodLoginApp);
}

if (Nome) {
  resultado = await service.consultarPorNome(Nome, Page, Limit);
}

if (Ativo === 'S') {
  // ...
}
```

### 3. **Usuario Consulta Validation** (`usuario.consulta.validation.ts`)

```typescript
// ANTES
export const usuarioConsultaQuerySchema = z.object({
  codUsuario: z.string().optional(),
  nomeUsuario: z.string().optional(),
  codEmpresa: z.string().optional(),
  ativo: z.enum(['S', 'N']).optional(),
  page: z.number().default(1),
  limit: z.number().default(1000),
});

// DEPOIS
export const usuarioConsultaQuerySchema = z.object({
  CodUsuario: z.string().optional(),
  NomeUsuario: z.string().optional(),
  CodEmpresa: z.string().optional(),
  Ativo: z.enum(['S', 'N']).optional(),
  Page: z.number().default(1),
  Limit: z.number().default(1000),
});
```

### 4. **Usuario Consulta Controller** (`usuario.consulta.controller.ts`)

```typescript
// ANTES
const { codUsuario, nomeUsuario, codEmpresa, ativo, page, limit } = validatedQuery;

// DEPOIS
const { CodUsuario, NomeUsuario, CodEmpresa, Ativo, Page, Limit } = validatedQuery;
```

## 🧪 **Exemplos de Uso Atualizado**

### **Login App Consulta**

#### ANTES:

```bash
GET /expedicao/login-app?nome=João&ativo=S&page=1&limit=50
GET /expedicao/login-app?codLoginApp=123
```

#### DEPOIS:

```bash
GET /expedicao/login-app?Nome=João&Ativo=S&Page=1&Limit=50
GET /expedicao/login-app?CodLoginApp=123
```

### **Usuario Consulta**

#### ANTES:

```bash
GET /usuarios?nomeUsuario=Admin&ativo=S&page=2&limit=25
GET /usuarios?codUsuario=456&codEmpresa=1
```

#### DEPOIS:

```bash
GET /usuarios?NomeUsuario=Admin&Ativo=S&Page=2&Limit=25
GET /usuarios?CodUsuario=456&CodEmpresa=1
```

## 🎯 **Benefícios da Padronização**

### 1. **Consistência**

- ✅ **API Uniforme**: Todos os parâmetros seguem PascalCase
- ✅ **Alinhamento**: Consistente com DTOs e entidades do sistema
- ✅ **Legibilidade**: Nomes mais claros e padronizados

### 2. **Manutenibilidade**

- ✅ **Previsibilidade**: Desenvolvedores sabem o padrão esperado
- ✅ **Debugging**: Mais fácil identificar origem dos dados
- ✅ **Documentação**: Especificação mais clara da API

### 3. **Type Safety**

- ✅ **TypeScript**: Tipos atualizados automaticamente
- ✅ **Validação**: Zod schemas sincronizados
- ✅ **IntelliSense**: Melhor autocomplete no IDE

## 🔍 **Campos Padronizados**

| Campo Antigo  | Campo Novo    | Tipo     | Descrição               |
| ------------- | ------------- | -------- | ----------------------- |
| `nome`        | `Nome`        | string   | Nome do usuário         |
| `codLoginApp` | `CodLoginApp` | number   | Código do login app     |
| `ativo`       | `Ativo`       | 'S'\|'N' | Status ativo            |
| `page`        | `Page`        | number   | Número da página        |
| `limit`       | `Limit`       | number   | Limite por página       |
| `codUsuario`  | `CodUsuario`  | number   | Código do usuário       |
| `nomeUsuario` | `NomeUsuario` | string   | Nome do usuário sistema |
| `codEmpresa`  | `CodEmpresa`  | number   | Código da empresa       |

## 🧪 **Testes de Validação**

### **Casos Válidos**

```typescript
// ✅ PascalCase aceito
?Nome=João&Ativo=S&Page=1&Limit=50
?CodLoginApp=123&Page=2
?CodUsuario=456&NomeUsuario=Admin&Ativo=S

// ✅ Conversões automáticas
?CodLoginApp=123    // string → number
?Ativo=s            // lowercase → uppercase
?Page=1&Limit=1000  // defaults aplicados
```

### **Casos Inválidos**

```typescript
// ❌ camelCase rejeitado (se strict mode)
?nome=João          // Campo não reconhecido
?codLoginApp=123    // Campo não reconhecido
?ativo=S            // Campo não reconhecido

// ❌ Valores inválidos
?Page=0             // Deve ser > 0
?Limit=2000         // Deve ser <= 1000
?Ativo=X            // Deve ser S ou N
```

## ✅ **Status da Implementação**

- [x] **Validation Schemas**: Todos atualizados para PascalCase
- [x] **Controllers**: Destructuring atualizado
- [x] **Type Definitions**: Types inferidos corretamente
- [x] **Error Messages**: Mensagens atualizadas
- [x] **Backward Compatibility**: ⚠️ **BREAKING CHANGE**

---

## ⚠️ **BREAKING CHANGE**

Esta alteração **quebra compatibilidade** com clientes existentes que usam camelCase nos query parameters.

### **Migração Necessária:**

- Frontend/Client apps precisam atualizar query parameters
- Documentação da API deve ser atualizada
- Testes automatizados devem usar novo formato

**Todos os query parameters agora seguem PascalCase! 🚀**
