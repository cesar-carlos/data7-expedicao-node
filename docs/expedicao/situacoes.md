# Situações

Há dois alfabetos. Não traduzir um pelo outro.

## Item (`ItemSeparacaoEstoque`, `ItemConferencia`)

Código curto na coluna `Situacao`:

| Código | Significado | Quando |
| --- | --- | --- |
| `SP` | Separado | Scan/gravação do item no carrinho |
| `FN` | Finalizado | Carrinho salvo |
| `CA` | Cancelado | Item ou carrinho cancelado |
| `CO` | Conferido | Item da conferência (não confundir com origem `CO`) |
| `PE` | Pendente | |
| `PA` | Pausado | |
| `RE` | Reiniciado | |

Fonte no coletor: `ExpedicaoItemSituacaoModel`.

## Carrinho, percurso e documento

Texto longo:

| Valor | Onde aparece |
| --- | --- |
| `EM SEPARACAO` | Percurso / `SepararEstoque` em andamento |
| `SEPARANDO` | Estágio de carrinho aberto na separação |
| `SEPARADO` | Carrinho salvo, ou documento/percurso fechado |
| `CANCELADA` | Estágio ou documento cancelado |
| `AGUARDANDO` | `Conferir` recém-criado, ainda sem conferente |
| `EM CONFERENCIA` | Documento de conferência em andamento |
| `CONFERINDO` | Estágio de carrinho aberto na conferência |
| `CONFERIDO` | Carrinho ou documento conferido |
| `AGRUPADO` | Carrinho agrupado |

Origem do estágio:

| Código | Significado | `CodOrigem` |
| --- | --- | --- |
| `SE` | Separação | `CodSepararEstoque` |
| `CO` | Conferência | `CodConferir` |

`CO` como origem do estágio não é a situação `CO` do item.

## Trigger 02

Copia para `ItemConferir` só item com `Situacao IN ('FN', 'SP')`. `CA` fica de fora.

O vínculo gravado é o item do estágio **SE** (`00005`), não o estágio **CO** que o conferente abre depois (`00010`).
