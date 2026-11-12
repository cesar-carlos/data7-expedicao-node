# Eventos de separar

Handlers: `src/socket/separar/`, `src/socket/separar.item/`, `src/socket/separacao.item/`, `src/socket/separacao.usuario.setor/`.

Regras de situação e fechamento: [expedição](../expedicao/README.md). Envelope: [consulta Socket.IO](../contratos/consulta-socket.md).

## Pedidos de consulta

Canal: `${socket.id} <evento>`.

### `separar.consulta`

Lista de `SepararEstoque` com tipo de operação, prioridade, `CodSetoresEstoque` (`STRING_AGG`) e `CodUsuariosSeparacao`.

SQL: `src/sql/expedicao/expedicao.separar.consulta.sql`. DTO: `ExpedicaoSepararConsultaDto`.

`WHERE` típico: `CodEmpresa`, `Situacao IN (...)`, `CodSetorEstoque = <id>`.

`CodSetorEstoque` **não** é coluna da view. O repositório transforma igualdade em `EXISTS` em `ItemSepararEstoque`. `LIKE` em `CodSetoresEstoque` não entra nesse `EXISTS` e não usa índice.

`DataEmissao` na view é `SepararEstoque.Data` (`DATE`). Filtrar com `=` ou intervalo, não `LIKE 'yyyy-MM-dd%'`.

Índices: `IX_SepararEstoque_Situacao`, `IX_ItemSepararEstoque_Setor`.

### `separar.progresso.consulta`

Totais da separação. SQL: `expedicao.progresso.separacao.consulta.sql`.

### `separar.estoque.item.impresso.consulta`

Itens já impressos. `Where` omitido vira lista vazia (`defaultWhere: []`).

### `separar.item.consulta`

Itens a separar. `UnidadeMedidas` sai vazio neste evento — o cliente busca conversões em `separar.item.unidade.medida.consulta`. Aninhar unidades neste JSON travava a fila do socket em listas grandes.

SQL: `expedicao.item.separar.consulta.sql`.

### `separar.item.unidade.medida.consulta`

Só as conversões. Sem página do cliente, `KEEP_EVERY_UNIT_ROW` — [paginação](../contratos/paginacao.md#unidade-de-medida).

### `separacao.item.consulta` e `separacao.item.resumo.consulta`

O que já foi para o carrinho (`ItemSeparacaoEstoque`). Resumo agrega quantidade por produto.

### `separar.usuario.setor.consulta`

Atribuição usuário × setor × documento. `WHERE` típico: `CodEmpresa + CodUsuario + CodSetorEstoque` (+ `CodSepararEstoque`). Índice: `IX_SeparacaoUsuarioSetor_Usuario`.

### `*.select`

Mesmas chaves, tabela física, sem joins da view.

## Mutação

`separar.insert|update|delete`, `separar.item.*`, `separacao.item.*`, `separar.usuario.setor.*`.

`separar.insert` exige `CodEmpresa`, `Origem` e `CodOrigem`. Sequência ausente ou `Valor <= 0` aborta com `[INTERNAL_ERROR] Sequencia indisponivel (…)` — não grava PK 0. Listen de separar usa `ExpedicaoMutationListenEvent` (`{ Mutation }`, sem `Session`/`ResponseIn`). Delete carrega a consulta **antes** de apagar.

Gravar item no carrinho (`separacao.item.insert/update/delete`) emite também `separar.item.consulta.update.listen`, para a tela de picking atualizar quantidade sem nova consulta. Salvar o carrinho (F12) manda a lista inteira num único `separacao.item.update`; o servidor grava linha a linha e no refresh usa a chave do estágio quando o lote é do mesmo carrinho, para não estourar o teto de 2100 parâmetros. [Where](../contratos/where.md).

Estágio do percurso (`carrinho.percurso.estagio`) emite `separar.update.listen` no insert e no update. No Finalizar Carrinho o Node relê `separar.consulta` **depois** da trigger 01: a `Situacao` no listen já é `SEPARADO` quando a separação fechou. Também sai `carrinho.percurso.update.listen` e `carrinho.percurso.estagio.update.listen`. Catálogo: [listen](./listen.md).

## Escuta periódica

`separar.consulta.listen` **não** é pedido do cliente. O processo consulta e emite para todos os sockets. Página padrão 20, não 1500. Não substitui o `separar.update.listen` do fechamento. [Escuta](./escuta.md).
