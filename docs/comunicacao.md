# Comunicação com o servidor

HTTP e Socket.IO compartilham o mesmo processo e a mesma porta. Não há token. CORS aceita qualquer origem.

Dois coletores Flutter consomem este contrato. Mudança de envelope, nome de evento ou rota quebra os dois:

| App | Caminho |
| --- | --- |
| Coletor desktop | `D:\Developer\Data7\Expedicao\Flutter\app_expedicao` |
| Coletor `exp` | `D:\Developer\Data7\Expedicao\Flutter\app\exp` |

## O que vai por qual canal

| Canal | Uso |
| --- | --- |
| HTTP | Login, cadastro, consulta de usuário do app, usuários do ERP, versão do app, health, notify interno, monitor |
| Socket.IO | Lista, `select`, insert/update/delete e `*.listen` de separar, conferir, carrinho, produto e demais features |

Carrinho, separar e conferir **não** têm HTTP de negócio. As rotas `/expedicao/conferir` e `/expedicao/separacao` existem e respondem 501.

Visão geral: [README](./README.md). Envelope de lista: [contratos](./contratos/README.md). Catálogo Socket.IO: [socket](./socket/README.md).

## Conexão

O cliente aponta host e porta (`SERVER_PORT`). Sem a variável, a API usa 3000. O `.env.exemple` sugere 3001.

```text
http(s)://<host>:<porta>
```

Socket.IO usa o namespace padrão `/`, no mesmo origin. O handshake não manda autenticação.

Os dois Flutter abrem o socket só com `websocket` (sem polling), `autoConnect` e reconexão. A sessão é `socket.id`. Pedido de consulta e mutação sai no canal `${socket.id} <evento>`. A resposta volta no `ResponseIn` (UUID do pedido). Broadcast `*.listen` usa o nome do canal, sem `socket.id`. Emergência: `servidor.emergencia.listen` (`{ Data }`, sem `Session`), `allEvent: true`, na conexão. O desktop **já** escuta. O `exp` **ainda deve** registrar. [Proteções](./socket/protecoes-cliente.md).

O corpo Socket.IO (pedido e resposta) é JSON **string**. O cliente precisa aceitar string ou objeto já decodificado.

Timeout típico no coletor `exp`: HTTP 10s de conexão / 30s de leitura; Socket.IO 30s por pedido.

Proteções de lista **não** mudam envelope nem recusam pedido publicado: `LIKE` de setor/data é reescrito, consultas iguais no mesmo socket compartilham o SQL (cada `ResponseIn` recebe `Data`), `SET LOCK_TIMEOUT` no `SELECT`, cancel no timeout. Handshake **continua sem token**. String SQL no `Where` **continua aceita** (warn no log; na aba Erros do Windows isso aparece vermelho porque stderr vira “erro” — a consulta não falhou). [Where](./contratos/where.md). Regras 26–27 em [expedição](./expedicao/regras.md). O que já está no ar vs o que ainda não: [proteções](./socket/protecoes-cliente.md).

## HTTP que o coletor usa

| Método | Caminho | Papel |
| --- | --- | --- |
| `POST` | `/expedicao/login-app` | Entrar |
| `POST` | `/expedicao/create-login-app` | Cadastrar login do app (201) |
| `GET` | `/expedicao/login-app` | Consultar login. Por `CodLoginApp` devolve `{ message, data, total }` |
| `PUT` | `/expedicao/login-app?CodLoginApp=` | Atualizar. Resposta `{ message, user }` |
| `GET` | `/usuarios` | Cadastro de usuário do ERP |

Não existe `/expedicao/consult-login-app`. Consulta de um login é `GET /expedicao/login-app?CodLoginApp=`.

Detalhe: [login](./http/login-app.md), [usuários](./http/usuario-consulta.md), [consulta HTTP](./contratos/consulta-http.md).

## HTTP interno (não é fluxo do coletor)

| Método | Caminho | Papel |
| --- | --- | --- |
| `GET` | `/health` | `{ "status": "UP" }` |
| `GET` | `/expedicao/versaoapp` | Lista de versão do app |
| `POST` | `/expedicao/separacao/notify` | Emite `separar.update.listen` (`{ Data }`). 204 |
| `PUT` | `/expedicao/conferir/notify` | Emite `conferir.update.listen` (`{ Mutation }`). 204 |
| `GET` | `/internal/sockets` | Monitor. Só loopback; outro origin recebe 404 vazio |
| `GET` | `/internal/sockets/:socketId` | Detalhe e trace do cliente |
| `POST` | `/internal/sockets/emergencia` | Emite `servidor.emergencia.listen`. 204. Loopback. Não é fluxo do coletor |

`GET`/`POST`/`PUT`/`DELETE` em `/expedicao/conferir` e `/expedicao/separacao` (sem `/notify`) respondem 501.

## Socket.IO — pedido

Os Flutter montam o envelope legado e emitem JSON string:

```json
{
  "Session": "<socket.id>",
  "ResponseIn": "<uuid>",
  "Where": [
    { "key": "CodEmpresa", "value": 1 },
    { "key": "Situacao", "operator": "IN", "value": ["EM SEPARACAO"] }
  ],
  "Pagination": "LIMIT=200&OFFSET=0&PAGE=1",
  "OrderBy": "order_by=Item&order_direction=ASC"
}
```

`Where` das consultas é lista `{ key, value }` (`exp`: `buildWhereParams()`; desktop: `buildWhereList()`). String SQL do `QueryBuilder.buildSqlWhere()` continua aceita: o servidor grava warn e executa; o coletor **não** recebe `Error`. Mutação: o coletor `exp` manda um objeto em `Mutation`; o servidor normaliza para array.

Sem `Pagination` no JSON, a página é 1500. [Paginação](./contratos/paginacao.md). Contrato e exemplos Dart: [Where](./contratos/where.md).

## Socket.IO — resposta

Consulta: `{ Session, ResponseIn, Data }`. Mutação: `{ Session, ResponseIn, Mutation }`. Erro: `{ Session, ResponseIn, Error, Code?, RequestId? }` — [erros](./expedicao/erros.md).

O cliente escuta o UUID de `ResponseIn` e remove o listener ao terminar.

## Listen

O cliente **não** emite `*.listen`. Só escuta o nome do canal. Catálogo, payload e o que a trigger não emite: [listen](./socket/listen.md).

| Origem | Canal típico |
| --- | --- |
| Depois de gravar | `<recurso>.insert\|update\|delete.listen` |
| Finalizar Carrinho (trigger 01 no mesmo `UPDATE`) | `separar.update.listen`, `carrinho.percurso.update.listen`, `carrinho.percurso.estagio.update.listen` |
| Listen cruzado (item no carrinho, scan) | `separar.item.consulta.update.listen`, `conferir.item.update.listen` |
| Timer do processo | `separar.consulta.listen` — [escuta](./socket/escuta.md) |
| HTTP notify | `POST /expedicao/separacao/notify` (`{ Data }`), `PUT /expedicao/conferir/notify` (`{ Mutation }`) |

A trigger 02 **não** emite `conferir.insert.listen`. O coletor `exp` escuta `separar.consulta.listen` e `separar.update.listen` na lista de separação e aplica o `Data` do listen (não dispara outra `separar.consulta` no mesmo tick). O desktop aplica `separar.update.listen` com `allEvent: true`. [Escuta](./socket/escuta.md).

## Monitor

`src/socket/monitor/`. Lista clientes, bytes, eventos lentos e trace. Só `127.0.0.1` / `::1`. Fora do loopback a rota finge 404 para não aparecer na API pública.
