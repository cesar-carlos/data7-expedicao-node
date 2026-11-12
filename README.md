# Data7 Expedição

Servidor Node.js 24–26 da expedição. A API atende HTTP e Socket.IO no SQL Server, na mesma porta.

A documentação fica em [`docs/`](./docs/README.md). Comece por [`docs/comunicacao.md`](./docs/comunicacao.md).

```bash
npm install
npm test
npm start
```

O `npm start` compila com `tsc` e sobe `dist.loja`. Em desenvolvimento, `npm run dev` sobe o TypeScript direto. As variáveis ficam no `.env`; o modelo é `.env.exemple`.

O aplicativo Windows está em `apps/desktop`. Ele administra o mesmo servidor e não abre o banco pela tela.
