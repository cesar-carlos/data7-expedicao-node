# Paginação e limites

As consultas de lista não devolvem a tabela inteira. O SQL dos arquivos em `src/sql/` não usa `TOP` para cortar a lista. O corte entra em `src/repository/common/consulta.sql.helper.ts`, no final do `SELECT`:

```sql
ORDER BY ... OFFSET @__pg_offset ROWS FETCH NEXT @__pg_limit ROWS ONLY
```

Sem `ORDER BY` do cliente, a ordenação fica `ORDER BY (SELECT NULL)`, porque o SQL Server recusa `OFFSET/FETCH` sem ordem. Os `TOP 1` que existem no SQL pegam um carrinho ou um percurso ligado ao registro. Eles não limitam a lista.

As constantes ficam em `src/contracts/local.base.pagination.ts`.

| Constante | Valor | Uso |
| --- | --- | --- |
| `DEFAULT_PAGE_LIMIT` | 100 | Página quando o pedido não manda `LIMIT` |
| `MAX_PAGE_LIMIT` | 1000 | Teto. Um `LIMIT` maior que isso vira 1000 |

`LIMIT` inválido ou zero volta para essas regras: zero vira 1; texto inválido vira 100.

## Socket.IO

O campo `Pagination` do envelope é uma query string:

```text
LIMIT=200&OFFSET=0&PAGE=1
```

`SocketProtocolAdapter` lê isso com `Pagination.fromQueryString`. Sem o campo, ou sem `LIMIT`, a página é 100. `OFFSET` ausente é 0. `PAGE` ausente é 1.

Esse padrão de 100 vale para consulta e select de separar, conferir, conferência, carrinho, percurso, estágio, produto, conversão de unidade, usuário, setor, item a armazenar, item impresso, progresso e o resumo da separação (`separacao.item.resumo.consulta`).

### Itens da separação

`pageForSeparacaoItens` troca o padrão de 100 por 1000 nestas leituras:

- `separar.item.consulta` e `separar.item.select`
- `separacao.item.consulta` e `separacao.item.select`
- `conferir.separacao.item.consulta`

Um `LIMIT` diferente de 100 continua valendo, até o teto de 1000. `OFFSET` e `PAGE` são mantidos. Um `LIMIT=100` explícito também sobe para 1000, porque é igual ao padrão.

### Unidade de medida

`KEEP_EVERY_UNIT_ROW` tira o `OFFSET/FETCH` da unidade de medida do item. Cada item precisa da unidade padrão e de todas as conversões. Uma página cortava `UnidadeMedidas` no coletor.

Sem página:

- `separar.item.unidade.medida.consulta`
- a carga de unidades feita dentro de `separar.item.consulta`
- `conferir.item.unidade.medida.consulta`

### Refresh depois de gravar

Insert, update e delete não recarregam a lista inteira. `pageLimitForGroups` pede algumas linhas por chave e não passa de 1000.

| Leitura | Linhas por chave |
| --- | --- |
| Separar e conferir | 2 |
| Carrinho, usuário e estágio do percurso | 5 |
| Itens da conferência no refresh | 5, ou 20 na leitura do item a conferir |
| Itens a separar no refresh da separação | 20 na consulta; 5 na leitura usada para atualizar a quantidade |
| Itens já separados no refresh | 5 |

## Escuta periódica

`separar.consulta.listen` não usa o padrão de 100. O limite padrão é 20 registros, configurável por `SEPARAR_LISTEN_LIMIT` entre 1 e 500. O detalhe está em [Escuta de separação](./escuta-separacao.md).

## HTTP

`GET /usuarios`, a consulta de login do aplicativo e a consulta de versão do aplicativo aceitam `Page`, `Offset` e `Limit`. Na rota, `Limit` ausente vale 1000 e o máximo também é 1000. O serviço, se for chamado sem `limit`, usa 100.

A contagem de `total` desses serviços chama a mesma consulta sem página. O helper então aplica o padrão de 100, e `total` reflete no máximo 100 linhas. A página de dados segue o `Limit` pedido.
