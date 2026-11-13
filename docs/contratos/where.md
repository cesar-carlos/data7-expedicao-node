# Where

O filtro da consulta chega no Socket.IO no campo `Where` e, no HTTP, como query de negócio (`Nome`, `CodUsuario`, …) que o controller vira `Params`.

Este arquivo é o contrato para os coletores Flutter (`app_expedicao` e `exp`) e para quem altera `executeSelectWhere` / `normalizeConsultaWhere`.

Consultas paginadas preferem **lista de objetos** `{ key, value, operator? }`. `buildWhereParameterized` monta `WHERE` com `@nome` e `request.input`.

Identificadores inválidos são recusados. Segmento aceito: coluna, `alias.coluna` ou `[bracket]`.

`ParamsCommonRepository.build` permanece só para o operador `CUSTOM` (ainda interpola valor). Não usar `CUSTOM` vindo do cliente.

## O que o coletor deve mandar

No fio, `Where` é JSON array. Não interpolar SQL.

```json
[
  { "key": "CodEmpresa", "operator": "=", "value": 1 },
  { "key": "CodCarrinho", "operator": "=", "value": 94 }
]
```

`operator` omitido vale `=`.

| App | Método no `QueryBuilder` | No Socket |
| --- | --- | --- |
| `exp` | `buildWhereParams()` | `SendQuerySocketDto.where` (lista) |
| Desktop | `buildWhereList()` | `payload['Where']` (lista) |

Não usar `QueryBuilder.buildSqlWhere()` no emit. Esse método ainda existe nos dois apps (testes / legado); no fio ele vira o warn abaixo.

Dart (`exp`; o desktop é o mesmo shape):

```dart
final where = queryBuilder.buildWhereParams(); // List<Map<String, dynamic>>?

socket.emit('$sessionId $evento', jsonEncode({
  'Session': sessionId,
  'ResponseIn': responseId,
  if (where != null && where.isNotEmpty) 'Where': where,
  'Pagination': 'LIMIT=200&OFFSET=0&PAGE=1',
}));
```

### Exemplos por evento

`conferir.item.consulta` / `conferencia.item.consulta` — `CodCarrinho` é obrigatório:

```json
[
  { "key": "CodEmpresa", "value": 1 },
  { "key": "CodConferir", "value": 287622 },
  { "key": "CodCarrinho", "value": 523 }
]
```

`separar.consulta` — setor é igualdade; o servidor monta o `EXISTS`. Não mandar `EXISTS`, `LIKE` em `CodSetoresEstoque` nem SQL cru:

```json
[
  { "key": "Situacao", "operator": "IN", "value": ["AGUARDANDO", "SEPARANDO"] },
  { "key": "CodSetorEstoque", "value": 3 },
  { "key": "DataEmissao", "operator": ">=", "value": "2026-11-13" },
  { "key": "DataEmissao", "operator": "<", "value": "2026-11-14" }
]
```

Caminho: `normalizeConsultaWhere` → `buildWhereParameterized`.

`Where` omitido, `null` ou `''` vira lista vazia (sem filtro SQL). A página continua no teto 1500.

## String SQL (legado)

O coletor que ainda manda `QueryBuilder.buildSqlWhere()` continua atendido: a string (ou `string[]` juntada com `AND`) entra no `WHERE` como fragmento. O SQL **não** é parametrizado.

O servidor grava um **warn** (não `error`, não `Error` no Socket):

```text
[app] Consulta Where em SQL cru (legado QueryBuilder) sql=CodEmpresa = 1 AND CodCarrinho = 523
```

O SELECT segue. A resposta continua `{ Data: [...] }`. O coletor **não** recebe `[INVALID_PAYLOAD]` por isso.

Recusar string SQL no `Where` está em [Ainda não](../socket/protecoes-cliente.md#ainda-não-preparem). Não ligar enquanto houver build antigo no campo.

Objeto que não é lista de params continua `[INVALID_PAYLOAD] Where deve ser uma lista de parametros.`

### Estado nos coletores (2026-11-13)

| App | Fonte atual | O que o log SQL cru indica |
| --- | --- | --- |
| `exp` | `SocketRequestHelper` já manda `buildWhereParams()` | APK / build **publicado antigo** ainda no `buildSqlWhere()` |
| Desktop (`app_expedicao`) | `AppSocketConfig._queryMappedPage` já manda `buildWhereList()` | Idem. O DTO `SendQuerySocketModel.where` ainda é `String?` — não usar no emit novo |

Se o warn mostrar `EXISTS ( SELECT * FROM Expedicao.ItemSepararEstoque …)`, o coletor montou o subquery na mão. Mandar só `{ key: "CodSetorEstoque", value: <id> }`.

### Painel Windows (aba Erros)

`logAppWarn` usa `console.warn` → **stderr**. O supervisor (`apps/desktop/electron/log-buffer.ts`) marca **qualquer** stderr como erro: a linha fica vermelha no Console, entra na aba **Erros** e vai para `%ProgramData%\data7-expedicao\errors.log`.

Isso **não** significa que a consulta falhou. Não é falha gravada pelo coletor. Operador: ignorar `Consulta Where em SQL cru (legado QueryBuilder)` na aba Erros; o coletor some da lista quando o app passar a mandar `{ key, value }`.

## Formatos de `Where` (Socket.IO)

### Lista de objetos (formato preferido)

Ver [O que o coletor deve mandar](#o-que-o-coletor-deve-mandar).

### String SQL e lista de strings (legado)

Ver [String SQL (legado)](#string-sql-legado).

### `sequencia.select`

Não é filtro SQL. `Where` é o **nome** da sequência (`Produto_Sequencia`, …): string, `[{ value: 'Nome' }]` ou `{ Nome: '...' }`. Objeto sem nome vira `[INVALID_PAYLOAD]`. Sequência inexistente: `[NOT_FOUND] Sequencia nao encontrada`.

## Operadores (`Params`)

`src/contracts/local.base.params.ts`:

| Método | Operador |
| --- | --- |
| `Params.equals` | `=` |
| `Params.notEquals` | `!=` |
| `Params.greaterThan` / `greaterThanOrEqual` | `>` / `>=` |
| `Params.lessThan` / `lessThanOrEqual` | `<` / `<=` |
| `Params.like` / `notLike` | `LIKE` / `NOT LIKE` |
| `Params.in` / `notIn` | `IN` / `NOT IN` (lista vazia em `IN` vira `1=0`; lista enorme é fatiada no teto 2100) |
| `Params.isNull` / `isNotNull` | `IS NULL` / `IS NOT NULL` (sem `value`; o coletor antigo `operator: 'IS'` + `value: null` vira `IS NULL`) |
| `Params.between` | `BETWEEN` — valor `[min, max]` |
| `Params.custom` | `CUSTOM` — só no `build` legado; consultas paginadas **não** devem receber isso do cliente |

`>` / `<` ligam **valor**, não nome de coluna. `QuantidadeItensSetor > QuantidadeItensSeparacaoSetor` não existe neste contrato — filtrar no cliente ou empurrar no SQL interno da consulta.

Vários grupos no mesmo `SELECT`: `executeSelectWhereAny` → `(a AND b) OR (c AND d)`, com o mesmo limite de página.

## Teto de parâmetros (SQL Server 2100)

O driver aceita no máximo **2100** binds por `request` (Msg 8003). Isso é independente do teto de **1500 linhas** da página.

Refresh interno (`consultaAny` / `buildWhereAnyOf`) monta um `OR` por chave. 800 itens × 3 colunas já passam de 2100. O helper fatia os grupos em `src/repository/common/sql.param.budget.ts`:

| Constante | Valor | Uso |
| --- | --- | --- |
| `SQL_MAX_PARAMS` | 2100 | Limite do SQL Server |
| `SQL_PARAM_BUDGET` | 2000 | Orçamento do `WHERE` (reserva paginação e extras) |
| `SQL_IN_CHUNK` | 500 | Tamanho de `IN` / `NOT IN` grande |

Cada fatia roda um `SELECT`. Os `recordset` são concatenados e só então o `OFFSET/FETCH` (ou o recorte em memória) aplica o teto de linhas. `pageLimitForGroups` **não** fatia binds.

`IN` com milhares de valores no `executeSelectWhere` usa o mesmo orçamento. Não interpolar a lista no SQL para “fugir” do 2100.

No salvar carrinho, se o lote for do mesmo estágio (`CodEmpresa` + documento + `CodCarrinhoPercurso` + `ItemCarrinhoPercurso`), o refresh usa um `WHERE` de 4 parâmetros em vez de um `OR` por item. Lote misto cai no chunk. Contrato Socket (`Mutation` lista) não muda.

Erro residual: `[SQL-8003] Muitos itens nesta operacao. Tente novamente.` — [Erros](../expedicao/erros.md).

## `separar.consulta` (setor e data)

`CodSetorEstoque` vira `EXISTS` em `ItemSepararEstoque` (alias `SepararConsulta`), não coluna da view. O `exp` atual (fonte) manda `CodSetorEstoque =` e `DataEmissao` em intervalo (`>=` dia, `<` dia seguinte) na lista `{ key, value }`.

O servidor **não recusa** `LIKE` de build antigo em `CodSetoresEstoque` / `DataEmissao`: reescreve para o mesmo `EXISTS` / igualdade ou intervalo (`src/repository/common/separar.consulta.where.ts`). String SQL legado passa pela mesma reescrita **depois** do warn. O `STRING_AGG` fica fora da derived table da página — [paginação](./paginacao.md), [separar](../socket/separar.md).

Índices desses `WHERE` (scripts `07`/`08`/`09` na `Estacao`): [Índices](../expedicao/indices.md). O cliente novo não deve voltar a mandar `LIKE` de setor/data; o shim existe para build antigo.

## `CodCarrinho` nas consultas de item

`conferir.item.consulta` e `conferencia.item.consulta` **exigem** `CodCarrinho` (número `> 0`) na lista ou no fragmento SQL (`CodCarrinho = 94`). Sem isso: `[INVALID_PAYLOAD] <evento> exige CodCarrinho no Where.`

## OrderBy

Campo `OrderBy` no Socket.IO, query string:

```text
order_by=CodProduto,Item&order_direction=ASC,DESC
```

Só identificadores de coluna e `ASC`/`DESC`. Sem `OrderBy` válido, a página usa `ORDER BY (SELECT NULL)`.
