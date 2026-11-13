# Índices de consulta

Os `WHERE` dos clientes Flutter caem no SQL de `src/sql/` + `WHERE` do helper. O SQL Server só usa índice se o predicado for coluna real da tabela (não alias de `STRING_AGG`).

Scripts para avaliar e executar na `Estacao` (já no `RODAR.sql`):

`D:\Developer\Data7\Expedicao\Expedicao Correcoes\`

| Ordem | Arquivo |
| --- | --- |
| 7 | `07 - drop-indices-filtrados-produto.sql` — se o ERP FireDAC falhar com erro 1934 `ANSI_WARNINGS` |
| 8 | `08 - diagnostico-indices-consulta.sql` — só leitura, checklist `EXISTE` / `FALTA` / `TABELA AUSENTE` / `EXISTE FILTRADO` |
| 9 | `09 - indices-consulta-expedicao.sql` — cria o que faltar; se achar filtro em `Produto`/`Conversao`, dropa e recria sem filtro |

O nome do arquivo é a ordem de execução (00–09 na pasta). O `03` **dropa** `UX_Conferir_OrigemAtiva` (FireDAC 1934 no ERP). Duplicata: `03a` + `03b`. Unicidade: trigger `04`. Detalhe: `LEIA-ME.md` e `LEIA-ME-indices-consulta.md`.

Triggers (00–06) são o outro pacote. [Triggers](./triggers.md).

O 09 **não** altera tabela, coluna nem chave. Pode rodar de novo. **Não** cria `UX_Conferir_OrigemAtiva` (o 03 dropa se existir).

## Clientes

| App | `WHERE` típico |
| --- | --- |
| `D:\Developer\Data7\Expedicao\Flutter\app_expedicao` | Igualdade: documento (`CodEmpresa` + `CodSepararEstoque` / `CodConferir`), origem, carrinho, código de barras |
| `D:\Developer\Data7\Expedicao\Flutter\app\exp` | O mesmo, mais lista com `Situacao IN`, `CodSetorEstoque =` e `DataEmissao` em intervalo. `LIKE` de setor/data só em build antigo; a API reescreve para `EXISTS` / data e **não** recusa o pedido |

Envelope do filtro: lista `{ key, value }` — [Where](../contratos/where.md). SQL cru no fio ainda funciona (warn no servidor) e **não** usa bind. Eventos: [consultas Socket.IO](../socket/consultas.md).

## O que a PK e o UNIQUE já cobrem

Não criar índice nessas chaves.

| Objeto | Já existe |
| --- | --- |
| `SepararEstoque` / `Conferir` | PK `(CodEmpresa, Cod*)` |
| `ItemSepararEstoque` / `ItemConferir` / `ItemSeparacaoEstoque` / `ItemConferencia` | PK `(CodEmpresa, Cod*, Item)` |
| `CarrinhoPercursoEstagio` | PK `(CodEmpresa, CodCarrinhoPercurso, Item)` |
| `CarrinhoPercurso` | `UNIQUE (CodEmpresa, Origem, CodOrigem)` |
| `Carrinho.CodigoBarras` | `UNIQUE` |

## O que o 09 cria

Os sete primeiros já estavam no final de `zTabelas.sql`. O 09 só cria se ainda não existirem.

| Índice | Tabela | `WHERE` do cliente |
| --- | --- | --- |
| `IX_CarrinhoPercursoEstagio_CarrinhoAtual` | `CarrinhoPercursoEstagio` | `CodEmpresa + CodCarrinho` (scan / `OUTER APPLY` da consulta de carrinho) |
| `IX_CarrinhoPercursoEstagio_Origem` | `CarrinhoPercursoEstagio` | `CodEmpresa + Origem + CodOrigem` |
| `IX_CarrinhoPercursoEstagio_AbertosUsuario` | `CarrinhoPercursoEstagio` | carrinhos abertos do usuário |
| `IX_CarrinhoPercursoAgrupamento_Item` | `CarrinhoPercursoAgrupamento` | item do estágio agrupado |
| `IX_CarrinhoPercursoAgrupamento_Agrupador` | `CarrinhoPercursoAgrupamento` | carrinho agrupador |
| `IX_ItemSeparacaoEstoque_Percurso` | `ItemSeparacaoEstoque` | itens do estágio |
| `IX_ItemConferencia_Percurso` | `ItemConferencia` | scans do estágio |
| `IX_ItemConferir_Percurso` | `ItemConferir` | janela `CodCarrinho` na conferência (`CodCarrinho` vem do join com o estágio) |
| `IX_Cancelamento_Origem` | `Cancelamento` | `CodEmpresa + Origem + CodOrigem + ItemOrigem` |
| `IX_ItemSepararEstoque_Setor` | `ItemSepararEstoque` | `EXISTS CodSetorEstoque` em `separar.consulta` e picking por setor |
| `IX_SeparacaoUsuarioSetor_Usuario` | `SeparacaoUsuarioSetor` | próxima separação (`CodEmpresa + CodUsuario + CodSetorEstoque`); segundo `OUTER APPLY` de `separar.consulta` |
| `IX_ItemSeparacaoEstoque_Produto` | `ItemSeparacaoEstoque` | gravar / cancelar item (`CodProduto`) |
| `IX_SepararEstoque_Situacao` | `SepararEstoque` | lista com `Situacao IN (...)` |
| `IX_Produto_CodigoBarras1` / `IX_Produto_CodigoBarras2` | `dbo.Produto` | scan de produto (**sem** filtro) |
| `IX_ConversaoUnidadeMedida_Codigo` | `dbo.ConversaoUnidadeMedida` | scan da conversão de unidade (**sem** filtro) |

Código de barras **não** usa índice filtrado. O ERP FireDAC e as triggers Data7 ligam `ANSI_WARNINGS OFF`; filtro em `dbo.Produto` gera erro 1934 em qualquer `UPDATE` (ex.: `ItemProdutoVendido.AtualizaPosicaoProduto`). Se o 08 marcar `EXISTE FILTRADO`, rode o **07** e depois o **09**. Se a coluna não existir na `Estacao`, o 09 ignora e imprime o motivo.

Não crie `UX_Conferir_OrigemAtiva`. Índice filtrado em `Expedicao.Conferir` faz o ERP FireDAC falhar no `UPDATE` da conferência (Local Erro 886, SQL 1934, `ANSI_WARNINGS OFF`). Unicidade de conferência ativa fica na trigger `04` (`THROW 50016`). O script `03` dropa o UX se ainda existir. As triggers `01`/`02`/`04`/`05`/`06` ficam com `ANSI_WARNINGS ON`.

## O que índice não resolve

| Filtro do cliente | Motivo | O que usar |
| --- | --- | --- |
| `CodSetoresEstoque LIKE '%3%'` | Coluna é `STRING_AGG` do `OUTER APPLY`, não existe na tabela | A API reescreve para `CodSetorEstoque = 3` (`EXISTS` em `ItemSepararEstoque`). O cliente novo já manda igualdade |
| `DataEmissao LIKE 'yyyy-MM-dd%'` | `SepararEstoque.Data` é `DATE`; `LIKE` converte e ignora o índice | A API reescreve para `=` ou intervalo (`>=` e `<`). O cliente novo já manda isso |
| `LIKE '%texto%'` em nome / endereço | B-tree não faz seek em contains | Prefixo sem `%` inicial, ou full-text se a busca for requisito |
| `ORDER BY (SELECT NULL)` | Paginação sem ordem estável | Mandar `OrderBy` no contrato |

Em `separar.consulta`, `CodSetorEstoque` com igualdade **não** filtra a view: vira `EXISTS` em `ItemSepararEstoque`. O `STRING_AGG` de `CodSetoresEstoque` / `CodUsuariosSeparacao` não entra na derived table da página: fica em `OUTER APPLY` depois da base, para o `OFFSET/FETCH` não agregar a tabela inteira. Detalhe em [Where](../contratos/where.md) e [separar](../socket/separar.md).

Na Estação, `READ_COMMITTED_SNAPSHOT ON` (DBA) faz a lista não bloquear o `UPDATE` do ERP. Não entra neste repositório Node e não muda JSON.

## Depois de executar

Rode o 08 de novo. Esperado: nada em `FALTA` nem em `EXISTE FILTRADO`, salvo `TABELA AUSENTE` (índice ignorado). `UX_Conferir_OrigemAtiva` deve estar ausente.
