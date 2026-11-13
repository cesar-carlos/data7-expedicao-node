# Proteções do servidor — guia para agentes dos coletores

Documento para quem altera os Flutter (`app_expedicao` e `exp`). O servidor é SQL Server. Este arquivo diz o que **já está no ar**, o que o cliente **precisa escutar agora**, e o que **ainda não** existe — para o app se preparar sem quebrar o contrato atual.

Dois coletores, o mesmo Socket.IO:

| App | Caminho |
| --- | --- |
| Desktop | `D:\Developer\Data7\Expedicao\Flutter\app_expedicao` |
| `exp` | `D:\Developer\Data7\Expedicao\Flutter\app\exp` |

Envelope, `Where` e página: [comunicação](../comunicacao.md), [contratos](../contratos/README.md). Listen de negócio: [listen](./listen.md).

## Como ler o estado

| Marca | Significado |
| --- | --- |
| **Já no servidor** | Código Node já aplica. Cliente publicado continua funcionando. |
| **Escutar agora** | Canal novo já emite. Cliente antigo ignora. Cliente novo **deve** registrar o listener. |
| **Ainda não** | Não quebra hoje. Prepare o código. Quando ligar, o app antigo pode falhar se não estiver pronto. |

Nada abaixo recusa o payload que os coletores já mandam (`LIKE` de setor/data, string SQL no `Where`, `LIMIT` explícito, handshake sem token).

---

## Já no servidor

O servidor protege a base **sem** mudar JSON de pedido/resposta das consultas atuais.

| Proteção | O que o servidor faz | O que o cliente vê |
| --- | --- | --- |
| Reescrita de `LIKE` em `separar.consulta` | `CodSetoresEstoque LIKE '%3%'` e `DataEmissao LIKE 'yyyy-MM-dd%'` viram `EXISTS` / igualdade ou intervalo | A mesma lista |
| Dedup de `*.consulta` | Dois pedidos iguais no mesmo socket compartilham um SQL | Os dois `ResponseIn` recebem o mesmo `Data` |
| `SET LOCK_TIMEOUT` nas listas | Padrão 5 s (`SQL_LOCK_TIMEOUT_MS`) só no `SELECT` | `[SQL-1222]` (“registro em uso”) se o ERP estiver gravando |
| Cancel no timeout do Node | Estoura 30 s → cancela a request SQL | Continua `[SQL-CONN]` |
| Página antes do `STRING_AGG` | `OFFSET/FETCH` na base; agregação de setor/usuário depois | Lista não varre `ItemSepararEstoque` inteira |
| Teto padrão 1500 | Sem `LIMIT` do cliente, a página é 1500 | Igual ao contrato antigo |

### O que o cliente já deve fazer (não é breaking, é higiene)

1. Preferir `CodSetorEstoque =` em vez de `LIKE` em `CodSetoresEstoque`.
2. Preferir igualdade ou intervalo de `DataEmissao`, não `LIKE 'yyyy-MM-dd%'`.
3. Preferir `Where` como lista `{ key, value }`, não string SQL.
4. **Não** disparar outra `separar.consulta` no mesmo tick de `separar.consulta.listen`. Usar o `Data` do listen.
5. Tratar `[SQL-1222]` como “tente de novo”, não como payload inválido.
6. Tratar `[SQL-CONN]` como timeout/falha de conexão. Não relançar a mesma consulta em loop imediato.

Regra 26 em [expedição](../expedicao/regras.md). Shim: [Where](../contratos/where.md).

---

## Escutar agora — canal de emergência

Canal: **`servidor.emergencia.listen`**

O cliente **não emite** este evento. Só escuta o nome, sem `socket.id`, desde a conexão (não só numa tela).

Uso: aviso direto do servidor (manutenção, cliente travando a base, desconexão iminente). Sem este listener, o app antigo continua no ar, mas **não é avisado** antes de um disconnect futuro.

### Estado deste canal

| Parte | Estado |
| --- | --- |
| Nome do canal e payload `{ Data }` | **Já no servidor** |
| HTTP interno para o operador emitir o aviso | **Já no servidor** (`POST /internal/sockets/emergencia`, só loopback) |
| Listener nos Flutter | **Escutar agora** — ainda não existe nos coletores |
| Desconectar sozinho quem está travando a base | **Ainda não** — quando existir, o servidor emite este canal **antes** e só então corta o socket |

### Payload

Família `ExpedicaoBasicListenEvent`. **Não tem `Session`**. Não ignore o evento por filtro de sessão. No desktop e no `exp`, registre com `allEvent: true`.

O corpo no fio é JSON **string** (aceite também objeto já decodificado):

```json
{
  "Data": [
    {
      "Nivel": "aviso",
      "Codigo": "SERVIDOR_AVISO",
      "Mensagem": "Servidor em manutencao em 10 minutos.",
      "Acao": "nenhuma",
      "PrazoMs": 0,
      "EmitidoEm": "2026-11-13T12:00:00.000Z"
    }
  ]
}
```

| Campo | Valores | O que o cliente faz |
| --- | --- | --- |
| `Nivel` | `aviso` · `urgente` · `desconectar` | Cor / prioridade da UI |
| `Codigo` | `SERVIDOR_AVISO` · `SERVIDOR_MANUTENCAO` · `SERVIDOR_DESCONECTAR` (outros códigos podem aparecer) | Identificador estável; não parsear a `Mensagem` |
| `Mensagem` | texto | Mostrar na tela (snackbar / diálogo). Não embrulhar com `Erro ao X:` |
| `Acao` | `nenhuma` · `desconectar` | `nenhuma`: só aviso. `desconectar`: o socket cai depois de `PrazoMs` |
| `PrazoMs` | 0–60000 | Tempo até o servidor chamar `disconnect`. 0 = em seguida |
| `EmitidoEm` | ISO-8601 | Auditoria; pode ignorar na UI |

### Comportamento obrigatório no coletor

1. Registrar o listener **na conexão**, não no dispose da tela de separar/conferir.
2. `socket.on('servidor.emergencia.listen', …)` com o nome literal. Não prefixar `socket.id`.
3. `JSON.parse` se vier string. Ler `Data[0]`.
4. Mostrar `Mensagem` para o usuário.
5. Se `Acao == "desconectar"`:
   - parar de mandar `*.consulta` e mutação;
   - cancelar timers de resync daquela sessão;
   - mostrar que a conexão vai cair (`PrazoMs`);
   - **não** reconectar em loop no mesmo instante do disconnect;
   - depois do corte, tela de “servidor encerrou a sessão” + reconectar só com ação do usuário (ou backoff longo).
6. Cliente que **não** escuta: o servidor ainda pode desconectar; o usuário só vê o socket cair.

### Dart (os dois apps)

```dart
socket.on('servidor.emergencia.listen', (payload) {
  final decoded = payload is String ? jsonDecode(payload) : payload;
  final data = (decoded is Map ? decoded['Data'] : null);
  if (data is! List || data.isEmpty) return;
  final aviso = data.first;
  if (aviso is! Map) return;

  final mensagem = aviso['Mensagem']?.toString() ?? '';
  final acao = aviso['Acao']?.toString() ?? 'nenhuma';
  final prazoMs = aviso['PrazoMs'] is num ? (aviso['PrazoMs'] as num).toInt() : 0;

  // mostrar mensagem; se acao == 'desconectar', preparar a UI
});
```

No `EventListenerModel` / `ListenEventService` do desktop e do `exp`: **`allEvent: true`**. Sem isso, um filtro de `Session` pode engolir o aviso (este canal não manda `Session`).

### O cliente não chama o HTTP

`POST /internal/sockets/emergencia` é operador/loopback. O coletor **não** usa essa rota. Só escuta o Socket.IO.

---

## Ainda não (preparem)

Estas mudanças **não** estão ligadas. Quando forem, o servidor avisará neste documento e, se for corte de conexão, em `servidor.emergencia.listen`.

| Proteção | Risco se o app não estiver pronto | Como se preparar agora |
| --- | --- | --- |
| Recusar `LIKE` não indexado com `[INVALID_PAYLOAD]` | Lista de separar do `exp` antigo quebra | Já mandar `CodSetorEstoque =` e data por igualdade/intervalo |
| Recusar string SQL no `Where` | `QueryBuilder.buildSqlWhere()` deixa de funcionar | Mandar lista `{ key, value }` |
| Cortar `LIMIT` explícito num teto (hoje o cliente manda e o servidor respeita) | Página menor que a esperada | Não depender de `LIMIT` enorme; paginar |
| Token no handshake Socket.IO | Conexão recusada | Deixar o cliente **capaz** de mandar token; hoje **não** mandar / **não** exigir |
| Rate limit de `*.consulta` por socket | Pedidos extras atrasam ou recebem erro | Não martelar consulta; confiar no listen e no dedup |
| Transação SQL opt-in (`transacao: true` ou evento de lote) | Sem o campo, continua autocommit | Não assumir rollback no cliente antigo |
| Desconectar automaticamente quem segura lock / satura o pool | Socket cai | Escutar `servidor.emergencia.listen` e tratar `Acao=desconectar` |
| `READ_COMMITTED_SNAPSHOT` na `Estacao` | Nenhum no JSON | Só DBA; o app não muda |

Handshake **continua sem token**. `LIMIT` explícito **continua respeitado**. String SQL no `Where` **continua aceita** (com aviso no log).

---

## Erros que o cliente já recebe

Formato: `[identificador] mensagem`. Tabela: [erros](../expedicao/erros.md).

| Prefixo | Relação com proteção |
| --- | --- |
| `[SQL-1222]` | Lista esperou lock além de `SQL_LOCK_TIMEOUT_MS` |
| `[SQL-CONN]` | Timeout 30 s / falha de conexão; a request SQL foi cancelada |
| `[INVALID_PAYLOAD]` | Envelope inválido (`CodCarrinho` ausente em item a conferir, etc.). **Ainda não** cobre `LIKE` de setor |
| `[50014]` … | Trigger / regra de conferência. Não é proteção de lista |

Não embrulhar com `Exception('Erro ao X: $e')` nem dump `AppError{...}`. Desktop: `AppError.display`. `exp`: `DataError.message`.

---

## Checklist para o agente do coletor

- [ ] Listener global de `servidor.emergencia.listen` com `allEvent: true`
- [ ] UI para `Mensagem`
- [ ] Caminho de `Acao=desconectar` (parar consultas, não reconectar em loop)
- [ ] `Where` de setor/data em igualdade (o shim existe, mas o app novo não deve mandar `LIKE`)
- [ ] Não refazer `separar.consulta` no tick do listen periódico
- [ ] Não inventar handshake com token **ainda** (o servidor rejeitaria o cliente antigo se o token passasse a ser obrigatório sem migração)
