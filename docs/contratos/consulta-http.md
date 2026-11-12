# Consulta HTTP

Query PascalCase. Validação Zod antes do controller. Página: `Page`, `Offset`, `Limit` — as mesmas constantes de [paginação](./paginacao.md).

Canal, CORS e o que vai por HTTP vs Socket.IO: [comunicação](../comunicacao.md).

| Query | Padrão | Regra |
| --- | --- | --- |
| `Page` | 1 | Maior que 0 |
| `Offset` | `(Page - 1) * Limit` | Se vier, substitui o cálculo a partir de `Page` |
| `Limit` | 1500 | Informado pelo cliente é respeitado (teto técnico `SQL_INT_MAX`) |

## Resposta de lista

```json
{
  "message": "N usuário(s) encontrado(s)",
  "data": [],
  "total": 0,
  "page": 1,
  "limit": 1500,
  "totalPages": 0,
  "offset": 0
}
```

`message` entra em login, usuários e versão. `offset` entra na lista completa (`consultarTodos`) e em várias buscas por nome; `GET /usuarios` por `CodEmpresa` ou só `Ativo=S` pode omitir `offset` e manter `page` / `limit` / `totalPages`.

`total` chama a mesma consulta **sem** página explícita. O helper aplica então o padrão 1500: `total` reflete no máximo 1500 linhas. A página de `data` segue o `Limit` pedido.

## Consulta por chave única

`CodUsuario`, `CodLoginApp` ou `CodVersaoApp`:

```json
{
  "message": "Usuário encontrado",
  "data": {},
  "total": 1
}
```

Não há `page` / `limit` / `totalPages`. Ausente: 404 com `{ "message": "…" }`.

## Rotas de lista

| Método | Caminho | Filtros de negócio | Guia |
| --- | --- | --- | --- |
| `GET` | `/usuarios` | `CodUsuario`, `NomeUsuario`, `CodEmpresa`, `Ativo` | [Usuários](../http/usuario-consulta.md) |
| `GET` | `/expedicao/login-app` | `Nome`, `CodLoginApp`, `Ativo` | [Login](../http/login-app.md) |
| `GET` | `/expedicao/versaoapp` | `NomeApp`, `CodVersaoApp`, `Ativo` | |

Não existe `/versaoapp` na raiz nem `/expedicao/consult-login-app`.

Parâmetro inválido: 400 com `message` e `errors[]`.

## Outras rotas HTTP

| Método | Caminho | Resposta |
| --- | --- | --- |
| `GET` | `/health` | `{ "status": "UP" }` |
| `POST` | `/expedicao/login-app` | Login. 200 `{ message, user }` ou 401 |
| `POST` | `/expedicao/create-login-app` | Cadastro. 201 `{ message, user }` |
| `PUT` | `/expedicao/login-app?CodLoginApp=` | Atualização. 200 `{ message, user }` |
| `POST` | `/expedicao/separacao/notify` | Emite `separar.update.listen`. 204 |
| `PUT` | `/expedicao/conferir/notify` | Emite `conferir.update.listen`. 204 |
| `GET` | `/internal/sockets` | Monitor. Loopback; outro origin: 404 vazio |
| `GET` | `/internal/sockets/:socketId` | Detalhe do socket |

`GET`/`PUT`/`DELETE` em `/expedicao/create-login-app` respondem 501. `DELETE /expedicao/login-app` e `POST`/`PUT`/`DELETE` em `/expedicao/versaoapp` respondem 404 `{ "message": "not implemented …" }`. `/expedicao/conferir` e `/expedicao/separacao` (sem `/notify`) respondem 501.

O coletor de expedição **não** usa HTTP para carrinho, separar ou conferir. Isso vai por [Socket.IO](./consulta-socket.md). Catálogo dos eventos: [socket](../socket/README.md).
