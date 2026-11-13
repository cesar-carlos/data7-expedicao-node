# Data7 Expedição

Servidor Node.js 24–26 da expedição. A API atende HTTP e Socket.IO no SQL Server, na mesma porta.

A documentação fica em [`docs/`](./docs/README.md). Comece por [`docs/comunicacao.md`](./docs/comunicacao.md).

```bash
npm install
npm test -- --run
npm run build:wind:loja
npm start
```

Antes do build, crie o `.env` a partir de `.env.exemple` e configure o SQL Server (`LOCAL_DATABASE=sql_server`). O `npm run build:wind:loja` compila e copia SQL e configuração para `dist.loja`. O `npm start` apenas executa `dist.loja/src/server.js`; não compila. Em desenvolvimento, `npm run dev` sobe o TypeScript direto. Passo a passo: [execução e diagnóstico](./docs/operacao.md).

O aplicativo Windows está em `apps/desktop`. Ele administra o mesmo servidor e não abre o banco pela tela.
