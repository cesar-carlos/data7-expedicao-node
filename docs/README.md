# Documentação

Servidor de expedição em Node.js 26.12 e TypeScript. A API atende HTTP e Socket.IO. O banco local é o SQL Server.

Cobrança PIX, Firebase e Sybase não fazem parte desta versão.

## Guias

- [Login do aplicativo](./login-app.md) — criar, autenticar, consultar e atualizar o login, incluindo senha e foto
- [Consulta de usuários](./usuario-consulta.md) — `GET /usuarios`
- [Escuta de separação](./escuta-separacao.md) — evento periódico `separar.consulta.listen`
- [Parâmetros de consulta SQL](./params-common.md) — formatos aceitos por `ParamsCommonRepository.build`

## Configuração

O processo lê o `.env`. O modelo está em `.env.exemple`.

| Variável | Uso |
| --- | --- |
| `LOCAL_DATABASE` | `sql_server` |
| `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME` | SQL Server |
| `USER_DATABASE`, `PASSWORD_DATABASE` | Credencial do banco |
| `SERVER_PORT` | Porta HTTP. Sem a variável, a API usa 3000 |
| `SEPARAR_LISTEN_ENABLED` | Opcional. Padrão ligado |
| `SEPARAR_LISTEN_INTERVAL_MS` | Opcional. Padrão 8000, entre 1000 e 86400000 |
| `SEPARAR_LISTEN_LIMIT` | Opcional. Padrão 20, entre 1 e 500 |
| `SEPARAR_LISTEN_DEBUG` | Opcional. Padrão desligado |
| `SQL_HEARTBEAT_INTERVAL_MS` | Opcional. Padrão 30000, mínimo 5000 |

O aplicativo Windows instala em `C:\Program Files\Data7 Expedicao`. Se já houver uma cópia, o instalador remove o programa antigo e grava a nova no mesmo lugar. A configuração fica em `%ProgramData%\data7-expedicao\config.json`, compartilhada por todos os usuários, e essa pasta não é apagada na atualização nem na desinstalação. A senha do banco não volta para a tela depois de gravada. HTTP e Socket.IO aceitam qualquer origem e não exigem token.
