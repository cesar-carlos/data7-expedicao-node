# Rotas HTTP

Login, usuários do ERP, versão do app, health, notify e monitor. Carrinho, separar e conferir **não** passam por aqui — [Socket.IO](../socket/README.md).

Visão dos canais: [comunicação](../comunicacao.md). Envelope de lista: [consulta HTTP](../contratos/consulta-http.md).

## Leia nesta ordem

1. [Login do aplicativo](./login-app.md) — criar, entrar, consultar, atualizar
2. [Usuários do ERP](./usuario-consulta.md) — `GET /usuarios`
3. [Consulta HTTP](../contratos/consulta-http.md) — `Page` / `Offset` / `Limit`, health, notify, monitor
4. [Proteções para os coletores](../socket/protecoes-cliente.md) — canal de emergência (`POST /internal/sockets/emergencia` é loopback; o app só escuta Socket.IO)

## Rotas gerais legadas

Além das rotas de lista e login, `src/controllers/geral/router.geral.ts` registra:

| Método | Caminho | Comportamento |
| --- | --- | --- |
| `GET` | `/` | Texto `Data7 API`, registrado em `src/route/api.router.ts` |
| `GET` | `/expedicao` | `{ "message": "Expedição API" }` |
| `GET` | `/sequencia/:nome` | Obtém o próximo valor da sequência e devolve `{ Nome, Valor }` |
| `GET` | `/sequencia` | Também registrado, mas não fornece o nome exigido pela operação; use o caminho com `:nome` |
| `POST`, `PUT`, `DELETE` | `/sequencia` | 501 `NOT_IMPLEMENTED` |
| `GET` | `/processoExecutavel` | Array de processos, ordenado por `DataAbertura` decrescente; query vira filtros de igualdade |
| `PUT` | `/processoExecutavel/:CodProcessoExecutavel` | Atualiza registro existente; sucesso 201 sem corpo, código inválido 400 e ausente 404 |
| `POST`, `DELETE` | `/processoExecutavel` | 501 `NOT_IMPLEMENTED` |

`GET /sequencia/:nome` executa `NEXT VALUE FOR`: avança a sequência, apesar de usar GET. Não é uma sonda de saúde. Essas rotas legadas não usam o envelope paginado `message/data/total` de usuários, login e versão, nem a mesma validação Zod de query.

`GET /health` é uma resposta estática, sem teste do banco. Inicialização, configuração e diagnóstico: [operação](../operacao.md).
