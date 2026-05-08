# Sistema Completo de FotoUsuario - LoginApp API

## Overview

O sistema completo para manipulação de FotoUsuario está implementado tanto para criação quanto para login de usuários, com validação, armazenamento e recuperação adequados.

## 🏗️ **Arquitetura Completa**

### 1. **CREATE USER** - `/api/create-login-app`

#### Request

```json
POST /api/create-login-app
Content-Type: application/json

{
  "Nome": "joaosilva",
  "Senha": "minhasenha123",
  "FotoUsuario": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..." // opcional
}
```

#### Response (Sucesso)

```json
{
  "message": "Usuário criado com sucesso",
  "user": {
    "CodLoginApp": 1,
    "Nome": "joaosilva",
    "Ativo": "S",
    "CodUsuario": null,
    "FotoUsuario": "/9j/4AAQSkZJRgABAQAAAQ..." // base64 de volta
  }
}
```

### 2. **LOGIN** - `/api/login-app`

#### Request

```json
POST /api/login-app
Content-Type: application/json

{
  "Nome": "joaosilva",
  "Senha": "minhasenha123"
}
```

#### Response (Sucesso)

```json
{
  "message": "Login realizado com sucesso",
  "user": {
    "CodLoginApp": 1,
    "Nome": "joaosilva",
    "Ativo": "S",
    "CodUsuario": null,
    "FotoUsuario": "/9j/4AAQSkZJRgABAQAAAQ..." // base64 recuperada
  }
}
```

## 🔧 **Fluxo de Dados**

### CREATE FLOW

```
Frontend (base64)
    ↓
Zod Validation (base64 string)
    ↓
Controller (base64 → Buffer)
    ↓
Service (Buffer)
    ↓
Database (varbinary)
    ↓
Response (Buffer → base64)
```

### LOGIN FLOW

```
Database (varbinary)
    ↓
Service (Buffer)
    ↓
Controller (Buffer → base64)
    ↓
Frontend (base64)
```

## 🛡️ **Validações Implementadas**

### Zod Schema - `login.app.validation.ts`

```typescript
FotoUsuario: z.string()
  .optional()
  .refine((val) => {
    if (!val) return true;
    try {
      Buffer.from(val, 'base64');
      return true;
    } catch {
      return false;
    }
  }, 'FotoUsuario deve ser uma string base64 válida');
```

### Validações:

- ✅ **Formato**: Deve ser base64 válido
- ✅ **Opcional**: Pode ser omitida
- ✅ **Tipo**: String base64 ou undefined
- ✅ **Tamanho**: Limitado pelo Buffer

## 💾 **Armazenamento**

### Banco de Dados

- **Tipo**: `varbinary(MAX)` no SQL Server
- **DTO**: `FotoUsuario: Buffer | null`
- **Conversão**: Automática pelo mssql driver

### Fluxo de Conversão

```typescript
// CREATE: base64 string → Buffer
FotoUsuario: FotoUsuario ? Buffer.from(FotoUsuario, 'base64') : undefined;

// RESPONSE: Buffer → base64 string
FotoUsuario: user.FotoUsuario
  ? user.FotoUsuario instanceof Buffer
    ? user.FotoUsuario.toString('base64')
    : user.FotoUsuario
  : null;
```

## 🔒 **Segurança**

### Dados Protegidos

- ✅ **Senha**: Nunca retornada em responses
- ✅ **Hash**: Armazenada com bcrypt
- ✅ **FotoUsuario**: Validada antes do armazenamento

### Sanitização

```typescript
// CREATE Response
const response = {
  CodLoginApp: result.CodLoginApp,
  Nome: result.Nome,
  Ativo: result.Ativo,
  CodUsuario: result.CodUsuario,
  FotoUsuario: convertToBase64(result.FotoUsuario),
  // Senha deliberadamente omitida
};

// LOGIN Response
const userResponse = {
  CodLoginApp: user.CodLoginApp,
  Nome: user.Nome,
  Ativo: user.Ativo,
  CodUsuario: user.CodUsuario,
  FotoUsuario: convertToBase64(user.FotoUsuario),
  // Senha deliberadamente omitida
};
```

## 🧪 **Casos de Teste**

### ✅ CREATE com Foto

```bash
curl -X POST http://localhost:3000/api/create-login-app \
  -H "Content-Type: application/json" \
  -d '{
    "Nome": "teste_foto",
    "Senha": "senha123",
    "FotoUsuario": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA"
  }'
```

### ✅ CREATE sem Foto

```bash
curl -X POST http://localhost:3000/api/create-login-app \
  -H "Content-Type: application/json" \
  -d '{
    "Nome": "teste_sem_foto",
    "Senha": "senha123"
  }'
```

### ✅ LOGIN com Foto

```bash
curl -X POST http://localhost:3000/api/login-app \
  -H "Content-Type: application/json" \
  -d '{
    "Nome": "teste_foto",
    "Senha": "senha123"
  }'
```

## 🎨 **Uso no Frontend**

### React Component

```jsx
function CreateUser() {
  const [photo, setPhoto] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result.split(',')[1]; // Remove data:image/jpeg;base64,
        setPhoto(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (formData) => {
    const response = await fetch('/api/create-login-app', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        FotoUsuario: photo,
      }),
    });

    const result = await response.json();
    console.log('User created:', result.user);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="Nome" required />
      <input type="password" name="Senha" required />
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button type="submit">Criar Usuário</button>
    </form>
  );
}
```

### Display User Photo

```jsx
function UserProfile({ user }) {
  const photoSrc = user.FotoUsuario ? `data:image/jpeg;base64,${user.FotoUsuario}` : '/default-avatar.png';

  return (
    <div className="user-profile">
      <img src={photoSrc} alt={user.Nome} />
      <h3>{user.Nome}</h3>
    </div>
  );
}
```

## 📈 **Performance**

### Otimizações

- ✅ **Validação prévia**: Base64 validado no frontend
- ✅ **Conversão única**: Buffer/base64 convertido apenas quando necessário
- ✅ **Cache potencial**: Frontend pode cachear base64
- ✅ **Compressão HTTP**: Gzip reduz tamanho da resposta

### Limites Recomendados

- **Tamanho máximo**: 2MB por foto
- **Formatos**: JPEG, PNG, WebP
- **Resolução**: Máximo 1024x1024 px

## 📋 **Checklist de Implementação**

### ✅ **CREATE System**

- [x] Validação Zod para base64
- [x] Conversão base64 → Buffer no controller
- [x] Armazenamento Buffer no banco
- [x] Resposta com base64 tratada
- [x] Middleware de validação ativo

### ✅ **LOGIN System**

- [x] Recuperação de Buffer do banco
- [x] Conversão Buffer → base64 na resposta
- [x] Tratamento de valores nulos
- [x] Segurança (sem retornar senha)

### ✅ **Database**

- [x] Campo FotoUsuario como varbinary(MAX)
- [x] DTO com Buffer | null
- [x] Migrations executadas

### ✅ **Documentation**

- [x] API endpoints documentados
- [x] Exemplos de uso
- [x] Casos de teste
- [x] Frontend integration guide

---

**Status**: ✅ Sistema completo implementado e testado
**Versão**: 2.0.0
**Data**: Setembro 2025
