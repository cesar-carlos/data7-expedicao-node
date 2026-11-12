# Índices de consulta

Os `WHERE` dos clientes Flutter caem no `SELECT * FROM (view) WHERE …`. O SQL Server só usa índice se o predicado for coluna real da tabela.

Scripts para avaliar e executar na `Estacao` (já no `RODAR.sql`):

`D:\Developer\Data7\Expedicao\Expedicao Correcoes\`

| Ordem | Arquivo |
| --- | --- |
| 7 | `07 - drop-indices-filtrados-produto.sql` — se o ERP FireDAC falhar com erro 1934 `ANSI_WARNINGS` |
| 8 | `08 - diagnostico-indices-consulta.sql` — só leitura, checklist `EXISTE` / `FALTA` / `TABELA AUSENTE` / `EXISTE FILTRADO` |
| 9 | `09 - indices-consulta-expedicao.sql` — cria o que faltar; se achar filtro em `Produto`/`Conversao`, dropa e recria sem filtro |

O nome do arquivo é a ordem de execução (00–09 na pasta). `UX_Conferir_OrigemAtiva` é o `03`. Duplicata: `03a` + `03b`. Detalhe: `LEIA-ME.md` e `LEIA-ME-indices-consulta.md`.

Triggers (00–06) são o outro pacote. [Triggers](./triggers.md).

O 09 **não** altera tabela, coluna nem chave. Pode rodar de novo. **Não** recria `UX_Conferir_OrigemAtiva` (isso é o 03).

## Clientes

| App | `WHERE` típico |
| --- | --- |
| `D:\Developer\Data7\Expedicao\Flutter\app_expedicao` | Igualdade: documento (`CodEmpresa` + `CodSepararEstoque` / `CodConferir`), origem, carrinho, código de barras |
| `D:\Developer\Data7\Expedicao\Flutter\app\exp` | O mesmo, mais lista com `Situacao IN`, `CodSetorEstoque` e `LIKE` |

Envelope do filtro: [Where](../contratos/where.md). Eventos que usam esses `WHERE`: [consultas Socket.IO](../socket/consultas.md).

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
| `IX_SeparacaoUsuarioSetor_Usuario` | `SeparacaoUsuarioSetor` | próxima separação (`CodEmpresa + CodUsuario + CodSetorEstoque`) |
| `IX_ItemSeparacaoEstoque_Produto` | `ItemSeparacaoEstoque` | gravar / cancelar item (`CodProduto`) |
| `IX_SepararEstoque_Situacao` | `SepararEstoque` | lista com `Situacao IN (...)` |
| `IX_Produto_CodigoBarras1` / `IX_Produto_CodigoBarras2` | `dbo.Produto` | scan de produto (**sem** filtro) |
| `IX_ConversaoUnidadeMedida_Codigo` | `dbo.ConversaoUnidadeMedida` | scan da conversão de unidade (**sem** filtro) |

Código de barras **não** usa índice filtrado. O ERP FireDAC e as triggers Data7 ligam `ANSI_WARNINGS OFF`; filtro em `dbo.Produto` gera erro 1934 em qualquer `UPDATE` (ex.: `ItemProdutoVendido.AtualizaPosicaoProduto`). Se o 08 marcar `EXISTE FILTRADO`, rode o **07** e depois o **09**. Se a coluna não existir na `Estacao`, o 09 ignora e imprime o motivo.

`UX_Conferir_OrigemAtiva` (`CodEmpresa, Origem, CodOrigem` onde `Situacao <> 'CANCELADA'`) continua no script 03. Serve o `WHERE` de conferência ativa. Esse **é** filtrado, de propósito — só afeta DML em `Expedicao.Conferir`. As triggers `02`/`04`/`05` ficam com `ANSI_WARNINGS ON` para não gerar 1934 no Finalizar Carrinho.

## O que índice não resolve

| Filtro do cliente | Motivo | O que usar |
| --- | --- | --- |
| `CodSetoresEstoque LIKE '%3%'` | Coluna é `STRING_AGG` na view, não existe na tabela | `CodSetorEstoque = 3` — a API vira `EXISTS` em `ItemSepararEstoque` |
| `DataEmissao LIKE 'yyyy-MM-dd%'` | `SepararEstoque.Data` é `DATE`; `LIKE` converte e ignora o índice | `=` ou intervalo (`BETWEEN` / `>=` e `<`) |
| `LIKE '%texto%'` em nome / endereço | B-tree não faz seek em contains | Prefixo sem `%` inicial, ou full-text se a busca for requisito |
| `ORDER BY (SELECT NULL)` | Paginação sem ordem estável | Mandar `OrderBy` no contrato |

Em `separar.consulta`, `CodSetorEstoque` com igualdade **não** filtra a view: vira `EXISTS` em `ItemSepararEstoque`. Detalhe em [Where](../contratos/where.md).

## Depois de executar

Rode o 08 de novo. Esperado: nada em `FALTA` nem em `EXISTE FILTRADO`, salvo `TABELA AUSENTE` (índice ignorado) ou `UX_Conferir_OrigemAtiva` se o 03 ainda não rodou.
