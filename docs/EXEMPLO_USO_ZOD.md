# Exemplo de uso da API Login App com Zod

## Como enviar uma requisição POST para criar um usuário

### Exemplo com cURL (imagem em base64):

```bash
curl -X POST http://localhost:3000/api/login-app \
  -H "Content-Type: application/json" \
  -d '{
    "Nome": "João Silva",
    "Senha": "minhasenha123",
    "FotoUsuario": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
  }'
```

### Exemplo com JavaScript/TypeScript:

```typescript
const criarUsuario = async () => {
  try {
    // Exemplo de conversão de arquivo para base64
    const fileInput = document.getElementById('foto') as HTMLInputElement;
    const file = fileInput.files?.[0];

    let fotoBase64: string | undefined;
    if (file) {
      const reader = new FileReader();
      fotoBase64 = await new Promise((resolve) => {
        reader.onload = () => {
          const base64 = reader.result as string;
          // Remover o prefixo "data:image/...;base64,"
          resolve(base64.split(',')[1]);
        };
        reader.readAsDataURL(file);
      });
    }

    const response = await fetch('/api/login-app', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Nome: 'João Silva',
        Senha: 'minhasenha123',
        FotoUsuario: fotoBase64, // Opcional
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Usuário criado:', result);
    } else {
      const error = await response.json();
      console.error('Erro de validação:', error);
    }
  } catch (error) {
    console.error('Erro:', error);
  }
};
```

## Validações aplicadas:

1. **Nome**:
   - Obrigatório
   - Mínimo 1 caractere
   - Máximo 100 caracteres
   - Remove espaços no início e fim

2. **Senha**:
   - Obrigatória
   - Mínimo 6 caracteres
   - Máximo 50 caracteres

3. **FotoUsuario**:
   - Opcional
   - Deve ser uma string base64 válida
   - Será convertida para Buffer e armazenada como varbinary no banco

## Exemplo de resposta de erro de validação:

```json
{
  "message": "Dados inválidos",
  "errors": [
    {
      "field": "Nome",
      "message": "Nome é obrigatório",
      "received": ""
    },
    {
      "field": "Senha",
      "message": "Senha deve ter no mínimo 6 caracteres",
      "received": "123"
    }
  ]
}
```

## Exemplo de resposta de sucesso:

```json
{
  "CodEmpresa": 1,
  "CodLoginApp": 123,
  "Ativo": "S",
  "Nome": "João Silva",
  "Senha": "minhasenha123",
  "CodUsuario": null,
  "FotoUsuario": "base64string..."
}
```
