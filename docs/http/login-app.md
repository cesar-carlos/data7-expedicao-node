# Login do aplicativo

As rotas ficam em `/expedicao`. Os nomes de campo e de query estão em PascalCase. A validação é feita com Zod antes do controller.

Não existe `/expedicao/consult-login-app`. Consultar um login é `GET /expedicao/login-app?CodLoginApp=`.

A senha é gravada com bcrypt, 12 rounds. A resposta de consulta e de atualização não devolve a senha. A foto entra e sai como string base64. No banco ela fica em `varbinary`.

Envelope HTTP: [consulta HTTP](../contratos/consulta-http.md). Visão dos canais: [comunicação](../comunicacao.md). Índice HTTP: [README](./README.md).

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

Sucesso: **201** com `{ "message": "Usuário criado com sucesso", "user": { … } }`. `user` traz `CodLoginApp`, `Nome`, `Ativo`, `CodUsuario`, `FotoUsuario` (base64 ou `null`). Sem senha.

`GET`, `PUT` e `DELETE` em `/expedicao/create-login-app` respondem 501 (`NOT_IMPLEMENTED`).

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

`Nome` tem de 1 a 30 caracteres. `Senha` tem de 1 a 20.

Sucesso: 200 com `{ "message": "Login realizado com sucesso", "user": { … } }`.

Credencial inválida ou usuário inativo: 401 `{ "message": "Credenciais inválidas ou usuário inativo" }`.

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
| `Limit` | Opcional, padrão 1500. Um valor informado pelo cliente é respeitado. Contrato: [consulta HTTP](../contratos/consulta-http.md) |

Lista paginada: `message`, `data`, `total`, `page`, `limit`, `totalPages`, `offset`.

Limitações atuais: a prioridade é `CodLoginApp` → `Nome` → `Ativo=S`, sem combinar filtros. `Ativo=N` sozinho retorna a lista geral. `Offset` é ajustado ao início da página que o contém. Detalhes: [consulta HTTP](../contratos/consulta-http.md#compatibilidade-e-limitações-atuais).

Por `CodLoginApp`:

```json
{
  "message": "Usuário encontrado",
  "data": {},
  "total": 1
}
```

Ausente: 404 `{ "message": "Usuário não encontrado" }`.

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

Sucesso: 200 `{ "message": "Usuário atualizado com sucesso", "user": { … } }`. Não encontrado: 404.

`DELETE /expedicao/login-app` responde 404 `{ "message": "not implemented delete" }`.
