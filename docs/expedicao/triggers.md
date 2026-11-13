# Triggers de separação → conferência

Originais na `Estacao` (fonte): `Expedicao.tr_ExpedicaoCarrinhoPercursoConferir` e `Expedicao.tr_ExpedicaoCarrinhoPercursoEstagioConferir`.

Os arquivos em `trigger & procedure\10` e `11` **não** são essa versão. O `10` não grava `Expedicao.ConferirResumo` (grade do ERP).

Correção aplicada na `Estacao` (RODAR.sql + ajustes de 2026-11-12). Volta: `Rollback\RODAR-ROLLBACK.sql`.

`D:\Developer\Data7\Expedicao\Expedicao Correcoes\RODAR.sql` (F5 no SSMS).

Volta de emergência (snapshot da `Estacao` antes de aplicar): `Rollback\RODAR-ROLLBACK.sql`.

| Ordem | Arquivo |
| --- | --- |
| — | `RODAR.sql` — pacote único (00, 01, 02, 02a, 03a, 03b, 03, 04, 05, 06, 07, 08, 09) |
| 0 | `00 - diagnostico-conferir.sql` (somente leitura) |
| 1 | `01 - tr_ExpedicaoCarrinhoPercursoEstagioConferir.sql` |
| 2 | `02 - tr_ExpedicaoCarrinhoPercursoConferir.sql` — `Conferir` + `ConferirResumo` + `ItemConferir` |
| 2a | `02a - preencher-conferir-resumo.sql` — histórico sem resumo |
| 3a | `03a - diagnostico-conferir-duplicadas.sql` (somente leitura) |
| 3b | `03b - cancelar-conferir-duplicadas.sql` — cancela extras da mesma origem |
| 3 | `03 - ux_Conferir_OrigemAtiva.sql` — DROP do UX filtrado (FireDAC 1934); unicidade na 04 |
| 4 | `04 - tr_ExpedicaoConferirOrigemUnica.sql` |
| 5 | `05 - tr_ExpedicaoItemConferirEstagio.sql` |
| 6 | `06 - tr_ExpedicaoCarrinhoPercursoEstagioConferirInicio.sql` |

O nome do arquivo é a ordem de execução. Detalhe e testes: `LEIA-ME.md` e `LEIA-ME-triggers-conferir.md`.

Triggers **não** emitem Socket.IO. O Node, no `carrinho.percurso.estagio.update` que dispara a 01, emite `separar.update.listen`. A 02 não gera `conferir.insert.listen`. [Listen](../socket/listen.md).

Índices de pesquisa (`WHERE` dos Flutter) são outro pacote: `07` / `08` / `09`. [Índices](./indices.md).

## Encadeamento

```text
UPDATE CarrinhoPercursoEstagio (SE → SEPARADO ou CANCELADA)
        │
        ▼
trigger 01  — se não há carrinho SE aberto e quantidade pendente <= 0
        │
        ▼
UPDATE CarrinhoPercurso → SEPARADO
        │
        ▼
trigger 02  — THROW 50011 se ainda há quantidade pendente
            — THROW 50012 se conferencia obrigatória sem item
        │
        ├─ INSERT Expedicao.Conferir (AGUARDANDO)  → trigger 04 (THROW 50016)
        ├─ INSERT Expedicao.ConferirResumo         → grade do ERP
        └─ INSERT Expedicao.ItemConferir           → trigger 05 (THROW 50013)

INSERT CarrinhoPercursoEstagio origem CO
        │
        ▼
trigger 06  — THROW 50014 se o carrinho não tem ItemConferir no estágio SE
```

Cancelar um estágio não basta para fechar a separação. No script `01` corrigido, a mudança para `CANCELADA` também inicia a avaliação: o fechamento só ocorre se não houver estágio `SE` aberto e a quantidade pendente for `<= 0`, desconsiderando itens dos estágios cancelados. Portanto, cancelar o último estágio aberto pode permitir o fechamento quando os demais carrinhos já atenderam a quantidade. A `01` não contém `THROW` próprio; as triggers encadeadas continuam validando suas regras.

## THROW

| Número | Quando |
| --- | --- |
| 50011 | Percurso `SE` vira `SEPARADO` com quantidade pendente |
| 50012 | Conferência obrigatória sem item em carrinho `SEPARADO` |
| 50013 | `ItemConferir` de conferência origem `SE` em estágio `CANCELADA`, `CO` ou inexistente |
| 50014 | Abrir estágio `CO` sem snapshot daquele carrinho |
| 50016 | Segunda conferência ativa da mesma origem |

Formato no cliente e no HTTP: [Erros](./erros.md). Este servidor mapeia 50011–50099 (e o índice `UX_Conferir_OrigemAtiva`) para `BUSINESS_RULE_VIOLATION`. O `Error` sai como `[50014] mensagem da trigger`.

## Versão original — o que quebra

| Ponto | Efeito |
| --- | --- |
| `SELECT @x = ... FROM inserted` | Update em lote processa uma linha só |
| Contagem de carrinho aberto sem `Origem = 'SE'` | Estágio `CO` no mesmo percurso interfere |
| Restante `= 0` no cancelamento | Snapshot com item ainda `SP` |
| `ItemConferir` sem join no estágio | Copia item de carrinho `CANCELADA` |
| Insert do cabeçalho antes dos itens | Conferência vazia; impede recópia |
| `02` sem `INSERT ConferirResumo` | Grade do ERP sem cliente/carrinho |
| Qualquer UPDATE do estágio SE | Pode fechar a separação sem mudança de situação |

## Versão corrigida — regras

Trigger 01 só fecha se o estágio `SE` **mudou** para `SEPARADO` ou `CANCELADA`, o percurso está `EM SEPARACAO`, não há carrinho `SE` aberto e a quantidade pendente é `<= 0` (só `FN`/`SP` em `SEPARADO`/`AGRUPADO`). Cabeçalho travado com `UPDLOCK, HOLDLOCK`.

Trigger 02 só gera conferência se o percurso `SE` **passou a** `SEPARADO`, `FazerConferencia = S`, não existe `Conferir` ativo e existe item copiável. `50012` dispara antes do `50011` quando a conferência é obrigatória, há quantidade na lista e não há item em carrinho `SEPARADO`/`AGRUPADO`. Grava `ConferirResumo` (`CodCarrinhos` de estágio `SE` `SEPARADO`/`AGRUPADO`) e, se `FazerArmazenamento = S`, `Armazenar` (Observacao truncada; local via `APPLY`). Triggers 01/02/04/05/06 ficam com `ANSI_WARNINGS ON`. Não há índice filtrado em `Expedicao.Conferir` (FireDAC 1934 / Local Erro 886); o script `03` dropa `UX_Conferir_OrigemAtiva` se existir. Unicidade ativa é a trigger `04`. O insert de estágio do Node usa `OUTPUT … INTO` para conviver com a trigger 06 (SQL 334). `ItemArmazenar` na `Estacao` já tem `tr_ItemArmazenar` (`AFTER INSERT`): o insert do Node também usa `OUTPUT … INTO`. A 06 também recusa estágio `CO` se `Conferir` estiver `CANCELADA`.

## O que não muda

- `ItemCarrinhoPercurso` no snapshot continua sendo o item da separação.
- Este servidor Node não substitui essas triggers.
- Processos Data7 (embalagem, entrega balcão, prioridade) inserem `Conferir` por outro caminho.
