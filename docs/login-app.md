# Login do aplicativo

As rotas ficam em `/expedicao`. Os nomes de campo e de query estão em PascalCase. A validação é feita com Zod antes do controller.

A senha é gravada com bcrypt, 12 rounds. A resposta de consulta e de atualização não devolve a senha. A foto entra e sai como string base64. No banco ela fica em `varbinary`.

## Criar

```http
POST /expedicao/create-login-app
Content-Type: application/json
```

```json
{
  "Nome": "joao.silva",
  "Senha": "senha123",
  "CodUsuario": 10,
  "FotoUsuario": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ"
}
```

| Campo | Regra |
| --- | --- |
| `Nome` | Obrigatório, 1 a 30 caracteres, com trim |
| `Senha` | Obrigatória, 4 a 20 caracteres |
| `CodUsuario` | Opcional |
| `FotoUsuario` | Opcional. String base64 ou omitida |

`GET`, `PUT` e `DELETE` em `/expedicao/create-login-app` não estão implementados.

## Entrar

```http
POST /expedicao/login-app
Content-Type: application/json
```

```json
{
  "Nome": "joao.silva",
  "Senha": "senha123"
}
```

`Nome` tem de 1 a 30 caracteres. `Senha` tem de 1 a 20. A resposta traz o usuário e `FotoUsuario` em base64 quando houver foto.

## Consultar

```http
GET /expedicao/login-app
GET /expedicao/login-app?Nome=joao&Ativo=S&Page=1&Limit=50
GET /expedicao/login-app?CodLoginApp=1
```

| Query | Regra |
| --- | --- |
| `Nome` | Opcional, até 100 caracteres, busca parcial |
| `CodLoginApp` | Opcional, inteiro |
| `Ativo` | Opcional, `S` ou `N` |
| `Page` | Opcional, padrão 1, maior que 0 |
| `Offset` | Opcional, maior ou igual a 0. Quando vem, substitui o cálculo a partir de `Page` |
| `Limit` | Opcional, padrão 1000, entre 1 e 1000 |

A resposta paginada inclui `data`, `total`, `page`, `limit` e `totalPages`. Consulta por `CodLoginApp` devolve um único registro.

Um parâmetro inválido responde 400:

```json
{
  "message": "Parâmetros de consulta inválidos",
  "errors": [
    { "field": "Ativo", "message": "Ativo deve ser S ou N", "received": "X" }
  ]
}
```

## Atualizar

O identificador vai na query. O nome não é alterado.

```http
PUT /expedicao/login-app?CodLoginApp=1
Content-Type: application/json
```

```json
{
  "Senha": "novaSenha1",
  "Ativo": "S",
  "CodUsuario": 10,
  "FotoUsuario": null
}
```

| Campo | Regra |
| --- | --- |
| `CodLoginApp` | Obrigatório na query, inteiro maior que 0 |
| `Senha` | Opcional, 4 a 20 caracteres. Quando vem, é gravada com bcrypt |
| `Ativo` | Opcional, `S` ou `N` |
| `CodUsuario` | Opcional |
| `FotoUsuario` | Opcional. Base64, `null` ou omitida |

`DELETE /expedicao/login-app` não está implementado.
