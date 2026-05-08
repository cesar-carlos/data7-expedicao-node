# API PUT /expedicao/login-app - Atualizar Usuário LoginApp

## 📋 **Overview**

Endpoint para atualizar dados de usuários do sistema LoginApp com validação completa e segurança.

## 🌐 **Endpoint**

```
PUT /expedicao/login-app?CodLoginApp={id}
```

## 🔧 **Query Parameters**

```typescript
{
  CodLoginApp: number; // Obrigatório - ID do usuário a ser atualizado
}
```

## 🔧 **Request Body**

### **Schema de Validação**

```typescript
{
  Senha?: string;           // Opcional - Nova senha (4-20 chars)
  Ativo?: "S" | "N";        // Opcional - Status ativo
  CodUsuario?: number;      // Opcional - Código do usuário sistema
  FotoUsuario?: string;     // Opcional - Foto em base64
}
```

### **Validações Aplicadas**

- ✅ **CodLoginApp**: Obrigatório, número > 0 (apenas identificação, não alterável)
- ❌ **Nome**: **NÃO ALTERÁVEL** - mantém valor original
- ✅ **Senha**: 4-20 caracteres, será hasheada com bcrypt
- ✅ **Ativo**: Apenas "S" ou "N"
- ✅ **FotoUsuario**: Base64 válido ou omitido

## 🧪 **Exemplos de Uso**

### 1. **Atualizar Status**

```bash
curl -X PUT "http://localhost:3000/expedicao/login-app?CodLoginApp=1" \
  -H "Content-Type: application/json" \
  -d '{
    "Ativo": "S"
  }'
```

### 2. **Alterar Senha**

```bash
curl -X PUT "http://localhost:3000/expedicao/login-app?CodLoginApp=1" \
  -H "Content-Type: application/json" \
  -d '{
    "Senha": "novaSenha123"
  }'
```

### 3. **Atualizar Foto do Usuário**

```bash
curl -X PUT "http://localhost:3000/expedicao/login-app?CodLoginApp=1" \
  -H "Content-Type: application/json" \
  -d '{
    "FotoUsuario": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA"
  }'
```

### 4. **Atualização Completa (sem Nome)**

```bash
curl -X PUT "http://localhost:3000/expedicao/login-app?CodLoginApp=1" \
  -H "Content-Type: application/json" \
  -d '{
    "Senha": "novasenha456",
    "Ativo": "S",
    "CodUsuario": 100,
    "FotoUsuario": "base64_da_nova_foto"
  }'
```

### 5. **Desativar Usuário**

```bash
curl -X PUT "http://localhost:3000/expedicao/login-app?CodLoginApp=1" \
  -H "Content-Type: application/json" \
  -d '{
    "Ativo": "N"
  }'
```

## 📤 **Responses**

### ✅ **Sucesso - 200 OK**

```json
{
  "message": "Usuário atualizado com sucesso",
  "user": {
    "CodLoginApp": 1,
    "Nome": "João Silva Atualizado",
    "Ativo": "S",
    "CodUsuario": 100,
    "FotoUsuario": "base64_da_foto_ou_null"
    // Senha nunca é retornada por segurança
  }
}
```

### ❌ **Erro - Usuário Não Encontrado - 404**

```json
{
  "message": "Usuário não encontrado para atualização"
}
```

### ❌ **Erro - Nome Duplicado - 400**

```json
{
  "message": "Já existe um usuário com este nome"
}
```

### ❌ **Erro - Validação - 400**

```json
{
  "message": "Erro de validação",
  "errors": [
    {
      "field": "CodLoginApp",
      "message": "CodLoginApp é obrigatório e deve ser maior que 0"
    },
    {
      "field": "Nome",
      "message": "Nome deve ter no máximo 30 caracteres"
    }
  ]
}
```

### ❌ **Erro - Servidor - 500**

```json
{
  "message": "Erro interno: Descrição do erro"
}
```

## 🔒 **Recursos de Segurança**

### **Validações de Negócio**

- ✅ **Usuário Existe**: Verifica se CodLoginApp é válido
- ✅ **Nome Único**: Impede nomes duplicados no sistema
- ✅ **Password Hash**: Senha é hasheada com bcrypt (salt rounds 12)
- ✅ **Data Sanitization**: Todos os campos são validados e sanitizados

### **Proteções Implementadas**

- ✅ **Senha Nunca Retornada**: Response não inclui hash da senha
- ✅ **Buffer Handling**: FotoUsuario convertida corretamente
- ✅ **Type Safety**: TypeScript + Zod garantem tipos corretos
- ✅ **SQL Injection Prevention**: Parâmetros parametrizados

## ⚡ **Fluxo de Atualização**

### **Processo Interno**

```
1. Validação Zod ✅
   ↓
2. Verificar se usuário existe ✅
   ↓
3. Validar nome único (se alterado) ✅
   ↓
4. Hash da senha (se fornecida) ✅
   ↓
5. Converter foto base64→Buffer ✅
   ↓
6. Atualizar no banco de dados ✅
   ↓
7. Retornar usuário atualizado ✅
```

### **Campos Atualizáveis**

- ✅ **Nome**: String única no sistema
- ✅ **Senha**: Hasheada automaticamente
- ✅ **Ativo**: Status S/N
- ✅ **CodUsuario**: Código de integração
- ✅ **FotoUsuario**: Base64 → Buffer → Base64 (response)

## 🎯 **Casos de Uso**

### **1. Atualização de Perfil**

- **Cenário**: Usuário altera nome e foto
- **Campos**: `Nome`, `FotoUsuario`
- **Validação**: Nome único, base64 válido

### **2. Alteração de Senha**

- **Cenário**: Reset/alteração de senha
- **Campos**: `Senha`
- **Segurança**: Hash automático, não retorna no response

### **3. Ativação/Desativação**

- **Cenário**: Admin ativa/desativa usuário
- **Campos**: `Ativo`
- **Efeito**: Controla acesso ao sistema

### **4. Integração Sistema**

- **Cenário**: Linking com outro sistema
- **Campos**: `CodUsuario`
- **Propósito**: Referência externa

### **5. Atualização Administrativa**

- **Cenário**: Admin altera múltiplos campos
- **Campos**: Todos exceto `CodLoginApp`
- **Controle**: Validações completas

## 📊 **Performance**

### **Métricas Estimadas**

- **Response Time**: < 300ms (inclui hash de senha)
- **Database Queries**: 2-3 (verificação + update)
- **Memory Usage**: ~1MB por request
- **Concurrent Users**: 50+ simultâneos

### **Otimizações**

- ✅ **Validação Prévia**: Evita queries desnecessárias
- ✅ **Update Condicional**: Apenas campos alterados
- ✅ **Hash Eficiente**: bcrypt otimizado
- ✅ **Response Compacta**: Sem dados sensíveis

---

## ✅ **Status de Implementação**

- [x] **Service**: Método `update()` completo
- [x] **Controller**: PUT method implementado
- [x] **Validation**: Schema `updateLoginAppSchema`
- [x] **Route**: PUT com validação middleware
- [x] **Security**: Password hash + data sanitization
- [x] **Error Handling**: Tratamento completo de erros
- [x] **Documentation**: Guia completo de uso

**Endpoint PUT /expedicao/login-app pronto para uso! 🚀**
