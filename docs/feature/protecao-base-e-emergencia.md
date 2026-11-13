# Plano: proteção da base, canal de emergência e disconnect

**Estado:** Fase 0 entregue no Node (`main`, 2026-11-13). O restante é trabalho futuro.  
**Base:** SQL Server (`Estacao`). Expedição **não** roda em Sybase. SSMS é só a ferramenta de administração.  
**Clientes:** `app_expedicao` e `exp` — o mesmo Socket.IO. Mudança de envelope quebra os dois.  
**Coletores em 2026-11-13 (agente Flutter):** desktop já escuta `servidor.emergencia.listen`. `exp` já manda `Where` indexável e consome o listen periódico; **falta** o listener de emergência.

Este plano não substitui as regras de domínio. Antes de alterar consulta, lock ou listen: [regras](../expedicao/regras.md) 25–27, [proteções do coletor](../socket/protecoes-cliente.md), [listen](../socket/listen.md), [índices](../expedicao/indices.md).

---

## 1. Objetivo

Um aplicativo de expedição **não pode derrubar nem travar** a `Estacao` enquanto o ERP e vários coletores consultam e gravam. Ao mesmo tempo, o conferente no carrinho **não pode perder o socket** por falso positivo.

Objetivos, em ordem:

1. Listas baratas e com lock curto (já em grande parte).
2. Aviso direto do servidor ao coletor **antes** de qualquer corte de sessão.
3. Operador consegue avisar / desconectar um socket sem código novo.
4. Kick automático **só** se o sinal for inequívoco. Na dúvida, falha a **consulta**, não a **conexão**.

Fora de objetivo nesta feature:

- Autenticar o handshake (quebraria o coletor publicado).
- Recusar `LIKE` / string SQL / cortar `LIMIT` explícito sem migração dos dois Flutter.
- Unificar famílias de `*.listen`.
- Polling contínuo de DMV (`sys.dm_tran_locks`) no caminho quente.

---

## 2. Problema levantado

Sintoma original: `separar.consulta` lenta, timeout de 30 s, lock compartilhado enquanto o ERP grava. Causas identificadas:

| Causa | Efeito na `Estacao` |
| --- | --- |
| `STRING_AGG` de setor/usuário **antes** do `OFFSET/FETCH` | Varre `ItemSepararEstoque`, estoura `SQL_REQUEST_TIMEOUT_MS`, segura lock |
| `LIKE '%id%'` em `CodSetoresEstoque` (`STRING_AGG`) | Não usa índice |
| `LIKE 'yyyy-MM-dd%'` em `DataEmissao` (`DATE`) | Conversão, índice ignorado |
| Dois `separar.consulta` iguais no mesmo socket (tela + timer) | SQL duplicado |
| Request Node que estoura 30 s **sem** `cancel()` | Worker e lock ficam no SQL Server |
| Pool compartilhado (máx. 20) | Um cliente barulhento disputa slot com todos |

O coletor publicado **não pode** ser recusado: build **antigo** do `exp` ainda pode mandar esses `LIKE` (o servidor reescreve); o `exp` **atual** já manda `CodSetorEstoque =` e intervalo de `DataEmissao` em lista `{ key, value }`; `Where` string SQL legado ainda existe; handshake sem token; `LIMIT` explícito é respeitado (regra 12 e 26).

---

## 3. O que já está no servidor (Fase 0) — não refazer

| Item | Onde | Cliente vê |
| --- | --- | --- |
| Página **antes** do `STRING_AGG` | `expedicao.separar.consulta.sql`, regra 25 | A mesma lista, mais barata |
| Reescrita de `LIKE` setor/data → `EXISTS` / intervalo | `separar.consulta.where.ts` | Mesmo `Data`; **não** `[INVALID_PAYLOAD]` |
| Dedup de `*.consulta` no mesmo socket | `socket.query.dedupe.ts` | Os dois `ResponseIn` recebem o mesmo `Data` |
| `SET LOCK_TIMEOUT` só no `SELECT` (padrão 5 s) | `consulta.sql.helper.ts`, `SQL_LOCK_TIMEOUT_MS` | `[SQL-1222]` se o ERP estiver gravando |
| Reset `SET LOCK_TIMEOUT -1` nas demais requests | `connection.sql.server.mssql.ts` | Mutação não herda os 5 s |
| `request.cancel()` no timeout do Node | mesmo arquivo | Continua `[SQL-CONN]` |
| Canal `servidor.emergencia.listen` | `servidor.emergencia.ts` + service | Só quem escuta |
| HTTP loopback `POST /internal/sockets/emergencia` | monitor | 204; coletor **não** chama |

Custo de desempenho da Fase 0: irrelevante ou positivo. Extra por request: `SET LOCK_TIMEOUT -1` no mesmo batch. O canal de emergência **não** roda no caminho de consulta.

Contrato de aviso: `{ Data: [ { Nivel, Codigo, Mensagem, Acao, PrazoMs, EmitidoEm } ] }`, **sem `Session`**. `allEvent: true` no Flutter. Código: `src/socket/protocol/servidor.emergencia.ts`.

---

## 4. Levantamentos que travam o kick automático

Estes pontos são a razão de a Fase 4 estar **bloqueada**. Não ignorar na implementação futura.

### 4.1 Pool compartilhado

`ConnectionSqlServerMssql` é um pool. O SPID que atende o coletor A no instante seguinte atende o B. **Não há sessão SQL por `socket.id`.**

Consequência: consultar `sys.dm_tran_locks` / `sys.dm_exec_requests` **não** aponta o aparelho. Para mapear seria preciso marcar cada request (`SET CONTEXT_INFO`, comentário com `socket.id`) e ainda assim correlacionar no tempo — fura o modelo atual do pool e a sonda pode ela mesma travar.

### 4.2 `[SQL-1222]` é a vítima, não o vilão

`SET LOCK_TIMEOUT` faz a **lista desistir**. Quem recebe `[SQL-1222]` está sendo bloqueado (em geral pelo ERP), não está segurando lock. Kickar por 1222 expulsa o conferente que **espera** o ERP.

### 4.3 Timeout 30 s já cancela

`[SQL-CONN]` depois de 30 s já dispara `request.cancel()`. O SQL solta worker. Desconectar o socket **além** disso não libera a base mais rápido; só derruba a UI.

### 4.4 Falso positivo = experiência ruim

Kick errado: conferente no meio do carrinho, socket cai, tela some, app reconecta em loop, scans e consultas se repetem. Isso é **pior** que um erro de lista. Preferir falhar o `SELECT` e deixar o socket vivo.

### 4.5 Cliente que não escuta o canal

O desktop já escuta. O `exp` ainda não. Disconnect automático no `exp` aparece só como “caiu a conexão”. O aviso só vale nos dois depois da Fase 1 completa.

### 4.6 Várias pessoas na mesma `CodSepararEstoque` é o modo normal

Regra 11. Muitas consultas simultâneas **não** são abuso. Heurística de “N queries em voo” tem de distinguir timer de listen + tela (já deduplicado) de martelamento.

---

## 5. Riscos

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| Falso positivo no kick | Usuário perde sessão no picking | Fase 4 bloqueada; critério estreito; aviso + `PrazoMs`; não reconectar em loop no cliente |
| Recusar `LIKE` / SQL `Where` | `exp` antigo quebra a lista | Shim permanente até os dois apps mandarem igualdade; regra 26 |
| Token no handshake | Nenhum coletor conecta | Só com flag e cliente novo mandando token; default continua aberto |
| Cortar `LIMIT` explícito | Grade incompleta | Só depois de paginação real nos dois apps |
| Subir `SQL_REQUEST_TIMEOUT_MS` | Lock mais longo | Proibido como “correção” de lista lenta (regra 25) |
| DMV em loop | Carga extra na `Estacao` | Não fazer no caminho quente |
| `READ_COMMITTED_SNAPSHOT` sem DBA | Snapshot / tempdb | Só DBA; janela; medir `tempdb` |
| Broadcast `Acao=desconectar` sem `SocketId` | Derruba **todos** os coletores | HTTP de emergência exige confirmação consciente; default é um `SocketId` |
| Reconnect agressivo no Flutter | Anula o kick e martela de novo | Fase 1: backoff / ação do usuário |
| Unificar payload de listen | Quebra desktop e `exp` | Canal novo usa só `{ Data }`; não mexer nos outros |
| Mutação com `LOCK_TIMEOUT` 5 s | Insert/update aborta cedo demais | Já resetado com `-1` fora de lista; não reaplicar timeout curto em gravação |

---

## 6. Cuidados obrigatórios (invariantes)

1. **Consulta falha, conexão permanece** — salvo Fase 4 aprovada e aviso prévio no canal.
2. **Não recusar** payload publicado: `LIKE` setor/data, string SQL no `Where`, `LIMIT` explícito, handshake sem token.
3. **Não** exigir token no Socket.IO nesta feature.
4. **Não** prefixar `socket.id` em `servidor.emergencia.listen`.
5. **Não** mandar `Session` nesse canal (o coletor ignora evento com `Session == socket.id` se `allEvent` for false).
6. HTTP de emergência **só loopback** (`requireLoopback`). Coletor não chama.
7. `PrazoMs` máximo 60 s (já no schema). Não desconectar em 0 sem o cliente ter tempo de pintar a mensagem, salvo manutenção anunciada.
8. Dois Flutter. Testar os dois, ou no mínimo o contrato com `allEvent: true`.
9. Testes de regressão das Fases 0 ficam. Não “simplificar” o shim de `LIKE` recusando o pedido.
10. Logs sem senha, sem corpo SQL interpolado completo com credencial. `socketId` + código do aviso bastam.
11. Expedição = SQL Server. Não criar caminho Sybase/Firebird.
12. Trigger 02 **não** emite `conferir.insert.listen`. Não “consertar” isso neste plano.

---

## 7. Fases de implementação (futuro)

Cada fase é um PR separado. Não juntar kick automático com recusa de `LIKE`.

### Fase 1 — Coletores escutam o canal (obrigatória antes de qualquer kick)

**Onde:** Flutter, não este repo. Desktop (`app_expedicao`) **já** escuta. `exp` **ainda deve** registrar.

- Listener global na conexão: `servidor.emergencia.listen`, `allEvent: true`.
- UI para `Mensagem` (`AppError.display` / `DataError`, sem dump).
- Se `Acao=desconectar`: parar `*.consulta` e mutação, cancelar timer de resync, **não** reconectar em loop, tela “servidor encerrou a sessão”.
- Checklist: [proteções-cliente](../socket/protecoes-cliente.md).

**Pronto quando:** os dois apps publicados (ou um canal de teste) mostram o aviso de `POST /internal/sockets/emergencia` com `SocketId` e com broadcast. Sem o `exp`, kick automático continua proibido.

**Risco se pular:** kick futuro = conexão que “caiu do nada”.

### Fase 2 — DBA: `READ_COMMITTED_SNAPSHOT` na `Estacao`

**Onde:** SQL Server, não o Node. Não muda JSON.

- DBA avalia `tempdb`, versão do motor, janela.
- Objetivo: `SELECT` de lista não bloquear `UPDATE` do ERP (reduz `[SQL-1222]` legítimo).
- Rollback documentado com o DBA.

**Pronto quando:** ERP grava `Conferir` / `Produto` enquanto coletores listam, sem fila longa de lock. FireDAC `ANSI_WARNINGS OFF` continua sendo o problema dos índices filtrados — RCSI **não** substitui o script `07`.

### Fase 3 — Higiene no coletor (sem breaking no servidor)

O `exp` atual **já** cumpre: `CodSetorEstoque =`, intervalo de `DataEmissao`, `buildWhereParams()`, aplica o `Data` de `separar.consulta.listen`, não retenta `[SQL-CONN]`. Não voltar ao `LIKE`.

Ainda vale para build antigo em campo e para o desktop se filtrar lista:

- `CodSetorEstoque =` e data por igualdade/intervalo.
- `Where` lista `{ key, value }`.
- Não disparar `separar.consulta` no tick de `separar.consulta.listen`.
- Não relançar `[SQL-CONN]` em loop imediato.

O servidor **não** recusa o modo antigo (shim do `LIKE`) enquanto houver build velho em campo.

### Fase 4 — Kick automático (bloqueada)

Só abrir esta fase com **decisão explícita** e Fase 1 nos dois clientes.

**Não usar como gatilho:** um `[SQL-1222]`, um `[SQL-CONN]`, um evento `slow`, pool cheio, várias pessoas na mesma separação.

**Gatilho candidato (ainda a calibrar, não implementar agora):**

- Mesmo `socket.id` com **N** requests SQL **distintas** em voo (não o dedup) por T segundos, **e**
- ocupação do pool acima de um piso, **e**
- não é o timer `separar.consulta.listen` sozinho.

Fluxo obrigatório se um dia ligar:

1. Emitir `servidor.emergencia.listen` no **mesmo** socket (`Nivel=desconectar`, `Acao=desconectar`, `PrazoMs` ≥ 5 s).
2. Cancelar SQL em voo daquele socket (`cancelSocketSqlRequests`) no disconnect — já existe no `disconnect`.
3. `socket.disconnect(true)` só depois do prazo.
4. Flag de ambiente **desligada** por padrão (`SQL_AUTO_KICK=0` ou equivalente).
5. Log: `socketId`, contagens, gatilho, **não** kick silencioso.
6. Teste de falso positivo: um `separar.consulta` lento + listen periódico **não** dispara.

**Alternativa preferida enquanto a Fase 4 estiver bloqueada:** operador vê `/internal/sockets`, escolhe o `socketId`, `POST /internal/sockets/emergencia`. Manual, sem falso positivo de código.

### Fase 5 — Breaking opt-in (só com migração)

Depois dos coletores novos em campo, **um** item por vez, com flag e rollback:

| Item | Quebra se ligar cedo |
| --- | --- |
| Recusar `LIKE` não coberto pelo shim | Lista `exp` |
| Recusar string SQL no `Where` | `QueryBuilder.buildSqlWhere()` |
| Teto rígido de `LIMIT` explícito | Página menor |
| Token no handshake | Conexão recusada |
| Rate limit com erro (não fila) | Pedidos extras falham |

Default continua compatível (regra 26). Cliente novo pode mandar token **sem** o servidor exigir.

Transação SQL opt-in (`transacao: true`) é outro plano: regra 16–17, autocommit permanece para o cliente antigo.

---

## 8. Sequência recomendada

```text
Fase 0  (feita)     Node: shim, dedup, LOCK_TIMEOUT, cancel, canal, HTTP
        │
Fase 1              Flutter: escutar servidor.emergencia.listen
        │
Fase 2              DBA: avaliar RCSI na Estacao
        │
Fase 3              Coletor: Where indexável, não martelar consulta
        │
Fase 4              Só se abuso real persistir E Fase 1 ok
                    default OFF, gatilho estreito, aviso antes do disconnect
        │
Fase 5              Breaking só com versão mínima em campo
```

Não inverter 4 e 1. Não juntar 4 e 5.

---

## 9. Critérios de aceite por fase

**Fase 0 (já):** testes em `separar.consulta.where`, `socket.query.dedupe`, `consulta.sql.helper` (`SET LOCK_TIMEOUT`), `connection.sql.server.mssql` (reset + cancel), `servidor.emergencia` (payload, unicast, disconnect após prazo, HTTP 204/404). `tsc --noEmit` limpo.

**Fase 1:** POST loopback com `SocketId` mostra diálogo nos dois apps; `Acao=nenhuma` **não** cai o socket; `Acao=desconectar` mostra prazo e só então cai; reconnect não entra em loop.

**Fase 2:** DBA assina; ERP e lista convivem; rollback testado em homologação.

**Fase 4 (se existir):** flag off = comportamento da Fase 0; flag on + 1 timeout ≠ kick; flag on + critério pleno = aviso depois disconnect; dois coletores na mesma `CodSepararEstoque` não se expulsam.

---

## 10. Rollback

| Camada | Como voltar |
| --- | --- |
| Node Fase 0 | Reverter o commit da proteção. `SQL_LOCK_TIMEOUT_MS=0` desliga só o timeout de lista, sem tirar o shim. |
| Canal emergência | Cliente antigo já ignora o evento. Remover o HTTP não quebra Flutter. |
| Fase 4 | Flag off. Não precisa redeploy do coletor se o listener só mostra aviso. |
| RCSI | DBA; não é este repositório. |
| Breaking Fase 5 | Flag / revert. Cliente antigo tem de continuar no ar. |

---

## 11. Decisões já tomadas

1. Proteções que **não** quebram cliente: aplicadas (Fase 0).
2. Proteções que quebram: **não** aplicadas.
3. Canal de emergência: aplicado no Node; listener Flutter pendente.
4. Kick automático: **não** aplicar agora. Risco principal = falso positivo e experiência.
5. Operador manual via loopback: caminho oficial para desconectar alguém.
6. Expedição só SQL Server.

Qualquer implementação futura deste plano começa relendo esta seção e a §4. Se o kick automático voltar à mesa, o critério tem de sobreviver a: ERP lento, duas telas + listen, pool cheio, e `[SQL-1222]` isolado. Se não sobreviver, não liga.
