# AGENTS

Este arquivo e um ponto de entrada para agentes e colaboradores que vao trabalhar neste repositorio.

## Fonte oficial das regras

As regras do projeto ficam em `.cursor/rules/`.
Leia primeiro:

1. `.cursor/rules/governance.mdc`
2. `.cursor/rules/architecture.mdc`
3. `.cursor/rules/project_structure.mdc`

Depois carregue as rules especificas conforme a area alterada, como `express_api.mdc`, `websocket_api.mdc`, `security.mdc`, `testing.mdc` e `typescript.mdc`.

## Dominio de expedicao

Indice da documentacao: `docs/README.md`. Como o cliente fala com o processo: `docs/comunicacao.md`.

Regras de separacao, conferencia, situacoes, triggers, erros e indices ficam em `docs/expedicao/`.
Comece por `docs/expedicao/README.md` e `docs/expedicao/regras.md` antes de alterar fluxo de carrinho, conferir ou tratamento de erro dessas consultas. O formato `[50014] mensagem` esta em `docs/expedicao/erros.md`. Indices de `WHERE`: `docs/expedicao/indices.md` (scripts `07`/`08`/`09` em `D:\Developer\Data7\Expedicao\Expedicao Correcoes`). Erro FireDAC 1934 `ANSI_WARNINGS` em `dbo.Produto`: rode o `07`. 1934 em `Conferir`: UX filtrado (`03`) — triggers `01`/`02`/`04`/`05`/`06` ficam com `ANSI_WARNINGS ON`. SQL 334 no insert de estagio: Node precisa de `OUTPUT … INTO` (script `06`). `ConferirResumo` e gravado pela `02` (grade do ERP). O arquivo `trigger & procedure\10` esta incompleto. Pacote unico para aplicar na Estacao: `RODAR.sql` (ordem dos pedacos = prefixo `00 -` … `09 -`).

Contratos de paginacao e consulta (Where, LIMIT 1500, envelope Socket.IO, HTTP) ficam em `docs/contratos/`.
Comece por `docs/contratos/README.md` antes de alterar helper de consulta, `Pagination`, `Params` ou eventos `*.consulta`. `Where` das consultas e lista `{ key, value }` (o coletor deve mandar isso) ou string SQL legado (`QueryBuilder.buildSqlWhere()`). String SQL gera warn `Consulta Where em SQL cru` e **nao** `Error` no Socket; no painel Windows stderr vira aba Erros. Contrato e Dart: `docs/contratos/where.md`.

Rotas HTTP de login e usuarios: `docs/http/`. Comece por `docs/http/README.md`.

Catalogo dos eventos Socket.IO (`*.consulta`, `*.select`, mutacao, `*.listen`) fica em `docs/socket/`.
Comece por `docs/socket/README.md` e `docs/socket/consultas.md` antes de incluir, renomear ou alterar handler em `src/socket/`. Listen emitido pelo servidor: `docs/socket/listen.md` (nao unificar payload; trigger 02 nao emite `conferir.insert.listen`). Escuta periodica: `docs/socket/escuta.md`. Canal de emergencia e o que ja esta no servidor vs o que ainda nao: `docs/socket/protecoes-cliente.md` (para agentes dos Flutter). Planos futuros (kick automatico, RCSI, breaking): `docs/feature/`. Registro: `src/aplication/app.socket.config.ts`.

## Contexto atual do repositorio

- Projeto legado em `Node.js + TypeScript`.
- Entrypoint principal em `src/server.ts`.
- Bootstrap e composicao da aplicacao em `src/aplication/`.
- HTTP em `src/route/`, `src/controllers/`, `src/middleware/` e `src/validation/`.
- Socket.IO em `src/socket/`.
- Persistencia e integracoes em `src/repository/`, `src/infra/`, `src/dependency/` e `src/sql/`.
- Testes em `test/`.

## Diretriz de refactor

- Refatore de forma incremental.
- Preserve contratos REST e Socket.IO existentes, a menos que a tarefa inclua mudanca de contrato.
- Nao introduza pastas paralelas para o mesmo papel sem plano de migracao.
- Considere `src/aplication/` como o nome canonico atual ate que uma renomeacao dedicada seja aprovada.

## Indice das rules

- `.cursor/rules/governance.mdc`: precedencia, excecoes e verificacoes finais.
- `.cursor/rules/architecture.mdc`: fluxo de dependencias e organizacao do runtime.
- `.cursor/rules/project_structure.mdc`: mapa da estrutura real deste repositorio.
- `.cursor/rules/project_stack.mdc`: bibliotecas e convencoes do stack atual.
- `.cursor/rules/typescript.mdc`: seguranca e estilo em TypeScript.
- `.cursor/rules/coding_standards.mdc`: padroes gerais de legibilidade e manutencao.
- `.cursor/rules/domain_layer.mdc`: limites entre dominio, servicos, contratos e repositorios.
- `.cursor/rules/express_api.mdc`: convencoes para Express e rotas HTTP.
- `.cursor/rules/websocket_api.mdc`: convencoes para Socket.IO e eventos.
- `.cursor/rules/security.mdc`: validacao, segredos, autenticacao e logging seguro.
- `.cursor/rules/testing.mdc`: estrategia de testes com Vitest.
- `.cursor/rules/performance.mdc`: cuidados de desempenho no runtime Node.js.
