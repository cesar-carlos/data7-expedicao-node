# Execução e operação

Guia baseado nos scripts e no bootstrap deste repositório. Configurações e valores padrão: [índice](./README.md#configuração). Contratos dos clientes: [comunicação](./comunicacao.md).

## Preparar o ambiente

Use Node.js compatível com `package.json` (`>=24 <27`) e um SQL Server acessível. Execute os comandos na raiz do repositório.

```powershell
npm ci
```

Na primeira configuração, copie `.env.exemple` para `.env`, sem sobrescrever uma configuração existente. Preencha:

```dotenv
LOCAL_DATABASE=sql_server
DATABASE_HOST=<servidor>
DATABASE_PORT=1433
DATABASE_NAME=<base>
USER_DATABASE=<usuario>
PASSWORD_DATABASE=<senha>
SERVER_PORT=3001
```

O modelo deixa `LOCAL_DATABASE` vazio. Preencha com `sql_server`: os repositórios de expedição são registrados nesse contexto. Sybase não substitui o SQL Server neste fluxo.

`src/infra/load.env.ts` usa o primeiro arquivo encontrado nesta ordem: pasta do entrypoint, pasta pai, diretório de trabalho. Não combina vários `.env`; variáveis já existentes no ambiente prevalecem. No build de loja, o arquivo copiado fica em `dist.loja/src/.env`.

## Desenvolvimento e build

| Comando | Efeito |
| --- | --- |
| `npm run dev` | Executa `src/server.ts` com reinício em alterações; usa `--transpile-only` |
| `npx tsc --noEmit` | Verifica tipos sem gerar build |
| `npm test -- --run` | Executa o Vitest uma vez, sem modo watch |
| `npm run build:wind:loja` | Compila para `dist.loja`, copia `package.json`, `.env` e os arquivos SQL |
| `npm start` | Executa o build existente em `dist.loja/src/server.js` |
| `npm run build:wind` | Compila para `dist` e copia `.env` e SQL; essa saída não é a usada por `npm start` |

Para iniciar a versão compilada:

```powershell
npm run build:wind:loja
npm start
```

Repita o build após alterar fonte ou SQL. Esses scripts de build copiam o `.env` local, incluindo credenciais; o pacote do aplicativo Windows tem um fluxo próprio sem esse arquivo.

## Inicialização e encerramento

`src/server.ts` carrega `reflect-metadata` e inicia `src/aplication/app.ts`. A aplicação carrega o ambiente, registra dependências e aquece o pool SQL antes de iniciar HTTP/Socket.IO e a escuta periódica.

`SIGINT` e `SIGTERM` disparam o encerramento: param o agendamento periódico, encerram a API e fecham o pool. No terminal, use `Ctrl+C`.

Ao encerrar uma API iniciada, os timers pendentes de emergência são cancelados antes de fechar o Socket.IO, e a referência ao servidor é liberada. Uma nova instância registra seu próprio vínculo. Essa limpeza não muda a desconexão manual durante operação nem os destinatários do broadcast.

Se o pool ainda estiver conectando, o encerramento aguarda essa tentativa terminar (sucesso ou falha) antes de concluir a limpeza. O driver `mssql` não permite chamar `close()` durante `connect()`. A espera segue o timeout de conexão configurado; não muda o timeout das consultas.

## Testes e dependências externas

Os testes de contrato `socket.runtime.test.ts` e `conferir.event.test.ts` usam um servidor Socket.IO real em porta local livre, sem iniciar o bootstrap nem o warmup SQL. A consulta de conferência usa um retorno controlado do repositório; o teste de payload inválido verifica que a gravação não é chamada. Eles validam transporte, handlers e serialização, não a instalação das triggers ou a consulta SQL de produção.

Testes HTTP/Socket.IO precisam de permissão para conexões em `127.0.0.1`. `EACCES` nesse endereço pode ser uma restrição do ambiente de execução. Não desabilite validações nem altere rotas para contorná-la; execute os testes em um ambiente com loopback permitido.

O teste do pool simula a restrição real do driver e cobre encerramento durante uma conexão pendente que depois conecta ou falha. Não usa credenciais nem SQL Server real.

Os testes de `sql.request.scope` cobrem requests criadas após disconnect, falhas em `cancel()`, isolamento entre sockets e limpeza após conclusão/erro. Para medições separadas da suíte, use `npm run bench:consultas -- --samples 30 --warmup 5`. Método, limites e relatório de referência: [desempenho de consultas](./feature/desempenho-consultas.md).

## Verificar o serviço

Com `SERVER_PORT=3001`:

```powershell
Invoke-RestMethod -Uri 'http://127.0.0.1:3001/health'
Invoke-RestMethod -Uri 'http://127.0.0.1:3001/internal/sockets'
```

`/health` responde `{ "status": "UP" }` sem consultar o banco. Isso confirma disponibilidade HTTP, não saúde do SQL Server. O heartbeat do pool usa `SELECT 1`; uma consulta de negócio, como `GET /usuarios?Limit=1`, ajuda a verificar o caminho completo até o banco.

O monitor aceita apenas endereço remoto loopback. A decisão usa `req.socket.remoteAddress`; não depende de CORS, `Origin` ou `X-Forwarded-For`. Rotas e respostas: [HTTP](./http/README.md).

## Aplicativo Windows

`apps/desktop` contém o supervisor Electron. A configuração fica em `%ProgramData%\data7-expedicao\config.json` e é convertida em variáveis de ambiente para o processo Node. A senha salva não é devolvida à interface.

O projeto desktop tem dependências e comandos próprios:

```powershell
npm --prefix apps/desktop ci
npm --prefix apps/desktop run dev
```

`npm --prefix apps/desktop run build` compila a interface e o Electron. `npm --prefix apps/desktop run pack` executa `apps/desktop/scripts/package-win.ps1`: prepara a API, SQL e runtime Node, empacota o aplicativo e usa o Inno Setup. Consulte esse script para versões, ferramentas e caminhos exigidos. O empacotamento rejeita `.env` no servidor preparado.

## Diagnóstico

| Sintoma | Verificação |
| --- | --- |
| `LOCAL_DATABASE ausente` | Conferir o `.env` encontrado e o contexto; o modelo vem vazio |
| `npm start` não encontra o entrypoint | Executar `npm run build:wind:loja`; `build:wind` gera outra pasta |
| `/health` funciona, mas consultas falham | Conferir heartbeat, credenciais, permissões e mensagem SQL no log |
| Monitor responde 404 | Conferir se o endereço remoto da conexão é loopback |
| `Consulta Where em SQL cru` na aba Erros | É warn de compatibilidade; stderr é classificado como erro pelo painel. [Where](./contratos/where.md) |
| Falha da escuta periódica | Ver `consecutiveFailures` e `nextDelayMs`; o timer faz backoff e não transmite `Error`. [Escuta](./socket/escuta.md) |
| `[SQL-1934]`, `[SQL-334]` ou `[50014]` | Seguir [erros de expedição](./expedicao/erros.md) e o pacote SQL externo correspondente |

As referências a aplicação de scripts na `Estacao` e ao estado dos coletores são registros da documentação. Revise a base e a versão publicada ao investigar uma instalação; revisar este repositório não confirma o estado de produção.
