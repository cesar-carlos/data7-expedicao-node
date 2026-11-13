# Expedição

Regras de domínio para não misturar o que este servidor faz com o que o coletor Flutter e as triggers do SQL Server fazem.

Leia nesta ordem:

1. [Regras](./regras.md) — invariantes. Se uma alteração quebrar uma delas, o bug volta.
2. [Situações](./situacoes.md) — `SP` não é `SEPARADO`. Item e carrinho usam alfabetos diferentes.
3. [Separação → conferência](./fluxo-separacao-conferencia.md) — quem cria `Conferir`, como o item se liga ao carrinho.
4. [Triggers](./triggers.md) — fechamento da separação, geração da conferência e bloqueios (`THROW`).
5. [Erros](./erros.md) — prefixo `[50014]` / `[SQL-208]` no Socket.IO, HTTP e coletor. Warn de SQL cru no `Where` **não** é um desses prefixos.
6. [Índices](./indices.md) — `WHERE` dos Flutter e scripts `07`/`08`/`09` na `Estacao`.

Paginação e envelope: [contratos](../contratos/README.md). Catálogo dos eventos Socket.IO (`separar.consulta`, `conferir.item.consulta`, …): [socket](../socket/README.md). Como o cliente fala com o processo: [comunicação](../comunicacao.md).

## Quem faz o quê

| Peça | Caminho | Papel |
| --- | --- | --- |
| Este servidor | `d:\Developer\Node\data7-api-pix Campo` | Socket.IO/HTTP, SQL de consulta/gravação, paginação, classificação de erro (`[50014] …`). **Não** cria `Expedicao.Conferir` a partir da separação. |
| Coletor desktop | `D:\Developer\Data7\Expedicao\Flutter\app_expedicao` | Separar e conferir na tela. `addConferir` está comentado. |
| Coletor `exp` | `D:\Developer\Data7\Expedicao\Flutter\app\exp` | Mesmo contrato Socket.IO. Login/usuários por HTTP. |
| Triggers | `D:\Developer\Data7\Expedicao\trigger & procedure` | Fecham a separação e geram a conferência. |
| Correção SQL | `D:\Developer\Data7\Expedicao\Expedicao Correcoes` | Triggers, remoção do índice único filtrado, índices de consulta e `THROW` 50011–50016. Aplicação registrada em 2026-11-12; [triggers](./triggers.md). |

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

- `separar.consulta` agrega setor/usuário em `OUTER APPLY` **depois** da página (`OFFSET/FETCH`), para a lista não varrer `ItemSepararEstoque` nem segurar lock longo. [Separar](../socket/separar.md). Regra 25 em [Regras](./regras.md).
- Lista: `LIKE` de setor/data reescrito (não recusado), dedup de `*.consulta` por socket (todos os `ResponseIn`), `SET LOCK_TIMEOUT` no `SELECT`, cancel da request no timeout do Node. Regra 26.
- Canal `servidor.emergencia.listen` para aviso direto ao coletor. Desktop já escuta; `exp` ainda não. Desconexão automática por lock **ainda não**. Regra 27. Guia: [proteções](../socket/protecoes-cliente.md). Plano: [feature](../feature/protecao-base-e-emergencia.md).
- Socket.IO e HTTP classificam falha em `classifyClientError`. O cliente recebe `[identificador] mensagem`. Detalhe em [Erros](./erros.md).
- `THROW` 50011–50099 viram `BUSINESS_RULE_VIOLATION`.
- Testes em `test/src/utils/repository.error.test.ts` e `test/src/aplication/app.express.error.test.ts`.

Nos coletores:

- `conferir.item.consulta` e `conferencia.item.consulta` **exigem** `CodCarrinho` no `Where` (`[INVALID_PAYLOAD]` se faltar).
- Lista vazia de item a conferir **não** conta como conferência completa.
- Desktop (`app_expedicao`): `AppError.fromSocket` / `AppError.display` mostram o texto prefixado, sem dump `AppError{...}`.
- `exp`: `SocketRequestHelper` lê `Error` e relança `DataError`. O prefixo `[50014]` chega na mensagem. Lista de separar manda `CodSetorEstoque =` e intervalo de `DataEmissao`; aplica o `Data` de `separar.consulta.listen` sem nova consulta no mesmo tick. Falta o listener global de `servidor.emergencia.listen`.

A base `Estacao` recebeu o `RODAR.sql` e os ajustes das triggers (2026-11-12). Volta: `Rollback\RODAR-ROLLBACK.sql`. Detalhe: `LEIA-ME.md`. Triggers: `LEIA-ME-triggers-conferir.md` (`02 -` grava `Conferir` + `ConferirResumo` + `ItemConferir`; `06 -` exige `OUTPUT … INTO` no Node). Índices de `WHERE`: [Índices](./indices.md) (`07 -` drop do filtro em `Produto` se o FireDAC der 1934, `08 -` diagnóstico, `09 -` criação). Sem as triggers o `[50014]` não existe na base.
