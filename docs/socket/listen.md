# Listen (`*.listen`)

O cliente **não** emite `*.listen`. Só escuta o nome do canal, sem `socket.id`. O servidor faz `io.emit` para todos os sockets do namespace `/`. O corpo no fio é JSON string.

Pedido de consulta e mutação: [eventos](./eventos.md). Envelope de pedido: [consulta Socket.IO](../contratos/consulta-socket.md). Visão dos canais: [comunicação](../comunicacao.md).

Esta página descreve o que o servidor **emite hoje**. Não unificar famílias de payload nem inventar canal novo sem migração dos dois Flutter.

## Famílias de payload

Três formas coexistem no mesmo processo. O desktop (`BasicEventModel`) lê `Mutation` ou `Data` na mesma lista. `Session` vazio não filtra o emissor; `Session` igual ao `socket.id` é ignorado no coletor, salvo `allEvent: true`.

| Família | JSON | Quem usa |
| --- | --- | --- |
| `ExpedicaoMutationListenEvent` | `{ "Mutation": [ … ] }` | `separar.insert\|update\|delete.listen`, `separar.item.*.listen`, CRUD sem sessão (`usuario`, `carrinho`, `setor.estoque`, tipos, armazenar cabeçalho, cancelamento, processo, `separar.usuario.setor`) |
| `ExpedicaoMutationBasicEvent` | `{ "Session", "ResponseIn", "Mutation": [ … ] }` | `conferir.*.listen`, `conferir.item.*.listen`, `conferencia.item.*.listen`, `carrinho.percurso.estagio.*.listen`, `separacao.item.*.listen`, `carrinho.percurso.*.listen`, produto, agrupamento, `armazenar.item` |
| `ExpedicaoBasicListenEvent` | `{ "Data": [ … ] }` | `separar.consulta.listen` (timer) e `POST /expedicao/separacao/notify` → `separar.update.listen` |

Não misturar as três no código novo da mesma origem. O canal `separar.update.listen` **já** chega das três origens abaixo; o coletor aceita `Mutation` e `Data`.

## Depois de gravar (família da própria feature)

Quase toda mutação emite `<recurso>.insert\|update\|delete.listen` com as linhas persistidas ou a consulta recarregada.

| Canal | Origem | Corpo |
| --- | --- | --- |
| `separar.insert\|update\|delete.listen` | `separar.insert\|update\|delete` | consulta `separar.consulta` em `{ Mutation }` |
| `separar.item.insert\|update\|delete.listen` | `separar.item.*` | linhas da mutação em `{ Mutation }` |
| `separacao.item.insert\|update\|delete.listen` | `separacao.item.*` | consulta do item no carrinho, com `Session` |
| `separar.usuario.setor.*.listen` | `separar.usuario.setor.*` | `{ Mutation }` |
| `conferir.insert\|update\|delete.listen` | `conferir.insert\|update\|delete` | consulta `conferir.consulta`, com `Session` |
| `conferir.item.insert\|update\|delete.listen` | `conferir.item.*` | linhas da mutação, com `Session` |
| `conferencia.item.insert\|update\|delete.listen` | `conferencia.item.*` | consulta do scan, com `Session` |
| `carrinho.percurso.estagio.insert\|update\|delete.listen` | estágio insert/update/delete | consulta do estágio, com `Session` |
| `carrinho.percurso.insert\|update\|delete.listen` | `carrinho.percurso.*` | com `Session` |
| `carrinho.*.listen` | `carrinho.*` | `{ Mutation }` (consulta recarregada) |

Delete de separar/conferir/estágio carrega o snapshot **antes** de apagar e emite esse snapshot.

`expedicao.percurso.estagio` **não** emite `*.listen` (só `select`/mutação). `sequencia.select` não tem listen.

Mutação vazia (`Mutation: []` no pedido, `allowEmptyMutation`) responde no `ResponseIn` e **não** emite listen.

## Listen cruzado

Canal de outra feature, emitido depois da mutação que realmente mudou o dado.

| Canal | Quem emite | Quando | Corpo |
| --- | --- | --- | --- |
| `separar.update.listen` | `carrinho.percurso.estagio` insert e update | estágio `SE` muda a consulta da separação | `separar.consulta` da `CodSepararEstoque` (`CodOrigem` do estágio), com `Session` |
| `carrinho.percurso.update.listen` | `carrinho.percurso.estagio` **update** | estágio muda o cabeçalho do percurso | `CarrinhoPercurso` (já `SEPARADO` se a trigger 01 fechou) |
| `separar.item.consulta.update.listen` | `separacao.item` insert/update/delete | item no carrinho altera quantidade a separar | consulta do item a separar |
| `conferir.item.update.listen` | `conferencia.item` insert/update/delete | scan altera quantidade conferida | consulta do item a conferir |

Insert de estágio emite `separar.update.listen` e `carrinho.percurso.estagio.insert.listen`. **Não** emite `carrinho.percurso.update.listen`. Estágio `CO` (abrir conferência) filtra `Origem = SE` no reload: `Mutation` de `separar.update.listen` pode sair vazio.

Delete de estágio **não** emite `separar.update.listen`.

## Fechar a separação (Finalizar Carrinho)

O coletor manda `carrinho.percurso.estagio.update` (`SE` → `SEPARADO`). O `UPDATE` dispara a trigger 01 no mesmo statement. O Node **depois** relê e emite:

```text
carrinho.percurso.estagio.update
        │  (SQL + trigger 01; se pendência 0, SepararEstoque e percurso → SEPARADO)
        │  (trigger 02 pode INSERT Conferir — sem listen, ver abaixo)
        ▼
separar.update.listen                  ← Situacao já relida
carrinho.percurso.update.listen        ← percurso já relido
carrinho.percurso.estagio.update.listen
```

Isso está correto: a trigger não fala Socket.IO; o listen da situação da separação é o `separar.update.listen` desse update.

O desktop (`separar_controller`) escuta `separar.update.listen` com `allEvent: true` e grava `situacao` na tela. O `exp` escuta o mesmo canal na lista.

## Conferência

Há listen de documento, item e scan — **somente** quando a gravação passa pelo Node (`conferir.insert|update|delete`, `conferir.item.*`, `conferencia.item.*`).

Não existe `conferir.consulta.listen` periódico.

A trigger 02, ao fechar a separação, grava `Expedicao.Conferir` / `ConferirResumo` / `ItemConferir` direto no SQL. **Não** sai:

- `conferir.insert.listen`
- `conferir.item.insert.listen`

A lista de conferência só vê o documento novo com `conferir.consulta` (ou `carrinho.conferir.consulta`) de novo. Não “consertar” isso com um listen inventado no Node: mudaria o contrato e duplicaria o caminho se o cliente voltasse a chamar `conferir.insert`.

`PUT /expedicao/conferir/notify` emite `conferir.update.listen` com `{ Mutation }` (HTTP interno, não é o fechamento da trigger).

## HTTP notify

| Rota | Canal | Família |
| --- | --- | --- |
| `POST /expedicao/separacao/notify` | `separar.update.listen` | `{ Data }` |
| `PUT /expedicao/conferir/notify` | `conferir.update.listen` | `{ Mutation }` |

204. Não é fluxo do coletor no picking.

## Timer

Só `separar.consulta.listen`. Página até 20, intervalo 8 s. [Escuta periódica](./escuta.md). Não substitui o `separar.update.listen` do Finalizar Carrinho.

## O que não emitir

- Listen a partir de trigger SQL (01/02/04/05/06).
- `conferir.consulta.listen` (não existe no registro).
- Unificar `{ Mutation }` / `{ Session, Mutation }` / `{ Data }` no mesmo canal sem migração.
- Prefixo `socket.id` no nome do canal de listen.
