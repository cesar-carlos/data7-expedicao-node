# AGENTS

Este arquivo e um ponto de entrada para agentes e colaboradores que vao trabalhar neste repositorio.

## Fonte oficial das regras

As regras do projeto ficam em `.cursor/rules/`.
Leia primeiro:

1. `.cursor/rules/governance.mdc`
2. `.cursor/rules/architecture.mdc`
3. `.cursor/rules/project_structure.mdc`

Depois carregue as rules especificas conforme a area alterada, como `express_api.mdc`, `websocket_api.mdc`, `security.mdc`, `testing.mdc` e `typescript.mdc`.

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
