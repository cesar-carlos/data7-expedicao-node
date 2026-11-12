# Eventos de conferir

Handlers: `src/socket/conferir/`, `src/socket/conferir.item/`, `src/socket/conferencia.item/`.

Quem cria `Conferir` é a trigger, não este servidor. Fluxo: [separação → conferência](../expedicao/fluxo-separacao-conferencia.md). Envelope: [consulta Socket.IO](../contratos/consulta-socket.md).

## Pedidos de consulta

Canal: `${socket.id} <evento>`.

### `conferir.consulta`

Documento `Conferir` (origem, entidade, prioridade, `CodCarrinhoPercurso`). SQL: `expedicao.conferir.consulta.sql`.

### `carrinho.conferir.consulta`

Carrinhos ligados à conferência (código de barras, estágio, totais a conferir/conferidos). O coletor só aceita leitura de carrinho que exista nesta lista.

SQL: `expedicao.carrinho.conferir.consulta.sql`. Índice de estágio atual: `IX_CarrinhoPercursoEstagio_CarrinhoAtual`.

### `conferir.item.consulta`

Itens a conferir. `ItemConferir` **não** tem `CodCarrinho`. A coluna vem do join:

`ItemCarrinhoPercurso` = `CarrinhoPercursoEstagio.Item` do estágio da **separação**, não do `CONFERINDO`.

A janela do carrinho **tem** que mandar `CodCarrinho` (`> 0`) no `Where` junto com `CodEmpresa` e `CodConferir`. Sem o campo o servidor responde `[INVALID_PAYLOAD] conferir.item.consulta exige CodCarrinho no Where.` Regra 14 em [regras](../expedicao/regras.md).

SQL: `expedicao.item.conferir.consulta.sql`. Índice: `IX_ItemConferir_Percurso` em `(CodEmpresa, CodCarrinhoPercurso, ItemCarrinhoPercurso)`.

### `conferir.item.unidade.medida.consulta`

Conversões do item a conferir. Sem `Pagination` do cliente, `KEEP_EVERY_UNIT_ROW`.

### `conferir.separacao.item.consulta`

Item da separação visto no contexto da conferência. SQL: `expedicao.conferir.separacao.item.consulta.sql`.

### `conferencia.item.consulta`

Scans (`ItemConferencia`). Exige `CodCarrinho` (`> 0`) no `Where`, igual ao item a conferir. Sem o campo: `[INVALID_PAYLOAD] conferencia.item.consulta exige CodCarrinho no Where.` Índice: `IX_ItemConferencia_Percurso`.

### `*.select`

Tabela física. `conferir.item.select` **não** devolve `CodCarrinho`.

## Mutação

`conferir.insert|update|delete`, `conferir.item.*`, `conferencia.item.*`.

`conferir.insert` exige `CodEmpresa`, `Origem` e `CodOrigem`. Origem já ativa (não cancelada) responde `[50016] Ja existe conferencia ativa para esta origem. Nao e permitido gerar outra.` — o mesmo texto do índice `UX_Conferir_OrigemAtiva` e da trigger `04`. Delete de conferir/separar carrega o snapshot da consulta **antes** de apagar e emite esse snapshot no `*.delete.listen`.

## Listen

`conferir.insert|update|delete.listen`, `conferir.item.*` e `conferencia.item.*` saem só de mutação Socket.IO (e `PUT /expedicao/conferir/notify` emite `conferir.update.listen`). Não existe `conferir.consulta.listen`.

A trigger 02 cria `Conferir` no SQL ao fechar a separação. **Não** emite `conferir.insert.listen` nem `conferir.item.insert.listen`. A lista precisa de `conferir.consulta` de novo. Catálogo: [listen](./listen.md).

Scan (`conferencia.item.insert/update/delete`) emite também `conferir.item.update.listen`, para a quantidade conferida atualizar na tela. `conferencia.item.update` em lote (salvar carrinho na conferência) segue o mesmo refresh: chave do estágio quando o lote é homogêneo; senão `consultaAny` fatiado. [Where](../contratos/where.md). Insert de scan exige `CodEmpresa`, `CodConferir`, `CodCarrinhoPercurso`, `ItemCarrinhoPercurso` e `CodProduto`; recusa se o estágio não devolver `CodCarrinho`. No refresh, estágio sumido **não** consulta `CodCarrinho = 0`.

Abrir estágio `CO` / `CONFERINDO` é `carrinho.percurso.estagio.insert`, não `conferir.insert`. Sem `ItemConferir` no carrinho a base deve recusar com `[50014]`. O insert do estágio usa `OUTPUT … INTO` para conviver com a trigger `06` (SQL 334). [Erros](../expedicao/erros.md).

Lista vazia em `conferir.item.consulta` **não** significa conferência completa.
