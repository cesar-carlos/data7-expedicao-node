# Eventos Socket.IO

Catálogo dos eventos registrados em `src/socket/` e em `src/aplication/app.socket.config.ts`.

HTTP e Socket.IO na mesma porta, sem token: [comunicação](../comunicacao.md).

O envelope (`Where`, `Pagination`, `OrderBy`, `Mutation`, resposta `Data` / `Error`) fica em [contratos](../contratos/README.md). `Where` das consultas é lista `{ key, value }` (o coletor deve mandar isso). String SQL legado ainda entra, com warn no log — não é `Error` no Socket. O corpo no fio é JSON string. Aqui entra **qual evento existe**, o que consulta, o que grava e o que o servidor emite em `*.listen`.

Domínio de expedição (situação, trigger, erro, índice): [expedição](../expedicao/README.md).

## Leia nesta ordem

1. [Consultas](./consultas.md) — `*.consulta` e `*.select`
2. [Eventos](./eventos.md) — registro, mutação e `*.listen`
3. [Listen](./listen.md) — o que o servidor emite (`separar.update.listen`, conferência, trigger)
4. [Separar](./separar.md) — lista, item, progresso, setor
5. [Conferir](./conferir.md) — documento, carrinho, item e scan
6. [Escuta periódica](./escuta.md) — `separar.consulta.listen`
7. [Proteções para os coletores](./protecoes-cliente.md) — o que já está no servidor, o canal de emergência, o que ainda não ligou

## Fonte no código

| Papel | Caminho |
| --- | --- |
| Registro na conexão | `src/aplication/app.socket.config.ts` (`SOCKET_EVENT_DEFINITIONS`) |
| Handler por feature | `src/socket/<feature>/*.event.ts` |
| SQL da lista (`consulta`) | `src/sql/` |
| Corte de página | `src/repository/common/consulta.sql.helper.ts` (`SET LOCK_TIMEOUT`) |
| Shim `LIKE` de separar | `src/repository/common/separar.consulta.where.ts` |
| Dedup de consulta | `src/socket/protocol/socket.query.dedupe.ts` |
| Envelope legado | `src/socket/protocol/socket.protocol.adapter.ts` |
| CRUD genérico | `src/socket/socket.crud.registrar.ts` |
| Escuta periódica | `src/services/separar.periodic.listen.service.ts` — **não** entra no registro acima |
| Notify HTTP → listen | `src/controllers/expedicao/separacao.notify.expedicao.controller.ts`, `conferir.notify.expedicao.controller.ts` |
| Canal de emergência | `servidor.emergencia.listen` — `src/services/servidor.emergencia.service.ts` (o cliente não emite) |
| Monitor | `src/socket/monitor/`, rotas `/internal/sockets` (loopback); `POST /internal/sockets/emergencia` emite o aviso |

## Três papéis

| `kind` | Sufixo | Canal de pedido | Resposta |
| --- | --- | --- | --- |
| `query` | `*.consulta` ou `*.select` | `${socket.id} <evento>` | `Session`, `ResponseIn`, `Data` |
| `mutation` | `*.insert` / `*.update` / `*.delete` | `${socket.id} <evento>` | `Session`, `ResponseIn`, `Mutation` |
| `listen` | `*.listen` | o cliente **não** emite; só escuta o nome do canal | payload da família já usada por aquele canal |

`consulta` lê a view (joins, nomes, totais). `select` lê a tabela física. Os dois usam o mesmo envelope de pedido. Detalhe em [consultas](./consultas.md).

A conexão **não** exige token. Os Flutter usam só transporte `websocket`. HTTP de lista (login, usuários): [http/](../http/README.md).
