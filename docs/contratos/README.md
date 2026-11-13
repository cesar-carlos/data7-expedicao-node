# Contratos de paginação e consulta

Esta pasta é a fonte dos contratos de lista: o que o cliente manda, o que o servidor aplica no SQL e o que volta.

Como HTTP e Socket.IO se encaixam no mesmo processo: [comunicação](../comunicacao.md).

Domínio de expedição (situação, trigger, erro, índice) fica em [../expedicao/](../expedicao/README.md). Aqui só entra envelope, `WHERE`, página e ordem.

## Leia nesta ordem

1. [Paginação](./paginacao.md) — `LIMIT` 1500, `OFFSET/FETCH`, exceções
2. [Where](./where.md) — lista `{ key, value }` (preferida) ou string SQL legado. Índices: [expedição / índices](../expedicao/indices.md)
3. [Consulta Socket.IO](./consulta-socket.md) — `Where`, `Pagination`, `OrderBy`, resposta `Data`
4. [Consulta HTTP](./consulta-http.md) — `Page`, `Offset`, `Limit`, resposta `data`/`total`

Catálogo dos eventos: [socket](../socket/README.md) (`*.consulta`, `*.select`, mutação, `*.listen`).

Rotas específicas: [Login](../http/login-app.md), [Usuários](../http/usuario-consulta.md), [Escuta](../socket/escuta.md). Superfície HTTP: [http/](../http/README.md) e [consulta HTTP](./consulta-http.md).

## Código

| Contrato | Código |
| --- | --- |
| Página | `src/contracts/local.base.pagination.ts` |
| `Where` / `Params` | `src/contracts/local.base.params.ts`, `src/repository/common/params.common.ts`, shim `separar.consulta.where.ts` |
| Teto 2100 binds | `src/repository/common/sql.param.budget.ts` — chunk de `consultaAny` / `IN` |
| `OrderBy` | `src/contracts/local.base.orderby.ts` |
| Corte no SQL | `src/repository/common/consulta.sql.helper.ts` |
| Envelope Socket | `src/socket/protocol/socket.protocol.adapter.ts` |
| SQL da lista | `src/sql/` — o arquivo não corta a lista; o helper corta |

Testes: `test/src/contracts/local.base.pagination.test.ts`, `test/src/repository/common/consulta.sql.helper.test.ts`, `test/src/repository/expedicao/separar.consulta.sql.test.ts` (`OUTER APPLY` depois da base; `EXISTS` no alias `SepararConsulta`), `test/src/repository/common/separar.consulta.where.test.ts` (shim de `LIKE`), `test/src/socket/socket.query.dedupe.test.ts`.
