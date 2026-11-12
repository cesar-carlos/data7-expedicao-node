# Rotas HTTP

Login, usuários do ERP, versão do app, health, notify e monitor. Carrinho, separar e conferir **não** passam por aqui — [Socket.IO](../socket/README.md).

Visão dos canais: [comunicação](../comunicacao.md). Envelope de lista: [consulta HTTP](../contratos/consulta-http.md).

## Leia nesta ordem

1. [Login do aplicativo](./login-app.md) — criar, entrar, consultar, atualizar
2. [Usuários do ERP](./usuario-consulta.md) — `GET /usuarios`
3. [Consulta HTTP](../contratos/consulta-http.md) — `Page` / `Offset` / `Limit`, health, notify, monitor
