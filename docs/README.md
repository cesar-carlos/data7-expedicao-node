# Documentação

Servidor de expedição em Node.js 24–26 (`engines`: `>=24 <27`) e TypeScript. HTTP e Socket.IO na mesma porta. Banco: SQL Server.

Cobrança PIX, Firebase e Sybase não fazem parte desta versão.

Comece por [comunicação](./comunicacao.md) se a dúvida é “como o cliente fala com o servidor”.

## Pastas

```text
docs/
|- README.md              este índice
|- comunicacao.md         HTTP + Socket.IO no mesmo processo
|- contratos/             envelope, Where, página
|- http/                  login, usuários, health, notify, monitor
|- socket/                catálogo de eventos e escuta periódica
|- expedicao/             regras, situações, triggers, erros, índices
|- params-common.md       redireciona para contratos/where.md
`- paginacao-limites.md   redireciona para contratos/paginacao.md
```

`login-app.md`, `usuario-consulta.md` e `escuta-separacao.md` na raiz só redirecionam.

## Leia nesta ordem

1. [Comunicação](./comunicacao.md) — o que vai por HTTP e o que vai por Socket.IO
2. [Contratos](./contratos/README.md) — `Where`, `Pagination`, envelope
3. [HTTP](./http/README.md) — login e usuários
4. [Socket.IO](./socket/README.md) — `*.consulta`, mutação, `*.listen`
5. [Expedição](./expedicao/README.md) — regras de domínio

## Contratos

- [Paginação](./contratos/paginacao.md) — `LIMIT` 1500, `OFFSET/FETCH`, unidade de medida
- [Where](./contratos/where.md) — lista `{ key, value }` (preferida) ou string SQL legado
- [Consulta Socket.IO](./contratos/consulta-socket.md)
- [Consulta HTTP](./contratos/consulta-http.md)

## HTTP

- [Login do aplicativo](./http/login-app.md)
- [Usuários do ERP](./http/usuario-consulta.md)

## Socket.IO

- [Consultas](./socket/consultas.md) — `*.consulta` e `*.select`
- [Eventos](./socket/eventos.md) — mutação e `*.listen`
- [Listen](./socket/listen.md) — o que o servidor emite (`separar.update.listen`, conferência, trigger)
- [Separar](./socket/separar.md) / [Conferir](./socket/conferir.md)
- [Escuta periódica](./socket/escuta.md) — `separar.consulta.listen`

## Expedição

- [Regras](./expedicao/regras.md)
- [Situações](./expedicao/situacoes.md)
- [Separação → conferência](./expedicao/fluxo-separacao-conferencia.md)
- [Triggers](./expedicao/triggers.md)
- [Erros](./expedicao/erros.md)
- [Índices](./expedicao/indices.md)

## Configuração

O processo lê o `.env`. O modelo está em `.env.exemple`.

| Variável | Uso |
| --- | --- |
| `LOCAL_DATABASE` | `sql_server` |
| `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME` | SQL Server |
| `USER_DATABASE`, `PASSWORD_DATABASE` | Credencial do banco |
| `SERVER_PORT` | Porta HTTP e Socket.IO. Sem a variável, a API usa 3000. O `.env.exemple` sugere 3001 |
| `SEPARAR_LISTEN_ENABLED` | Opcional. Padrão ligado |
| `SEPARAR_LISTEN_INTERVAL_MS` | Opcional. Padrão 8000, entre 1000 e 86400000 |
| `SEPARAR_LISTEN_LIMIT` | Opcional. Padrão 20, entre 1 e 500 |
| `SEPARAR_LISTEN_DEBUG` | Opcional. Padrão desligado |
| `SQL_HEARTBEAT_INTERVAL_MS` | Opcional. Padrão 30000, entre 5000 e 300000 |
| `SQL_POOL_MAX` | Opcional. Padrão 20, entre 1 e 100. Conexões simultâneas no SQL Server |
| `SQL_POOL_MIN` | Opcional. Padrão 2, entre 0 e 100. Se maior que `SQL_POOL_MAX`, usa o máximo |
| `SQL_POOL_IDLE_TIMEOUT_MS` | Opcional. Padrão 30000 |
| `SQL_POOL_ACQUIRE_TIMEOUT_MS` | Opcional. Padrão 60000. Espera por um slot do pool |
| `SQL_CONNECTION_TIMEOUT_MS` | Opcional. Padrão 30000 |
| `SQL_REQUEST_TIMEOUT_MS` | Opcional. Padrão 30000 |
| `SQL_HEALTHCHECK_TIMEOUT_MS` | Opcional. Padrão 2000. `SELECT 1` do heartbeat; pool cheio não reconecta |

O aplicativo Windows instala em `C:\Program Files\Data7 Expedicao`. Se já houver uma cópia, o instalador remove o programa antigo e grava a nova no mesmo lugar. A configuração fica em `%ProgramData%\data7-expedicao\config.json`, compartilhada por todos os usuários, e essa pasta não é apagada na atualização nem na desinstalação. A senha do banco não volta para a tela depois de gravada. HTTP e Socket.IO aceitam qualquer origem e não exigem token. O monitor `/internal/sockets` só responde no loopback.
