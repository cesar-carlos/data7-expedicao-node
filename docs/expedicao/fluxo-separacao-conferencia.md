# Separação → conferência

## Sequência feliz

1. Coletores separam em carrinhos (`ItemSeparacaoEstoque` nasce `SP`).
2. Ao salvar o carrinho, os itens daquele estágio viram `FN` e o estágio `SE` vira `SEPARADO`.
3. Quando não resta quantidade pendente nem carrinho `SE` aberto, a trigger 01 marca `SepararEstoque` e `CarrinhoPercurso` como `SEPARADO`.
4. Esse `UPDATE` no percurso dispara a trigger 02: cria `Conferir` em `AGUARDANDO` e copia item `FN`/`SP` de estágio `SEPARADO`/`AGRUPADO`.
5. O conferente lê o código do carrinho. O Flutter só aceita carrinho que exista em `carrinho.conferir.consulta`.
6. O Flutter insere estágio novo `CO` / `CONFERINDO` no **mesmo** `CodCarrinhoPercurso`, com `CodOrigem = CodConferir`. Sem `ItemConferir` daquele carrinho a base recusa; o snackbar mostra `[50014] Carrinho sem itens para conferir…` ([Erros](./erros.md)).
7. A janela de conferência lista `ItemConferir` com `CodCarrinho` no `WHERE`, pelo join com o estágio **SE**.
8. Cada scan grava `ItemConferencia` com `ItemCarrinhoPercurso` do estágio **CO**.
9. F12 exige `ItemConferencia` daquele carrinho. Sem scan, a mensagem é `Carrinho não conferido!`.

```text
SepararEstoque 290369
        │
        ▼
CarrinhoPercurso 289054   origem SE
        │
        ├─ estágio 00001 SE  CANCELADA   carrinho 94
        ├─ estágio 00005 SE  SEPARADO    carrinho 94   ← ItemConferir aponta aqui
        ├─ estágio 00006 SE  SEPARADO    carrinho 706
        └─ estágio 00010 CO  CONFERINDO  carrinho 94   ← conferente abriu; não é o vínculo do item
```

## O que este servidor faz nesse fluxo

- Consulta e grava estágio, item, conferir, conferência.
- Aplica página padrão 1500 em `conferir.item.consulta` se o cliente não mandar `LIMIT`. Contrato: [paginação](../contratos/paginacao.md).
- **Não** decide que a separação acabou.
- **Não** monta o snapshot `ItemConferir`.
- Depois do `carrinho.percurso.estagio.update` (Finalizar Carrinho) emite `separar.update.listen` com a `Situacao` já relida, mais `carrinho.percurso.update.listen` e `carrinho.percurso.estagio.update.listen`. [Listen](../socket/listen.md).
- **Não** emite `conferir.insert.listen` quando a trigger 02 cria `Conferir`. A lista de conferência consulta de novo.

SQL do join do item a conferir: `src/sql/expedicao/expedicao.item.conferir.consulta.sql`  
(`LEFT JOIN` estágio em `cpe.Item = ice.ItemCarrinhoPercurso`).

SQL da lista de carrinhos: `src/sql/expedicao/expedicao.carrinho.conferir.consulta.sql`  
(mesmo join, `INNER`, agrupado).

## Cancelar carrinho (hoje)

Dois round-trips autocommit no coletor:

1. Estágio → `CANCELADA` (trigger 01 roda aqui).
2. Itens → `CA`.

Se a trigger de fechamento antiga tratar o passo 1 como fechamento (`restante = 0` e nenhum carrinho aberto), a trigger 02 tira snapshot **antes** do `CA`. Conferência passa a existir. Carrinho novo (`00005`) separado depois **não** é copiado (`ExistConferencia > 0`).

A correção das triggers está em [Triggers](./triggers.md).

## Diagnóstico rápido

Para um `CodConferir` e um `CodCarrinhoPercurso` suspeitos:

```sql
SELECT ItemCarrinhoPercurso, COUNT(*) qtd, SUM(Quantidade) qty
FROM Expedicao.ItemConferir
WHERE CodConferir = @CodConferir
GROUP BY ItemCarrinhoPercurso;

SELECT ise.ItemCarrinhoPercurso, ise.Situacao, COUNT(*) qtd, SUM(ise.Quantidade) qty
FROM Expedicao.ItemSeparacaoEstoque ise
WHERE ise.CodCarrinhoPercurso = @CodCarrinhoPercurso
GROUP BY ise.ItemCarrinhoPercurso, ise.Situacao;

SELECT Item, Origem, CodOrigem, CodCarrinho, Situacao, DataInicio, HoraInicio
FROM Expedicao.CarrinhoPercursoEstagio
WHERE CodCarrinhoPercurso = @CodCarrinhoPercurso
ORDER BY Item;
```

- Item no estágio SE (`00005`) e `COUNT(*)` de `ItemConferir` alto → olhar paginação / filtro no cliente.
- Item só no estágio cancelado, ou nenhum do carrinho, com `00005` em `FN`/`SP` → snapshot da trigger cedo demais.
- `00005` sem `FN`/`SP` → carrinho `SEPARADO` sem item finalizado; a trigger 02 ignora de propósito.
