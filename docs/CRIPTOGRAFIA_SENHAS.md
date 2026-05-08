# Sistema de Criptografia de Senhas - Login App

## Funcionalidades Implementadas

### 🔐 Criptografia de Senhas

- **bcryptjs** com salt rounds 12 (alto nível de segurança)
- Hash das senhas antes de armazenar no banco
- Verificação segura durante login

### ✅ Validações de Segurança

- Verificação de usuário único (não permite duplicatas)
- Validação de força da senha (mínimo 6, máximo 50 caracteres)
- Senhas nunca retornadas nas respostas da API

### 📡 Endpoints Disponíveis

#### 1. Criar Usuário (com senha criptografada)

```http
POST /expedicao/create-login-app
Content-Type: application/json

{
  "Nome": "joao.silva",
  "Senha": "minhasenha123",
  "FotoUsuario": "base64_da_imagem_opcional"
}
```

**Resposta de Sucesso:**

```json
{
  "CodLoginApp": 1,
  "Ativo": "S",
  "Nome": "joao.silva",
  "Senha": "", // Senha nunca é retornada
  "CodUsuario": null,
  "FotoUsuario": "base64_da_imagem"
}
```

#### 2. Fazer Login (verificação com bcrypt)

```http
POST /expedicao/login-app
Content-Type: application/json

{
  "Nome": "joao.silva",
  "Senha": "minhasenha123"
}
```

**Resposta de Sucesso:**

```json
{
  "message": "Login realizado com sucesso",
  "user": {
    "CodLoginApp": 1,
    "Ativo": "S",
    "Nome": "joao.silva",
    "CodUsuario": null,
    "FotoUsuario": "base64_da_imagem"
  }
}
```

**Resposta de Erro (credenciais inválidas):**

```json
{
  "message": "Credenciais inválidas ou usuário inativo"
}
```

#### 3. Buscar Usuários

```http
GET /expedicao/login-app?nome=joao
```

### 🛡️ Segurança Implementada

1. **Senha criptografada**: Usa bcrypt com salt rounds 12
2. **Validação de duplicatas**: Não permite usuários com mesmo nome
3. **Validação de senha**: Critérios mínimos de segurança
4. **Resposta limpa**: Senhas nunca retornadas nas APIs
5. **Usuários ativos**: Só autentica usuários com Ativo = 'S'

### 🔧 Como funciona internamente

1. **Criação de usuário**:
   - Valida se o nome já existe
   - Valida força da senha
   - Criptografa senha com bcrypt
   - Salva no banco com senha hasheada

2. **Login**:
   - Busca usuário pelo nome
   - Compara senha fornecida com hash do banco
   - Retorna dados sem a senha

### 🧪 Exemplo de uso no código

```typescript
// Criar usuário
const user = await createUserService.execute({
  Nome: 'usuario.teste',
  Senha: 'senha123', // Será criptografada automaticamente
  FotoUsuario: buffer, // Opcional
});

// Fazer login
const authenticatedUser = await loginService.authenticate({
  Nome: 'usuario.teste',
  Senha: 'senha123', // Será verificada com bcrypt.compare
});
```

### ⚠️ Observações Importantes

- A coluna `FotoUsuario` precisa existir no banco como `varbinary(MAX)`
- Execute as migrations SQL antes de usar
- Senhas são irreversíveis (não há como "descriptografar")
- Para redefinir senha, seria necessário gerar uma nova
