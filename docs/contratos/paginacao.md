# Paginação

As consultas de lista não devolvem a tabela inteira. Os arquivos em `src/sql/` não usam `TOP` para cortar a lista. O corte entra em `src/repository/common/consulta.sql.helper.ts`:

```sql
ORDER BY ... OFFSET @__pg_offset ROWS FETCH NEXT @__pg_limit ROWS ONLY
```

Sem `ORDER BY` do cliente, a ordenação fica `ORDER BY (SELECT NULL)`, porque o SQL Server recusa `OFFSET/FETCH` sem ordem. Os `TOP 1` que existem no SQL pegam um carrinho ou um percurso ligado ao registro. Eles não limitam a lista.

Constantes: `src/contracts/local.base.pagination.ts`.

| Constante | Valor | Uso |
| --- | --- | --- |
| `DEFAULT_PAGE_LIMIT` | 1500 | Página quando o pedido não manda `LIMIT` |
| `MAX_PAGE_LIMIT` | 1500 | Teto só do padrão e do refresh interno |
| `SQL_INT_MAX` | 2147483647 | Teto técnico de um `LIMIT` explícito |

Regras:

- Sem `LIMIT` → 1500.
- `LIMIT` 0 → 1.
- `LIMIT` inválido → 1500.
- `LIMIT` explícito do cliente **não** é cortado em 1500 (`readUserPageLimit`).
- `OFFSET` ausente → 0.
- `PAGE` ausente → 1. O helper de consulta usa `OFFSET`/`LIMIT`; `PAGE` é metadado.

`conferir.item.consulta` e `conferencia.item.consulta` exigem `CodCarrinho` no `Where`. Sem o filtro o servidor recusa; com filtro ausente no cliente antigo a página de 1500 cortava o carrinho aberto. Regra 14 em [expedição](../expedicao/regras.md). O índice `IX_ItemConferir_Percurso` cobre esse join; [índices](../expedicao/indices.md).

## Unidade de medida

`KEEP_EVERY_UNIT_ROW` tira o `OFFSET/FETCH` da unidade de medida do item quando o cliente **não** manda página. Cada item precisa da unidade padrão e de todas as conversões. Se o cliente mandar `Pagination`, essa página vale.

Sem página:

- `separar.item.unidade.medida.consulta`
- `conferir.item.unidade.medida.consulta`

`separar.item.consulta` **não** aninha mais `UnidadeMedidas`. Desktop e coletor buscam as conversões no evento de unidade.

## Refresh depois de gravar

Insert, update e delete não recarregam a lista inteira. `pageLimitForGroups(n, rowsPerGroup)` pede algumas linhas por chave e não passa de 1500.

Esse teto é de **linhas**. O limite de **2100 parâmetros** por request do SQL Server é outro: `consultaAny` fatia binds em `sql.param.budget.ts` (`SQL_PARAM_BUDGET` 2000) e soma os resultados antes de aplicar os 1500. [Where](./where.md).

Salvar um carrinho grande (F12, centenas de itens) usa a chave do estágio quando o lote é homogêneo (4 parâmetros), não um `OR` por item. Insert/update no banco continua linha a linha.

| Leitura | Linhas por chave |
| --- | --- |
| Separar e conferir | 2 |
| Carrinho, usuário e estágio do percurso | 5 |
| Itens da conferência no refresh | 5, ou 20 na leitura do item a conferir |
| Itens a separar no refresh da separação | 20 na consulta; 5 na leitura usada para atualizar a quantidade |
| Itens já separados no refresh | 5 |

## Escuta periódica

`separar.consulta.listen` **não** usa 1500. Padrão 20, `SEPARAR_LISTEN_LIMIT` entre 1 e 500. [Escuta](../socket/escuta.md).

## Onde o cliente manda a página

- Socket.IO: campo `Pagination` — [consulta Socket.IO](./consulta-socket.md). Lista dos eventos: [socket / consultas](../socket/consultas.md)
- HTTP: query `Page`, `Offset`, `Limit` — [consulta HTTP](./consulta-http.md)

Os Flutter mandam `LIMIT=n&OFFSET=n&PAGE=n`. Sem essa string no JSON, vale 1500. Visão dos canais: [comunicação](../comunicacao.md).
