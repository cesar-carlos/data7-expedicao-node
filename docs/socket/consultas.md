# Consultas Socket.IO

Pedido: `${socket.id} <evento>`. Envelope: [consulta Socket.IO](../contratos/consulta-socket.md).

`consulta` usa SQL em `src/sql/` (view com joins) e devolve `*ConsultaDto`. `select` lê a tabela e devolve o DTO de gravação. Os dois aceitam `Where`, `Pagination` e `OrderBy`. Sem `LIMIT`, a página é 1500 — [paginação](../contratos/paginacao.md).

Índices desses `WHERE`: [índices](../expedicao/indices.md).

## Expedição — separar

| Evento | SQL / tabela | DTO | Nota |
| --- | --- | --- | --- |
| `separar.consulta` | `src/sql/expedicao/expedicao.separar.consulta.sql` | `ExpedicaoSepararConsultaDto` | `STRING_AGG` em `OUTER APPLY` depois da base; o helper pagina no mesmo `SELECT`. `CodSetorEstoque =` e `LIKE` em `CodSetoresEstoque` / `DataEmissao` viram `EXISTS` / data. Dedup por socket responde todos os `ResponseIn`. [Separar](./separar.md) |
| `separar.progresso.consulta` | `expedicao.progresso.separacao.consulta.sql` | `ExpedicaoProgressoSeparacaoConsultaDto` | Totais da separação |
| `separar.estoque.item.impresso.consulta` | `expedicao.item.impresso.consulta.sql` | `ExpedicaoItemImpressoConsultaDto` | `Where` vazio vira `[]` |
| `separar.select` | tabela `SepararEstoque` | `ExpedicaoSepararDto` | Sem joins da view |
| `separar.item.consulta` | `expedicao.item.separar.consulta.sql` | `ExpedicaoItemSepararConsultaDto` | `UnidadeMedidas` vazio. Conversões: `separar.item.unidade.medida.consulta` |
| `separar.item.unidade.medida.consulta` | `expedicao.item.separar.unidade.medida.consulta.sql` | `ExpedicaoItemSepararUnidadeMedidaConsultaDto` | Sem página do cliente, `KEEP_EVERY_UNIT_ROW` |
| `separar.item.select` | tabela `ItemSepararEstoque` | `ExpedicaoItemSepararDto` | |
| `separacao.item.consulta` | `expedicao.item.separacao.consulta.sql` | `ExpedicaoItemSeparacaoConsultaDto` | O que já foi para o carrinho |
| `separacao.item.resumo.consulta` | `expedicao.item.separacao.resumo.consulta.sql` | `ExpedicaoItemSeparacaoResumoConsultaDto` | |
| `separacao.item.select` | tabela `ItemSeparacaoEstoque` | DTO de gravação | |
| `separar.usuario.setor.consulta` | `expedicao.separacao.usuario.setor.consulta.sql` | `ExpedicaoSeparacaoUsuarioSetorConsultaDto` | Próxima separação do usuário/setor |
| `separar.usuario.setor.select` | tabela `SeparacaoUsuarioSetor` | DTO de gravação | |

Escuta periódica **sem pedido**: `separar.consulta.listen`. [Escuta](./escuta.md).

## Expedição — conferir

| Evento | SQL / tabela | DTO | Nota |
| --- | --- | --- | --- |
| `conferir.consulta` | `expedicao.conferir.consulta.sql` | `ExpedicaoConferirConsultaDto` | Documento a conferir |
| `carrinho.conferir.consulta` | `expedicao.carrinho.conferir.consulta.sql` | `ExpedicaoCarrinhoConferirConsultaDto` | Carrinhos da conferência. O Flutter só aceita leitura se o código existir aqui |
| `conferir.select` | tabela `Conferir` | `ExpedicaoConferirDto` | |
| `conferir.item.consulta` | `expedicao.item.conferir.consulta.sql` | `ExpedicaoItemConferirConsultaDto` | Exige `CodCarrinho` no `Where`. `ItemConferir` **não** tem essa coluna — vem do join com o estágio. [Conferir](./conferir.md) |
| `conferir.item.unidade.medida.consulta` | `expedicao.item.conferir.unidade.medida.consulta.sql` | `ExpedicaoItemConferirUnidadeMedidaConsultaDto` | Sem página do cliente, `KEEP_EVERY_UNIT_ROW` |
| `conferir.separacao.item.consulta` | `expedicao.conferir.separacao.item.consulta.sql` | `ExpedicaoItemSeparacaoConferirConsultaDto` | Item da separação visto na conferência |
| `conferir.item.select` | tabela `ItemConferir` | `ExpedicaoItemConferirDto` | Sem `CodCarrinho` |
| `conferencia.item.consulta` | `expedicao.item.conferencia.consulta.sql` | `ExpedicaoItemConferenciaConsultaDto` | Scans. Exige `CodCarrinho` no `Where` |
| `conferencia.item.select` | tabela `ItemConferencia` | DTO de gravação | |

## Carrinho e percurso

| Evento | SQL / tabela | DTO | Nota |
| --- | --- | --- | --- |
| `carrinho.consulta` | `expedicao.carrinho.consulta.sql` | `ExpedicaoCarrinhoConsultaDto` | |
| `carrinho.select` | tabela `Carrinho` | DTO de gravação | |
| `carrinho.percurso.consulta` | `expedicao.carrinho.percurso.estagio.consulta.sql` | `ExpedicaoCarrinhoPercursoEstagioConsultaDto` | Reusa a consulta de **estágio**. Não há `expedicao.carrinho.percurso.consulta.sql` |
| `carrinho.percurso.select` | tabela `CarrinhoPercurso` | DTO de gravação | Cabeçalho do percurso (`SE` + `CodSepararEstoque`) |
| `carrinho.percurso.estagio.consulta` | `expedicao.carrinho.percurso.estagio.consulta.sql` | `ExpedicaoCarrinhoPercursoEstagioConsultaDto` | Mesmo SQL de `carrinho.percurso.consulta` |
| `carrinho.percurso.estagio.select` | tabela `CarrinhoPercursoEstagio` | DTO de gravação | |
| `carrinho.percurso.agrupamento.consulta` | `expedicao.carrinho.percurso.agrupamento.consulta.sql` | DTO de consulta | |
| `carrinho.percurso.agrupamento.select` | tabela `CarrinhoPercursoAgrupamento` | DTO de gravação | |
| `expedicao.percurso.estagio.select` | tabela de estágio de percurso | DTO de gravação | Só `select` (sem `consulta`) |

## Produto, usuário, setor, armazenagem

| Evento | SQL / tabela | DTO | Nota |
| --- | --- | --- | --- |
| `estoque.produto.consulta` | `src/sql/common.data/estoque.produto.consulta.sql` | `EstoqueProdutoConsultaDto` | Scan de código de barras: `CodigoBarras1` / `CodigoBarras2` |
| `estoque.produto.select` | tabela `Produto` | DTO de gravação | |
| `produto.conversao.unidade.consulta` | `estoque.conversao.unidada.consulta.sql` | `EstoqueConversaoUnidadeConsultaDto` | Scan da conversão: coluna `Codigo`. Sem `ResponseIn`, a resposta volta em `${id} produto.conversao.unidade.consulta` |
| `produto.conversao.unidade.select` | tabela `ConversaoUnidadeMedida` | DTO de gravação | |
| `usuario.consulta` | `usuario.consulta.sql` | `UsuarioConsultaDto` | HTTP paralelo: [usuários](../http/usuario-consulta.md) |
| `usuario.select` | tabela `Usuario` | `UsuarioDto` | |
| `setor.estoque.select` | tabela `SetorEstoque` | só `select` | |
| `armazenar.item.consulta` | `expedicao.item.armazenar.consulta.sql` | `ExpedicaoItemArmazenarConsultaDto` | |
| `armazenar.item.select` | tabela de item a armazenar | DTO de gravação | |
| `armazenar.select` | tabela `Armazenar` | só `select` | |
| `tipo.operacao.expedicao.select` | tabela | só `select` | |
| `tipo.operacao.armazenagem.select` | tabela | só `select` | |
| `processo.executavel.select` | tabela | só `select` | |
| `expedicao.cancelamento.select` | tabela `Cancelamento` | só `select` | |
| `sequencia.select` | sequência | só `select` | Nome do evento **não** é `sequencia.registro.select`. `Where` é o nome da sequência, não SQL |

## `WHERE` que o coletor manda com frequência

| Evento | Filtro | Índice |
| --- | --- | --- |
| `separar.consulta` | `CodEmpresa`, `Situacao IN`, `CodSetorEstoque =` | PK + `IX_SepararEstoque_Situacao` + `IX_ItemSepararEstoque_Setor` + `IX_SeparacaoUsuarioSetor_Usuario` (`APPLY`) |
| `separar.usuario.setor.consulta` | `CodEmpresa + CodUsuario + CodSetorEstoque` | `IX_SeparacaoUsuarioSetor_Usuario` |
| `conferir.item.consulta` | `CodEmpresa + CodConferir + CodCarrinho` | `IX_ItemConferir_Percurso` (join no estágio) |
| `conferencia.item.consulta` | `CodEmpresa + CodConferir + CodCarrinho` | `IX_ItemConferencia_Percurso` |
| `carrinho.conferir.consulta` | código / `CodCarrinho` | PK do carrinho + `IX_CarrinhoPercursoEstagio_CarrinhoAtual` |
| `estoque.produto.consulta` | `CodigoBarras1` / `CodigoBarras2` | `IX_Produto_CodigoBarras1/2` |
| `produto.conversao.unidade.consulta` | `Codigo` | `IX_ConversaoUnidadeMedida_Codigo` |

O `exp` atual manda `CodSetorEstoque =` e data com `=` / intervalo. `LIKE` em `CodSetoresEstoque` / `DataEmissao` só chega de build antigo e é reescrito no servidor. [Índices](../expedicao/indices.md).

## O que não é consulta de lista

- Mutação (`insert` / `update` / `delete`) — [eventos](./eventos.md)
- Broadcast `*.listen` depois de gravar — o cliente só escuta. Catálogo: [listen](./listen.md)
- `separar.consulta.listen` — poll do processo — [escuta](./escuta.md)
- `POST /expedicao/separacao/notify` e `PUT /expedicao/conferir/notify` — HTTP que emite listen
- Rotas HTTP `/usuarios` e login — [http/](../http/README.md)
- Monitor `/internal/sockets` — só loopback
