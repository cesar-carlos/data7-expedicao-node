# Expedição

Regras de domínio para não misturar o que este servidor faz com o que o coletor Flutter e as triggers do SQL Server fazem.

Leia nesta ordem:

1. [Regras](./regras.md) — invariantes. Se uma alteração quebrar uma delas, o bug volta.
2. [Situações](./situacoes.md) — `SP` não é `SEPARADO`. Item e carrinho usam alfabetos diferentes.
3. [Separação → conferência](./fluxo-separacao-conferencia.md) — quem cria `Conferir`, como o item se liga ao carrinho.
4. [Triggers](./triggers.md) — fechamento da separação, geração da conferência e bloqueios (`THROW`).
5. [Erros](./erros.md) — prefixo `[50014]` / `[SQL-208]` no Socket.IO, HTTP e coletor.
6. [Índices](./indices.md) — `WHERE` dos Flutter e scripts `07`/`08`/`09` na `Estacao`.

Paginação e envelope: [contratos](../contratos/README.md). Catálogo dos eventos Socket.IO (`separar.consulta`, `conferir.item.consulta`, …): [socket](../socket/README.md). Como o cliente fala com o processo: [comunicação](../comunicacao.md).

## Quem faz o quê

| Peça | Caminho | Papel |
| --- | --- | --- |
| Este servidor | `d:\Developer\Node\data7-api-pix Campo` | Socket.IO/HTTP, SQL de consulta/gravação, paginação, classificação de erro (`[50014] …`). **Não** cria `Expedicao.Conferir` a partir da separação. |
| Coletor desktop | `D:\Developer\Data7\Expedicao\Flutter\app_expedicao` | Separar e conferir na tela. `addConferir` está comentado. |
| Coletor `exp` | `D:\Developer\Data7\Expedicao\Flutter\app\exp` | Mesmo contrato Socket.IO. Login/usuários por HTTP. |
| Triggers | `D:\Developer\Data7\Expedicao\trigger & procedure` | Fecham a separação e geram a conferência. |
| Correção SQL | `D:\Developer\Data7\Expedicao\Expedicao Correcoes` | Triggers, índice único, índices de consulta (`WHERE` dos Flutter) e `THROW` 50011–50016. Ainda não aplicados na `Estacao`. |

Os dois Flutter consomem este servidor. Mudança de contrato Socket.IO quebra os dois.

## Tabelas centrais

| Tabela | Documento |
| --- | --- |
| `Expedicao.SepararEstoque` / `ItemSepararEstoque` | O que precisa ser separado |
| `Expedicao.ItemSeparacaoEstoque` | O que já foi para o carrinho |
| `Expedicao.CarrinhoPercurso` | Cabeçalho do percurso (`SE` + `CodSepararEstoque`) |
| `Expedicao.CarrinhoPercursoEstagio` | Cada passagem do carrinho (`SE` ou `CO`) |
| `Expedicao.Conferir` / `ItemConferir` | Snapshot para o conferente |
| `Expedicao.ItemConferencia` | Scan do conferente |

O mesmo `CodCarrinhoPercurso` serve separação e conferência. A origem muda no **estágio**, não no cabeçalho.

## O que já foi aplicado neste repositório

- Socket.IO e HTTP classificam falha em `classifyClientError`. O cliente recebe `[identificador] mensagem`. Detalhe em [Erros](./erros.md).
- `THROW` 50011–50099 (e o índice `UX_Conferir_OrigemAtiva`) viram `BUSINESS_RULE_VIOLATION`.
- Testes em `test/src/utils/repository.error.test.ts` e `test/src/aplication/app.express.error.test.ts`.

Nos coletores:

- `conferir.item.consulta` e `conferencia.item.consulta` **exigem** `CodCarrinho` no `Where` (`[INVALID_PAYLOAD]` se faltar).
- Lista vazia de item a conferir **não** conta como conferência completa.
- Desktop (`app_expedicao`): `AppError.fromSocket` / `AppError.display` mostram o texto prefixado, sem dump `AppError{...}`.
- `exp`: `SocketRequestHelper` lê `Error` e relança `DataError`. O prefixo `[50014]` chega na mensagem.

A base `Estacao` recebeu o `RODAR.sql` e os ajustes das triggers (2026-11-12). Volta: `Rollback\RODAR-ROLLBACK.sql`. Detalhe: `LEIA-ME.md`. Triggers: `LEIA-ME-triggers-conferir.md` (`02 -` grava `Conferir` + `ConferirResumo` + `ItemConferir`; `06 -` exige `OUTPUT … INTO` no Node). Índices de `WHERE`: [Índices](./indices.md) (`07 -` drop do filtro em `Produto` se o FireDAC der 1934, `08 -` diagnóstico, `09 -` criação). Sem as triggers o `[50014]` não existe na base.
