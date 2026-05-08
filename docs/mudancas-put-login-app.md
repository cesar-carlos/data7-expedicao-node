# Mudanças na API PUT /expedicao/login-app

## 🔄 **Alterações Implementadas**

### **ANTES** (CodLoginApp no Body)

```bash
PUT /expedicao/login-app
Content-Type: application/json

{
  "CodLoginApp": 1,        # ❌ No body
  "Senha": "novaSenha123",
  "Ativo": "S"
}
```

### **AGORA** (CodLoginApp como Query Parameter)

```bash
PUT /expedicao/login-app?CodLoginApp=1    # ✅ Query parameter
Content-Type: application/json

{
  "Senha": "novaSenha123",                # ✅ Apenas dados alteráveis no body
  "Ativo": "S"
}
```

## 🏗️ **Implementação Técnica**

### 1. **Nova Validação de Query**

```typescript
// src/validation/login.app.validation.ts
export const updateLoginAppQuerySchema = z.object({
  CodLoginApp: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, {
      message: 'CodLoginApp deve ser um número válido maior que 0',
    }),
});
```

### 2. **Body Schema Atualizado**

```typescript
// CodLoginApp removido do body schema
export const updateLoginAppSchema = z.object({
  Senha: z.string().min(4).max(20).optional(),
  Ativo: z.enum(['S', 'N']).optional(),
  CodUsuario: z.number().optional(),
  FotoUsuario: z.string().optional(),
});
```

### 3. **Rota com Dupla Validação**

```typescript
// src/route/login.app.route.ts
router.put(
  '/login-app',
  validateQuery(updateLoginAppQuerySchema), // ✅ Query validation
  validateBody(updateLoginAppSchema), // ✅ Body validation
  LoginAppController.put,
);
```

### 4. **Controller Atualizado**

```typescript
// src/controllers/expedicao/login.app.controller.ts
public static async put(req: Request, res: Response): Promise<void> {
  const queryData = (req as any).validatedQuery as UpdateLoginAppQuery;
  const updateData = (req as any).validatedBody as UpdateLoginAppRequest;

  const updatedUser = await loginAppService.update({
    CodLoginApp: queryData.CodLoginApp,     // ✅ Do query parameter
    Senha: updateData.Senha,                // ✅ Do body
    Ativo: updateData.Ativo,
    CodUsuario: updateData.CodUsuario,
    FotoUsuario: updateData.FotoUsuario,
  });
}
```

## 🧪 **Exemplos Práticos**

### ✅ **Casos Válidos**

```bash
# Alterar apenas senha
PUT /expedicao/login-app?CodLoginApp=123
{"Senha": "novaSenha456"}

# Alterar status
PUT /expedicao/login-app?CodLoginApp=123
{"Ativo": "N"}

# Atualização múltipla
PUT /expedicao/login-app?CodLoginApp=123
{
  "Senha": "newPassword",
  "Ativo": "S",
  "FotoUsuario": "base64_foto"
}
```

### ❌ **Casos Inválidos**

```bash
# CodLoginApp ausente no query
PUT /expedicao/login-app
{"Senha": "test"}
# ❌ Erro: CodLoginApp é obrigatório

# CodLoginApp inválido
PUT /expedicao/login-app?CodLoginApp=abc
{"Senha": "test"}
# ❌ Erro: deve ser um número válido

# CodLoginApp zero ou negativo
PUT /expedicao/login-app?CodLoginApp=0
{"Senha": "test"}
# ❌ Erro: deve ser maior que 0
```

## 🎯 **Benefícios da Mudança**

### 1. **Segurança**

- ✅ **ID Explícito**: CodLoginApp claramente identificado na URL
- ✅ **Imutabilidade**: ID não pode ser alterado acidentalmente no body
- ✅ **Auditoria**: Logs mostram claramente qual usuário está sendo alterado

### 2. **UX/API Design**

- ✅ **RESTful**: Segue padrão REST de identificar recursos na URL
- ✅ **Clareza**: Separação clara entre identificação (query) e dados (body)
- ✅ **Consistência**: Alinhado com padrões de outras APIs

### 3. **Desenvolvimento**

- ✅ **Type Safety**: Tipos separados para query e body
- ✅ **Validação Dupla**: Query e body validados independentemente
- ✅ **Manutenibilidade**: Código mais claro e separado

## 🔍 **Validações Implementadas**

### **Query Parameter**

```typescript
CodLoginApp: {
  required: true,           // Obrigatório
  type: 'number',          // Convertido de string para number
  min: 1,                  // Maior que 0
  transform: parseInt      // Auto-conversão
}
```

### **Request Body**

```typescript
{
  Senha?: string,          // 4-20 chars, hasheada automaticamente
  Ativo?: 'S' | 'N',      // Enum validation
  CodUsuario?: number,     // Opcional
  FotoUsuario?: string     // Base64 validation
}
```

---

## ✅ **Status**: Implementação Completa

- [x] **Schema Validation**: Query e Body separados
- [x] **Route Configuration**: Dupla validação ativa
- [x] **Controller Logic**: Query + Body handling
- [x] **Service Integration**: CodLoginApp do query
- [x] **Documentation**: Exemplos atualizados
- [x] **Type Safety**: TypeScript types corretos

**A API agora usa CodLoginApp como query parameter obrigatório! 🚀**
