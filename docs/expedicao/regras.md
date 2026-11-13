# Regras da expedição

Quebrar uma destas regras reproduz os bugs já vistos (carrinho na conferência sem item, snapshot cedo demais, lista cortada).

## Responsabilidade

1. Este servidor **não** gera `Expedicao.Conferir` quando a separação termina. Quem gera é a trigger `tr_ExpedicaoCarrinhoPercursoConferir`.
2. O Flutter **não** deve voltar a chamar `ConferirSeparacaoAdicionarService` enquanto a trigger existir. Hoje `addConferir` está comentado. Duas origens criam documento duplicado ou snapshot divergente.
3. Correção de trigger e índice de pesquisa não entram neste repositório Node. Scripts avaliados ficam em `D:\Developer\Data7\Expedicao\Expedicao Correcoes`. Pacote único: `RODAR.sql`. A trigger `02` grava `Expedicao.ConferirResumo` (grade do ERP). O `10` em `trigger & procedure` está incompleto.

## Chaves

4. `ItemConferir` **não** tem `CodCarrinho`. O carrinho vem do join `ItemCarrinhoPercurso = CarrinhoPercursoEstagio.Item`.
5. `ItemCarrinhoPercurso` do `ItemConferir` aponta para o estágio da **separação**, não para o `CONFERINDO` da conferência. Consultar `ItemCarrinhoPercurso = '00010'` (estágio CO) e concluir que não há item é consulta errada.
6. O conferente, ao ler o carrinho, cria um estágio **novo** `CO` / `CONFERINDO`. Esse insert não religa `ItemConferir`.

## Fechamento da separação

7. A conferência só pode nascer quando o percurso `SE` passa a `SEPARADO`.
8. Cancelar carrinho e gravar `CA` nos itens são dois commits hoje. A trigger de estágio **não** pode tratar o cancelamento como “separação pronta”.
9. Carrinho aberto na contagem de fechamento é só origem `SE`. `CONFERINDO` no mesmo percurso não segura nem dispara o fechamento da separação.
10. Quantidade pendente do fechamento conta item `FN`/`SP` em estágio `SEPARADO`/`AGRUPADO`. Item de estágio `CANCELADA` não conta, mesmo ainda `SP`.
11. Várias pessoas na mesma `CodSepararEstoque` é o modo normal. Fechar a separação precisa serializar no cabeçalho do percurso.

## Consultas deste servidor

12. Sem `LIMIT` do cliente, a página é 1500. `LIMIT` explícito é respeitado. Detalhe em [Paginação](../contratos/paginacao.md).
13. `TOP 1` no SQL de consulta pega o último estágio/carrinho ligado ao registro. Não é paginação da lista.
14. `conferir.item.consulta` e `conferencia.item.consulta` **exigem** `CodCarrinho` (`> 0`) no `Where`. Sem o campo o servidor responde `[INVALID_PAYLOAD]`. Filtrar só na memória no coletor continua errado: a página de 1500 corta o carrinho.
15. `KEEP_EVERY_UNIT_ROW` permanece na unidade de medida do item quando o cliente não manda página.

## Gravação

16. Mutação Socket.IO hoje é autocommit (`pool.request()`). `executeInTransaction` ainda não envolve `BEGIN/COMMIT`. Insert de conferir/separar atribui todas as sequências e grava o lote em seguida, mas cada `INSERT` continua um statement. Cancelar estágio e cancelar itens **não** são a mesma transação. Sequência ausente ou `Valor <= 0` aborta com `[INTERNAL_ERROR] Sequencia indisponivel (…)` — não grava PK 0.
17. Transação de verdade precisa coexistir com autocommit: cliente novo opta; cliente antigo continua como está.
18. Falha no Socket.IO/HTTP sai como `[identificador] mensagem`. `THROW` 50011–50099 vira `BUSINESS_RULE_VIOLATION` (`[50014] …`). SQL interno não vaza nome de tabela (`[SQL-208] Falha ao processar no banco.`). Mais de 2100 parâmetros no request vira `[SQL-8003]`, nunca o inglês do driver. Cancelar carrinho não gera `THROW`. Tabela completa em [Erros](./erros.md).

## Conferência na tela

19. Abrir estágio `CO` de carrinho sem `ItemConferir` deve falhar na base (`50014`). A lista de cima agrupada não basta. No coletor a mensagem é `[50014] Carrinho sem itens para conferir…`.
20. Carrinho `CONFERINDO` sem item a conferir **não** está completo. `every()` em lista vazia no Dart não vale.
21. `Carrinho não conferido!` ao salvar (F12) significa ausência de `ItemConferencia` (scan). É sintoma, não causa.
22. O coletor não embrulha erro de socket com `Exception('Erro ao X: $e')` nem dump `AppError{...}`. A mensagem que chega na tela é o texto prefixado (`[50014] …`). Desktop: `AppError.display`. `exp`: `DataError.message`.

## Índices de consulta

23. Índice de pesquisa não entra neste repositório. Diagnóstico e `CREATE INDEX` ficam em `D:\Developer\Data7\Expedicao\Expedicao Correcoes` (`07 -` / `08 -` / `09 -`). Não criar índice filtrado em `dbo.Produto` nem em `Expedicao.Conferir`: o FireDAC do ERP usa `ANSI_WARNINGS OFF` (erro 1934; Local Erro 886 no `UPDATE Conferir`). Unicidade de conferência ativa é a trigger `04`. As triggers `02`/`04`/`05` ficam com `ANSI_WARNINGS ON`. Mapa `WHERE` → índice em [Índices](./indices.md).
24. Em `separar.consulta`, filtrar setor com `CodSetorEstoque =`. `LIKE` em `CodSetoresEstoque` (`STRING_AGG`) e em `DataEmissao` (`DATE`) não usa B-tree.
25. O `STRING_AGG` de `separar.consulta` (e do listen) fica em `OUTER APPLY` **depois** da base `SepararConsulta`. Não envolver de novo numa derived table antes do `OFFSET/FETCH`: a lista varre `ItemSepararEstoque`, estoura 30 s e segura lock compartilhado enquanto o ERP grava. Não subir `SQL_REQUEST_TIMEOUT_MS` para esconder lentidão. SQL: [separar](../socket/separar.md).
26. Proteções de lista **não** recusam o pedido do coletor: `LIKE` em `CodSetoresEstoque` / `DataEmissao` é reescrito para `EXISTS` / data; consultas `*.consulta` iguais no mesmo socket compartilham o SQL e respondem todos os `ResponseIn`; `SET LOCK_TIMEOUT` vale só no `SELECT` (padrão 5 s, `SQL_LOCK_TIMEOUT_MS`); timeout do Node cancela a request e devolve o `[SQL-CONN]` de sempre. Não exigir token no handshake, não cortar `LIMIT` explícito, não recusar string SQL do `Where`. [Where](../contratos/where.md), [erros](./erros.md).
27. Canal de emergência `servidor.emergencia.listen` é só servidor → cliente (`{ Data }`, sem `Session`). O coletor escuta na conexão com `allEvent: true`. O servidor **já** emite o aviso (HTTP loopback). Desconectar automaticamente quem trava a base **ainda não** está ligado; quando estiver, o aviso sai neste canal antes do `disconnect`. Guia para os agentes dos coletores: [proteções](../socket/protecoes-cliente.md).
