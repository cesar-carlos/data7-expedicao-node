# Features e planos de evolução

Item 5 concluído (2026-11-13): corrigida a sobreposição de emissões em `stop/start` da mesma instância e a conclusão prematura de chamadas concorrentes de `closePool()`. São correções de coordenação interna, descritas no [plano da Fase 0](./protecao-base-e-emergencia.md); contratos HTTP/Socket.IO e operação normal preservados. Suíte após esta etapa: 248 aprovados e 8 ignorados.

Complemento anterior da Fase 0, itens 1 a 4 (2026-11-13): testes de agendamento periódico e recuperação do pool, comparador local de relatórios e benchmark ampliado para nove cenários. Veja [medições e comparação](./desempenho-consultas.md). Aquela etapa alterou somente testes, ferramentas de desenvolvimento e documentação; nenhum arquivo de produção em `src/` foi alterado nos itens 1 a 4.

Esta pasta separa recursos presentes no código de propostas ainda não implementadas. Revisão do código local: **2026-11-13**. Isso não confirma implantação em produção, configuração da base ou versão publicada dos coletores. Contrato vigente: [comunicação](../comunicacao.md) e [socket](../socket/README.md).

| Plano | Estado | Dono |
| --- | --- | --- |
| [Proteção da base, canal de emergência e disconnect](./protecao-base-e-emergencia.md) | Proteções de consulta, aviso e desconexão manual presentes no Node. Desconexão automática não implementada. Estado Flutter baseado no registro externo de 2026-11-13; validar builds publicados. | Este repositório + Flutter + DBA da `Estacao` |

Melhorias internas implementadas nesta revisão: limpeza de timers de emergência no encerramento da API; ampliação dos testes de emergência, deduplicação e cancelamento SQL; [benchmark reproduzível de consultas](./desempenho-consultas.md) com persistência simulada. Rotas, eventos, envelopes, prazos e destinatários durante operação foram preservados. Propostas de mudança de contrato, autenticação, limites ou desconexão automática permanecem fora do escopo autorizado.

Guia que os agentes dos coletores já podem seguir: [proteções-cliente](../socket/protecoes-cliente.md). Contrato do `Where` (lista `{ key, value }`, Dart, warn ≠ erro): [Where](../contratos/where.md).
