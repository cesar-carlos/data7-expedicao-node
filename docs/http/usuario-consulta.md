# Consulta de usuários

Consulta o cadastro de usuários do ERP. É outra rota, separada do login do aplicativo.

```http
GET /usuarios
GET /usuarios?CodUsuario=123
GET /usuarios?NomeUsuario=Joao&Ativo=S&Page=1&Limit=100
GET /usuarios?CodEmpresa=1&Page=2&Limit=50
```

| Query | Regra |
| --- | --- |
| `CodUsuario` | Opcional, inteiro maior que 0. Devolve um usuário |
| `NomeUsuario` | Opcional, busca parcial |
| `CodEmpresa` | Opcional, inteiro maior que 0 |
| `Ativo` | Opcional, `S` ou `N` |
| `Page` | Opcional, padrão 1 |
| `Offset` | Opcional. Quando vem, substitui o cálculo a partir de `Page` |
| `Limit` | Opcional, padrão 1500. Um valor informado pelo cliente é respeitado. Contrato: [consulta HTTP](../contratos/consulta-http.md) |

Lista: `message`, `data`, `total`, `page`, `limit`, `totalPages`. `offset` entra em `consultarTodos` e na busca por nome; por `CodEmpresa` ou só `Ativo=S` a resposta pode omitir `offset`.

Por `CodUsuario`:

```json
{
  "message": "Usuário encontrado",
  "data": {},
  "total": 1
}
```

Ausente: 404 `{ "message": "Usuário não encontrado" }`.

`POST`, `PUT` e `DELETE` em `/usuarios` respondem 405 com `message` explicando o método. A inclusão e a alteração de usuário do aplicativo ficam em `/expedicao/create-login-app` e `/expedicao/login-app`.

Índice HTTP: [README](./README.md). Login: [login-app](./login-app.md).
