# Plano: proteção da base, canal de emergência e disconnect

**Estado verificado em 2026-11-13:** Fase 0 presente no código local, incluindo aviso e desconexão manual via HTTP loopback. A desconexão automática por carga/lock não está implementada. Revisão local não comprova deploy.

**Base:** SQL Server (`Estacao`). Expedição **não** roda em Sybase. SSMS é só a ferramenta de administração.  
**Clientes:** `app_expedicao` e `exp` — o mesmo Socket.IO. Mudança de envelope quebra os dois.  
**Registro externo dos coletores em 2026-11-13 (agente Flutter):** desktop já escuta `servidor.emergencia.listen`; `exp` ainda precisa desse listener. O registro informa lista `{ key, value }` nos dois e filtros indexáveis/consumo do listen periódico no `exp`. Esses repositórios e os builds publicados não foram revalidados nesta revisão. As referências abaixo à “fonte atual” e às pendências Flutter correspondem a esse registro.

**Escopo vigente:** preservar contratos públicos e comportamento esperado. As Fases 4 e 5 são propostas não autorizadas para implementação nesta revisão. Nomes de flags ou campos futuros abaixo não são opções disponíveis no servidor.

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
| Pool compartilhado (máximo padrão 20, configurável em `SQL_POOL_MAX`) | Um cliente barulhento disputa slot com todos |

O coletor publicado **não pode** ser recusado: build **antigo** do `exp` ainda pode mandar esses `LIKE` (o servidor reescreve); a fonte **atual** dos dois Flutter já manda lista `{ key, value }` (`exp`: `buildWhereParams()`; desktop: `buildWhereList()`), com `CodSetorEstoque =` e intervalo de `DataEmissao` no `exp`; `Where` string SQL legado ainda existe no fio de builds antigos (warn, não `Error`); handshake sem token; `LIMIT` explícito é respeitado (regra 12 e 26).

---

## 3. O que já está no servidor (Fase 0) — não refazer

| Item | Onde | Cliente vê |
| --- | --- | --- |
| Página **antes** do `STRING_AGG` | `expedicao.separar.consulta.sql`, regra 25 | A mesma lista, mais barata |
| Reescrita de `LIKE` setor/data → `EXISTS` / intervalo | `separar.consulta.where.ts` | Mesmo `Data`; **não** `[INVALID_PAYLOAD]` |
| Dedup de `*.consulta` simultâneas e idênticas no mesmo socket | `socket.query.dedupe.ts` | Cada `ResponseIn` recebe a resposta; em sucesso, o mesmo `Data` |
| `SET LOCK_TIMEOUT` só no `SELECT` (padrão 5 s) | `consulta.sql.helper.ts`, `SQL_LOCK_TIMEOUT_MS` | `[SQL-1222]` se o ERP estiver gravando |
| Reset `SET LOCK_TIMEOUT -1` nas demais requests | `connection.sql.server.mssql.ts` | Mutação não herda os 5 s |
| `request.cancel()` no timeout do Node | mesmo arquivo | Pedido do cliente recebe `[SQL-CONN]`; falha do timer fica no log e aplica backoff |
| Canal `servidor.emergencia.listen` | `servidor.emergencia.ts` + service | Só quem escuta |
| HTTP loopback `POST /internal/sockets/emergencia` | monitor | 204; coletor **não** chama |
| Desconexão manual após `PrazoMs` | `servidor.emergencia.service.ts` | Aviso seguido de `socket.disconnect(true)` quando `Acao=desconectar` |

A deduplicação usa evento, `Where`, paginação e ordenação enquanto o pedido está em voo. Não é cache: pedidos posteriores executam de novo. Não compartilha SQL entre sockets nem com o timer `SepararPeriodicListenService`. O timer apenas evita repetir broadcasts com payload idêntico — [escuta](../socket/escuta.md).

`SET LOCK_TIMEOUT -1` é acrescentado no mesmo batch das requests instrumentadas. O canal de emergência não roda no caminho de consulta. O ganho de desempenho deve ser medido; este plano não apresenta benchmark nem garante o plano de execução escolhido pelo SQL Server.

Contrato de aviso: `{ Data: [ { Nivel, Codigo, Mensagem, Acao, PrazoMs, EmitidoEm } ] }`, **sem `Session`**. `allEvent: true` no Flutter. Código: `src/socket/protocol/servidor.emergencia.ts`.

### Operação manual já disponível

`POST /internal/sockets/emergencia` usa `requireLoopback`, valida o corpo e responde 204 sem corpo. Endereço remoto fora do loopback recebe 404 vazio; um `SocketId` informado que não identifica um socket conectado recebe 404 `NOT_FOUND`. Corpo inválido recebe 400.

| Campo | Comportamento atual |
| --- | --- |
| `Nivel` | Obrigatório: `aviso`, `urgente` ou `desconectar` |
| `Mensagem` | Obrigatória, 1–500 caracteres após trim |
| `SocketId` | Opcional. Informado: um socket; omitido: broadcast. Não há alvo individual padrão nem confirmação adicional no endpoint |
| `Acao` | Opcional: `nenhuma` ou `desconectar`. Sem valor, `Nivel=desconectar` implica desconexão; os demais níveis implicam aviso. Valor explícito prevalece |
| `PrazoMs` | Opcional, inteiro de 0 a 60000. Padrão 5000 para desconexão e 0 para aviso |
| `Codigo` | Opcional, 1–64 caracteres após trim. Padrão conforme nível: `SERVIDOR_AVISO`, `SERVIDOR_MANUTENCAO`, `SERVIDOR_DESCONECTAR` |

`EmitidoEm` é gerado pelo servidor em ISO. O listen é JSON string. O sucesso HTTP confirma a emissão/agendamento, não o recebimento ou a exibição no coletor.

Um novo aviso para o mesmo alvo substitui o timer anterior; `Acao=nenhuma` cancela a desconexão pendente desse alvo. O timer de broadcast é separado dos timers individuais. No broadcast de desconexão, o servidor percorre os sockets conectados **quando o prazo vence**, inclusive os que entraram depois do aviso. Essas são características da implementação existente, não mudanças propostas aqui.

### Melhorias internas implementadas em 2026-11-13

`AppApi.stop()` chama `disposeServidorEmergencia(this.io)` antes de fechar o Socket.IO. A limpeza cancela timers pendentes e libera a referência ao servidor encerrado, sem executar as ações agendadas. A função é idempotente e ignora uma instância diferente da atualmente vinculada. Na criação da nova API, o vínculo é registrado novamente. Não há mudança na emissão, no prazo ou nos destinatários enquanto o serviço opera.

Cobertura adicionada:

| Área | Casos protegidos | Teste |
| --- | --- | --- |
| Emergência | Substituição de prazo, cancelamento por `Acao=nenhuma`, independência entre alvo individual e broadcast, cliente que entra antes do prazo, socket desconectado e descarte de timers | `test/src/services/servidor.emergencia.service.test.ts` |
| Ciclo de vida | Encerrar a API remove timers e vínculo; uma nova API registra outra instância | `test/src/aplication/app.api.lifecycle.test.ts` |
| Deduplicação | Falha responde a todos os `ResponseIn`; após sucesso ou falha, novo pedido executa novamente; sockets distintos não compartilham execução | `test/src/socket/socket.query.dedupe.test.ts` |
| Cancelamento SQL | Request criada após disconnect, `cancel()` que lança erro, múltiplos escopos, isolamento assíncrono entre sockets e remoção após `done`/`error` ou saída do handler | `test/src/infra/sql.request.scope.test.ts` |

O algoritmo de deduplicação não foi alterado. Os testes exercitam o fluxo real de `withSocketRequest`, incluindo envelopes de resposta e erro. Esses reforços fazem parte da Fase 0; não implementam as Fases 4 ou 5.

O cancelamento SQL também foi preservado: novos testes verificam a implementação existente, sem alterar o driver ou a política de cancelamento. O [benchmark de consultas](./desempenho-consultas.md) acrescenta seis cenários com dados controlados, aquecimento e relatório JSON com amostras brutas. Ele mede preparação de consultas e processamento Node; não executa SQL nem mede locks ou rede reais.

---

### Complemento da Fase 0 — testes e medições (2026-11-13)

Itens 1 a 4 da continuação implementados sem alterações em `src/`:

1. `base.periodic.listen.service.test.ts`: pausa e retomada no tick agendado, backoff após falhas, recuperação do intervalo normal, teto de 120 segundos e parada durante emissão pendente com sucesso ou erro. O teste também protege contra sobreposição durante uma execução contínua. Parar não cancela a emissão em andamento; impede o próximo agendamento.
2. `connection.sql.server.mssql.test.ts`: recuperação após sucesso, pool ocupado ou acquire timeout; reconexão após duas falhas consecutivas compartilhada com pedidos concorrentes; ausência de probes sobrepostos; encerramento durante probe pendente sem novo agendamento. Pool e relógio são simulados, sem SQL Server real.
3. Comparador local de relatórios: diferenças de mediana/p95, identificação de ambiente/configuração e mudanças de cenários, com testes de validação. Não impõe limite temporal à suíte.
4. Benchmark ampliado: filtros combinados com página 3 e serialização de 500/1500 linhas. Método, limitações e comandos em [desempenho-consultas](./desempenho-consultas.md).

Validação desta etapa: `npm test -- --run` com **241 aprovados e 8 ignorados**, `npx tsc --noEmit`, nove cenários de benchmark e execução do comparador. Os testes HTTP/Socket.IO precisam de loopback autorizado; no sandbox, seis casos falharam com bloqueio de conexão local e passaram na repetição com permissão. Os ignorados já existiam.

O item 5 foi tratado na etapa seguinte, abaixo. Os testes dos itens 1 a 4 não validam recuperação contra SQL Server real. Naquela etapa, contratos HTTP/Socket.IO, limites, prazos, critérios de reconexão e código do runtime permaneceram inalterados.

### Item 5 — coordenação de reinício e encerramento (2026-11-13)

Dois problemas internos foram reproduzidos antes da correção, com cinco casos de teste falhando:

- `stop/start` na mesma instância iniciava novas emissões com a anterior ainda pendente. No teste de reinícios repetidos, ocorreram 13 chamadas antes de liberar a primeira. A conclusão antiga também podia alterar o contador de falhas e o timer do ciclo novo.
- Uma segunda chamada de `closePool()` resolvia enquanto a primeira ainda aguardava o driver. O segundo chamador recebia sucesso prematuro, inclusive quando o fechamento posteriormente falhava.

Correções limitadas a `BasePeriodicListenService` e `ConnectionSqlServerMssql`:

- O listener identifica cada ciclo de execução e mantém uma única emissão pendente por instância. Um reinício aguarda essa emissão terminar e só então inicia o ciclo atual, respeitando pausa ou nova parada. Falhas antigas continuam registradas, mas não alteram o backoff do ciclo novo. `stop()` continua síncrono e não cancela a consulta/emissão já iniciada; os efeitos dessa emissão ainda podem terminar depois da parada. Instâncias diferentes continuam independentes.
- `closePool()` compartilha o resultado do fechamento em andamento. Todos os chamadores concorrentes aguardam a conclusão e recebem a mesma falha, se houver. A referência compartilhada e o indicador de fechamento são liberados ao final, permitindo chamadas posteriores. A ordem de rollback, espera pela inicialização e fechamento do driver, assim como a mensagem de erro, foi preservada.

Essas correções mudam somente a coordenação nos cenários de corrida comprovados: o reinício deixa de sobrepor consultas, e o segundo fechamento deixa de anunciar conclusão antes da hora. Não alteram assinaturas públicas, rotas, eventos, envelopes, SQL, limites, intervalos normais, critérios de reconexão ou política de cancelamento. Uma emissão que nunca conclua impede outro ciclo na mesma instância; não foi introduzido timeout adicional.

Foram acrescentados sete casos, incluindo sucesso/erro da emissão antiga, reinícios repetidos, pausa, parada antes da conclusão, backoff do ciclo novo e sucesso/erro compartilhado no fechamento. Validação: **248 testes aprovados e 8 ignorados**, `npx tsc --noEmit` e `git diff --check` sem erros. A suíte completa usou permissão de loopback para HTTP/Socket.IO. Os testes de concorrência usam relógio e driver simulados; não representam validação contra SQL Server real. Relatórios anteriores de benchmark permanecem como referências históricas, sem alegação de ganho de desempenho nesta correção.

## 4. Levantamentos que travam o kick automático

Estes pontos são a razão de a Fase 4 estar **bloqueada**. Não ignorar na implementação futura.

### 4.1 Pool compartilhado

`ConnectionSqlServerMssql` é um pool. O SPID que atende o coletor A no instante seguinte atende o B. **Não há sessão SQL por `socket.id`.**

Consequência: consultar `sys.dm_tran_locks` / `sys.dm_exec_requests` **não** aponta o aparelho. Para mapear seria preciso marcar cada request (`SET CONTEXT_INFO`, comentário com `socket.id`) e ainda assim correlacionar no tempo — fura o modelo atual do pool e a sonda pode ela mesma travar.

### 4.2 `[SQL-1222]` é a vítima, não o vilão

`SET LOCK_TIMEOUT` faz a **lista desistir**. Quem recebe `[SQL-1222]` está sendo bloqueado (em geral pelo ERP), não está segurando lock. Kickar por 1222 expulsa o conferente que **espera** o ERP.

### 4.3 Timeout 30 s já cancela

No timeout da request instrumentada (padrão 30 s), o Node chama `request.cancel()`. Isso solicita cancelamento ao driver; não comprova liberação instantânea de locks ou término de rollback no SQL Server. Desconectar também o socket não é evidência de que a base será liberada mais rápido e interrompe a UI.

### 4.4 Falso positivo = experiência ruim

Kick errado: conferente no meio do carrinho, socket cai, tela some, app reconecta em loop, scans e consultas se repetem. Isso é **pior** que um erro de lista. Preferir falhar o `SELECT` e deixar o socket vivo.

### 4.5 Cliente que não escuta o canal

O desktop já escuta. O `exp` ainda não. Disconnect automático no `exp` aparece só como “caiu a conexão”. O aviso só vale nos dois depois da Fase 1 completa.

### 4.6 Várias pessoas na mesma `CodSepararEstoque` é o modo normal

Regra 11. Muitas consultas simultâneas **não** são abuso. A deduplicação cobre pedidos idênticos no mesmo socket; o timer de listen do servidor é independente. Uma eventual análise de carga precisa distinguir pedidos das telas, repetição no cliente e o timer do processo.

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
| Broadcast `Acao=desconectar` sem `SocketId` | Derruba todos os sockets conectados ao vencer o prazo | Operador deve informar `SocketId` para alvo individual. A API atual não exige confirmação e, sem esse campo, faz broadcast |
| Reconnect agressivo no Flutter | Anula o kick e martela de novo | Fase 1: backoff / ação do usuário |
| Unificar payload de listen | Quebra desktop e `exp` | Canal novo usa só `{ Data }`; não mexer nos outros |
| Mutação com `LOCK_TIMEOUT` 5 s | Insert/update aborta cedo demais | Já resetado com `-1` fora de lista; não reaplicar timeout curto em gravação |

---

## 6. Cuidados obrigatórios (invariantes)

1. Erro de consulta não aciona desconexão automática. Desconexão manual já existe via emergência; política automática seria outro trabalho, após decisão específica. Falha na configuração inicial da conexão também pode encerrar o socket.
2. **Não recusar** payload publicado: `LIKE` setor/data, string SQL no `Where`, `LIMIT` explícito, handshake sem token.
3. **Não** exigir token no Socket.IO nesta feature.
4. **Não** prefixar `socket.id` em `servidor.emergencia.listen`.
5. **Não** mandar `Session` nesse canal (o coletor ignora evento com `Session == socket.id` se `allEvent` for false).
6. HTTP de emergência **só loopback** (`requireLoopback`). Coletor não chama.
7. `PrazoMs` aceita 0–60 s no schema; o padrão para desconectar é 5 s. Dar tempo para exibir o aviso é orientação operacional, não validação adicional da API.
8. Dois Flutter. Testar os dois, ou no mínimo o contrato com `allEvent: true`.
9. Testes de regressão das Fases 0 ficam. Não “simplificar” o shim de `LIKE` recusando o pedido.
10. Logs sem senha, sem corpo SQL interpolado completo com credencial. `socketId` + código do aviso bastam.
11. Expedição = SQL Server. Não criar caminho Sybase/Firebird.
12. Trigger 02 **não** emite `conferir.insert.listen`. Não “consertar” isso neste plano.

---

## 7. Fases de implementação (futuro)

Cada fase é um PR separado. Não juntar kick automático com recusa de `LIKE`.

### Fase 1 — Coletores escutam o canal (pré-requisito da política automática)

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

A fonte atual do `exp` **já** cumpre: `CodSetorEstoque =`, intervalo de `DataEmissao`, `buildWhereParams()`, aplica o `Data` de `separar.consulta.listen`, não retenta `[SQL-CONN]`. A fonte atual do desktop já manda `buildWhereList()`. Não voltar ao `LIKE` nem a `buildSqlWhere()` no emit.

Ainda vale para **build antigo em campo** (o warn `Consulta Where em SQL cru` no servidor é esse caso):

- `CodSetorEstoque =` e data por igualdade/intervalo. Não mandar `EXISTS` montado no cliente.
- `Where` lista `{ key, value }`.
- Não disparar `separar.consulta` no tick de `separar.consulta.listen`.
- Não relançar `[SQL-CONN]` em loop imediato.

O servidor **não** recusa o modo antigo (shim do `LIKE` e string SQL) enquanto houver build velho em campo. Contrato: [Where](../contratos/where.md).

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
4. Se aprovado, criar uma flag desligada por padrão. `SQL_AUTO_KICK` é apenas um nome proposto: não existe opção desse nome no runtime atual.
5. Log: `socketId`, contagens, gatilho, **não** kick silencioso.
6. Teste de falso positivo: um `separar.consulta` lento + listen periódico **não** dispara.

**Alternativa preferida enquanto a Fase 4 estiver bloqueada:** operador vê `/internal/sockets`, escolhe o `socketId`, `POST /internal/sockets/emergencia`. Manual, sem falso positivo de código.

### Fase 5 — Breaking opt-in (só com migração)

Depois dos coletores novos em campo, **um** item por vez, com flag e rollback:

| Item | Quebra se ligar cedo |
| --- | --- |
| Recusar `LIKE` não coberto pelo shim | Lista `exp` |
| Recusar string SQL no `Where` | `QueryBuilder.buildSqlWhere()` ainda no fio de build antigo |
| Teto rígido de `LIMIT` explícito | Página menor |
| Token no handshake | Conexão recusada |
| Rate limit com erro (não fila) | Pedidos extras falham |

Default continua compatível (regra 26). Cliente novo pode mandar token **sem** o servidor exigir.

Transação SQL opt-in é outro plano (regras 16–17). `transacao: true` é apenas uma proposta de campo; não é um contrato implementado nem deve ser enviado esperando atomicidade. Autocommit permanece como está.

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

**Fase 3:** validar os builds publicados dos dois coletores, incluindo filtros, ausência de nova consulta disparada por cada listen e ausência de repetição imediata após timeout. O estado da fonte sozinho não comprova adoção em campo.

**Fase 4 (se existir):** flag off = comportamento da Fase 0; flag on + 1 timeout ≠ kick; flag on + critério pleno = aviso depois disconnect; dois coletores na mesma `CodSepararEstoque` não se expulsam.

---

## 10. Rollback

| Camada | Como voltar |
| --- | --- |
| Node Fase 0 | Avaliar reversão específica da mudança problemática, preservando contratos. `SQL_LOCK_TIMEOUT_MS=0` desliga só o timeout de lista, sem tirar o shim. Não reverter todas as proteções como rotina |
| Canal emergência | Preservar endpoint e payload existentes. Para cancelar um timer, um aviso `Acao=nenhuma` deve ter o mesmo alvo; broadcast e alvo individual são independentes |
| Fase 4 | Apenas se implementada futuramente: desligar a flag prevista no plano aprovado. Hoje não existe flag de kick automático |
| RCSI | DBA; não é este repositório. |
| Breaking Fase 5 | Flag / revert. Cliente antigo tem de continuar no ar. |

---

## 11. Decisões já tomadas

1. Proteções que **não** quebram cliente: aplicadas (Fase 0).
2. Proteções que quebram: **não** aplicadas.
3. Canal de emergência e desconexão manual: presentes no Node. Registro externo: listener feito no desktop e pendente no `exp`; confirmar versões publicadas.
4. Kick automático: **não** aplicar agora. Risco principal = falso positivo e experiência.
5. Operador manual via loopback: caminho oficial para desconectar alguém.
6. Expedição só SQL Server.

Qualquer implementação futura deste plano começa relendo esta seção e a §4. Se o kick automático voltar à mesa, o critério tem de sobreviver a: ERP lento, duas telas + listen, pool cheio, e `[SQL-1222]` isolado. Se não sobreviver, não liga.
