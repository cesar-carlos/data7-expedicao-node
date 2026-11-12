# Consulta Socket.IO

Pedido legado (JSON string ou objeto). Chaves aceitas: `Session`, `ResponseIn`, `Where`, `Mutation`, `Pagination`, `OrderBy`.

O transporte entrega o corpo como **string JSON**. O cliente deve aceitar string ou Map já decodificado.

Consulta e `select` usam `Where` + `Pagination` + `OrderBy`. Mutação usa `Mutation`. Não misturar os dois papéis no mesmo handler.

Como o canal se relaciona com HTTP: [comunicação](../comunicacao.md).

## Pedido

`Where` das consultas é lista de `{ key, value, operator? }` ou, no coletor antigo, string SQL (`QueryBuilder.buildSqlWhere()`). Detalhe: [Where](./where.md).

```json
{
  "Session": "<socket.id>",
  "ResponseIn": "<uuid>",
  "Where": [
    { "key": "CodEmpresa", "value": 1 },
    { "key": "CodConferir", "value": 290 },
    { "key": "CodCarrinho", "value": 94 }
  ],
  "Pagination": "LIMIT=200&OFFSET=0&PAGE=1",
  "OrderBy": "order_by=Item&order_direction=ASC"
}
```

O canal de pedido continua `${socket.id} <evento>`. Exemplo: `abc123 conferir.item.consulta`.

`ResponseIn` omitido cai no canal `${socket.id} <evento>` (o mesmo do pedido). Payload inválido responde nesse fallback; não falha em silêncio. Se o socket já desconectou, o emit é ignorado (`socket.connected === false`). `produto.conversao.unidade.*` usa esse nome, não `estoque.produto.conversao.unidade.*`.

`toJson()` do coletor omite `Where`, `Pagination` e `OrderBy` quando vazios. Sem `Where`, a consulta não filtra. Sem `Pagination`, o helper aplica 1500.

O coletor `exp` espera a resposta em até 30s e remove o listener do UUID em seguida.

### Pagination

Query string, número (`LIMIT`) ou objeto `{ limit, offset, page }`.

Sinônimos: `LIMIT` / `TOP` / `$top`, `OFFSET` / `SKIP` / `$skip`, `PAGE`.

Sem o campo, `Pagination.fromClientInput` devolve `undefined` e o helper aplica 1500. Detalhe em [paginação](./paginacao.md).

### Where e OrderBy

Formatos em [Where](./where.md).

### Mutação

O coletor `exp` manda um objeto em `Mutation`. O servidor normaliza para array (`normalizeMutation`). Lista também vale.

```json
{
  "Session": "<socket.id>",
  "ResponseIn": "<uuid>",
  "Mutation": { }
}
```

## Resposta de consulta

Emitida no canal `ResponseIn` (o UUID do pedido), como JSON string:

```json
{
  "Session": "...",
  "ResponseIn": "...",
  "Data": []
}
```

Mutação: `Mutation` no lugar de `Data`. Lista vazia é sucesso, não erro.

Erro: `Error` como `string[]` no formato `[identificador] mensagem`, mais `Code` e `RequestId` opcionais. [Erros](../expedicao/erros.md).

## Eventos que usam este contrato

Lista completa: [consultas Socket.IO](../socket/consultas.md). Registro de mutação e `*.listen`: [eventos](../socket/eventos.md).

Unidade de medida do item: [paginação](./paginacao.md#unidade-de-medida).

Escuta periódica `separar.consulta.listen` **não** usa este envelope de pedido. [Escuta](../socket/escuta.md). Canais `*.listen` de mutação (famílias `{ Mutation }`, `{ Session, Mutation }`, `{ Data }`): [listen](../socket/listen.md).
