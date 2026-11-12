# Registro de eventos Socket.IO

Fonte: `SOCKET_EVENT_DEFINITIONS` em `src/aplication/app.socket.config.ts`. O servidor recusa sufixo duplicado e canal `listen` que não termina em `.listen`.

Pedido de consulta e mutação: `${socket.id} <eventSuffix>`. Broadcast: o nome do canal, sem `socket.id`. O emit no fio é JSON string. Visão dos canais: [comunicação](../comunicacao.md).

Envelope: [consulta Socket.IO](../contratos/consulta-socket.md). Erro: `Error` como `string[]` no formato `[identificador] mensagem` — [erros](../expedicao/erros.md).

Catálogo de consultas: [consultas](./consultas.md).

## Família padrão

Quase toda feature expõe:

| Sufixo | `kind` | Pedido | Resposta / emit |
| --- | --- | --- | --- |
| `<recurso>.consulta` | `query` | `Where` + `Pagination` + `OrderBy` | `Data` |
| `<recurso>.select` | `query` | idem | `Data` |
| `<recurso>.insert` | `mutation` | `Mutation` | `Mutation` + `<recurso>.insert.listen` |
| `<recurso>.update` | `mutation` | `Mutation` | `Mutation` + `<recurso>.update.listen` |
| `<recurso>.delete` | `mutation` | `Mutation` | `Mutation` + `<recurso>.delete.listen` |

Exceções: algumas features só têm `select` (sem view de consulta). `sequencia.select` não tem mutação. `expedicao.percurso.estagio` não emite `*.listen`.

`Mutation` vazia: vários handlers respondem `Mutation: []` sem gravar (`allowEmptyMutation`). Payload inválido responde no `ResponseIn` (ou no canal padrão) com `[INVALID_PAYLOAD] …`; não falha em silêncio. Socket já desconectado: o emit da resposta é ignorado e o SQL em voo daquele socket é cancelado; `*.listen` para os outros clientes só deixa de sair se a mutação não tiver terminado.

`SocketCrudRegistrar` emite `*.listen` com as linhas da mutação quando a feature não define `loadListen` (cancelamento, armazenar, tipos de operação, processo executável). `usuario` / `carrinho` / `setor.estoque` continuam recarregando a consulta. Delete com `loadListenBeforeExecute` (e o de `carrinho.percurso.estagio`) carrega o snapshot **antes** de apagar.

Sequência ausente ou `Valor <= 0` aborta o insert (`[INTERNAL_ERROR] Sequencia indisponivel (…)`). `produto.conversao.unidade.insert` **não** troca `CodProduto` por `Produto_Sequencia`: usa o código do payload e gera `Item` se vier vazio.

## Listen depois de gravar

Catálogo, famílias de payload, Finalizar Carrinho e o que a trigger **não** emite: [listen](./listen.md).

O servidor emite no canal `*.listen` para **todos** os sockets. Três formas de payload existem hoje; não unificar:

- `ExpedicaoMutationBasicEvent` — `{ Session, ResponseIn, Mutation }`
- `ExpedicaoMutationListenEvent` — `{ Mutation }`
- `ExpedicaoBasicListenEvent` — `{ Data }` (timer e `POST /expedicao/separacao/notify`)

## Listen cruzado

Estes canais saem de **outro** handler, não só da feature dona do nome. Tabela completa: [listen](./listen.md).

| Canal | Quem emite | Quando |
| --- | --- | --- |
| `separar.update.listen` | `carrinho.percurso.estagio` insert/update | estágio muda a separação (inclui fechamento da trigger 01) |
| `carrinho.percurso.update.listen` | `carrinho.percurso.estagio` update | estágio muda o percurso |
| `separar.item.consulta.update.listen` | `separacao.item` insert/update/delete | item no carrinho altera o item a separar |
| `conferir.item.update.listen` | `conferencia.item` insert/update/delete | scan altera o item a conferir |
| `separar.consulta.listen` | `SepararPeriodicListenService` | timer do processo — [escuta](./escuta.md) |
| `separar.update.listen` | `POST /expedicao/separacao/notify` | HTTP interno; payload `{ Data }` |
| `conferir.update.listen` | `PUT /expedicao/conferir/notify` | HTTP interno; payload `{ Mutation }` |

A trigger 02 **não** emite `conferir.insert.listen`. O cliente escuta o nome do canal. Não prefixar com `socket.id`. O emit no fio é JSON string.

## Features registradas

| `name` | Handler | Consultas extras além de `consulta`/`select` |
| --- | --- | --- |
| `usuario` | `src/socket/usuario/usuario.event.ts` | |
| `separar` | `src/socket/separar/separar.event.ts` | `separar.progresso.consulta`, `separar.estoque.item.impresso.consulta` |
| `separar.item` | `src/socket/separar.item/separar.item.event.ts` | `separar.item.unidade.medida.consulta` |
| `separacao.item` | `src/socket/separacao.item/separacao.item.event.ts` | `separacao.item.resumo.consulta` |
| `separacao.usuario.setor` | `src/socket/separacao.usuario.setor/separacao.usuario.setor.item.event.ts` | eventos `separar.usuario.setor.*` |
| `conferir` | `src/socket/conferir/conferir.event.ts` | `carrinho.conferir.consulta` |
| `conferir.item` | `src/socket/conferir.item/conferir.item.event.ts` | `conferir.item.unidade.medida.consulta`, `conferir.separacao.item.consulta` |
| `conferencia.item` | `src/socket/conferencia.item/conferencia.item.event.ts` | |
| `carrinho` | `src/socket/carrinho/carrinho.event.ts` | |
| `carrinho.percurso` | `src/socket/carrinho.percurso/carrinho.percurso.event.ts` | |
| `carrinho.percurso.estagio` | `src/socket/carrinho.percurso.estagio/carrinho.percurso.estagio.event.ts` | listen cruzado em `separar` e `carrinho.percurso` |
| `carrinho.percurso.agrupamento` | `src/socket/carrinho.percurso.agrupamento/carrinho.percurso.agrupamento.event.ts` | |
| `expedicao.percurso.estagio` | `src/socket/expedicao.percurso.estagio/expedicao.percurso.estagio.event.ts` | só `select`; sem listen |
| `estoque.produto` | `src/socket/produto/estoque.produto.event.ts` | |
| `produto.conversao.unidade` | `src/socket/produto.conversao.unidade/estoque.conversao.unidade.event.ts` | |
| `armazenar` | `src/socket/armazenar/armazenar.event.ts` | só `select` |
| `armazenar.item` | `src/socket/item.armazenar/item.armazenar.event.ts` | |
| `setor.estoque` | `src/socket/setor.estoque/setor.estoque.event.ts` | só `select` |
| `tipo.operacao.expedicao` | `src/socket/tipo.operacao.expedicao/tipo.operacao.expedicao.event.ts` | só `select` |
| `tipo.operacao.armazenagem` | `src/socket/tipo.operacao.armazenagem/tipo.operacao.armazenagem.event.ts` | só `select` |
| `processo.executavel` | `src/socket/processo.executavel/processo.executavel.event.ts` | só `select` |
| `expedicao.cancelamento` | `src/socket/cancelamento/cancelamento.event.ts` | só `select` |
| `sequencia.registro` | `src/socket/sequencia.registro/sequencia.registro.event.ts` | só `sequencia.select` |

Detalhe de separar e conferir: [separar](./separar.md), [conferir](./conferir.md). Listen emitido: [listen](./listen.md).

## Como incluir um evento novo

1. Criar ou alterar `src/socket/<feature>/*.event.ts` (handler fino: validar, chamar repositório, emitir).
2. Declarar o sufixo e o `kind` em `SOCKET_EVENT_DEFINITIONS`.
3. Se for consulta, apontar o SQL em `src/sql/` e o DTO `*ConsultaDto`.
4. Atualizar [consultas](./consultas.md), [listen](./listen.md) e esta página. Escuta periódica: [escuta](./escuta.md).
5. Não mudar nome de evento nem forma do payload sem migração de cliente. Dois Flutter consomem este contrato.

CRUD repetitivo pode usar `SocketCrudRegistrar`. Sem `loadListen`, o listen usa as próprias linhas da mutação. Features com listen cruzado ou consulta extra (separar, conferir, estágio) registram `socket.on` à mão.
