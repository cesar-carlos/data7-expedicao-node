# Tratamento de FotoUsuario - LoginApp API

## Overview

A API de login agora retorna corretamente o campo `FotoUsuario` durante a autenticação, com tratamento adequado para diferentes formatos de dados.

## Implementação

### POST /api/login-app

**Request Body:**

```json
{
  "Nome": "usuario123",
  "Senha": "minhasenha"
}
```

**Response (Sucesso):**

```json
{
  "message": "Login realizado com sucesso",
  "user": {
    "CodLoginApp": 1,
    "Nome": "usuario123",
    "Ativo": "S",
    "CodUsuario": 101,
    "FotoUsuario": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
  }
}
```

## Tratamento de Dados

### FotoUsuario - Conversão Automática

#### 1. **Buffer → Base64**

```typescript
// Se FotoUsuario é Buffer (varbinary do SQL Server)
FotoUsuario: user.FotoUsuario instanceof Buffer ? user.FotoUsuario.toString('base64') : user.FotoUsuario;
```

#### 2. **Valores Nulos**

```typescript
// Se não há foto, retorna null
FotoUsuario: user.FotoUsuario ? convertedValue : null;
```

#### 3. **Formato de Resposta**

- **Com foto**: String base64 pronta para uso
- **Sem foto**: `null`
- **Para exibição**: Use como `data:image/jpeg;base64,{FotoUsuario}`

## Segurança

### Dados Removidos

- ✅ **Senha**: Nunca retornada na resposta
- ✅ **Dados sensíveis**: Filtrados adequadamente

### Dados Incluídos

- ✅ **FotoUsuario**: Convertida para base64
- ✅ **Informações básicas**: CodLoginApp, Nome, Ativo, CodUsuario

## Fluxo de Autenticação

### 1. **LoginAppService.authenticate()**

```typescript
// Retorna usuário completo (incluindo FotoUsuario como Buffer)
return new ExpedicaoLoginAppDto({
  CodLoginApp: user.CodLoginApp,
  Ativo: user.Ativo,
  Nome: user.Nome,
  Senha: '', // Limpa senha
  CodUsuario: user.CodUsuario,
  FotoUsuario: user.FotoUsuario, // Buffer do banco
});
```

### 2. **LoginAppController.post()**

```typescript
// Converte FotoUsuario para base64 para JSON
const userResponse = {
  CodLoginApp: user.CodLoginApp,
  Nome: user.Nome,
  Ativo: user.Ativo,
  CodUsuario: user.CodUsuario,
  FotoUsuario: user.FotoUsuario
    ? user.FotoUsuario instanceof Buffer
      ? user.FotoUsuario.toString('base64')
      : user.FotoUsuario
    : null,
};
```

## Exemplos de Uso

### Frontend - Exibição da Foto

```javascript
// JavaScript
const response = await fetch('/api/login-app', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ Nome: 'usuario', Senha: 'senha' }),
});

const data = await response.json();

if (data.user.FotoUsuario) {
  // Criar URL da imagem
  const imageUrl = `data:image/jpeg;base64,${data.user.FotoUsuario}`;

  // Usar em img tag
  document.getElementById('userPhoto').src = imageUrl;
}
```

### React - Componente de Foto

```jsx
function UserPhoto({ user }) {
  const photoSrc = user.FotoUsuario ? `data:image/jpeg;base64,${user.FotoUsuario}` : '/default-avatar.png';

  return <img src={photoSrc} alt={user.Nome} className="user-avatar" />;
}
```

## Casos de Teste

### ✅ Usuário com foto

```bash
curl -X POST http://localhost:3000/api/login-app \
  -H "Content-Type: application/json" \
  -d '{"Nome": "usuario_com_foto", "Senha": "senha123"}'
```

**Esperado**: FotoUsuario como string base64

### ✅ Usuário sem foto

```bash
curl -X POST http://localhost:3000/api/login-app \
  -H "Content-Type: application/json" \
  -d '{"Nome": "usuario_sem_foto", "Senha": "senha123"}'
```

**Esperado**: FotoUsuario como null

### ✅ Credenciais inválidas

```bash
curl -X POST http://localhost:3000/api/login-app \
  -H "Content-Type: application/json" \
  -d '{"Nome": "usuario", "Senha": "senha_errada"}'
```

**Esperado**: Status 401, sem dados do usuário

## Performance

### Otimizações Implementadas:

- **Conversão lazy**: Só converte se FotoUsuario existe
- **Verificação de tipo**: Detecta Buffer automaticamente
- **Mínimo overhead**: Conversão direta base64

### Considerações:

- **Tamanho**: Imagens base64 são ~33% maiores
- **Cache**: Consider cache no frontend para fotos
- **Compressão**: Use gzip na resposta HTTP

---

**Status**: ✅ Implementado e funcional
**Versão**: 1.1.0
**Data**: Setembro 2025
