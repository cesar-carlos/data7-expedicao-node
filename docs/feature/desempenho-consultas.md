# Medições reproduzíveis de consultas

Benchmark local da Fase 0, sem mudança em produção. Implementação: `test/performance/consultas.benchmark.ts`. Relatório de referência: [medicoes-consultas.json](./medicoes-consultas.json).

## Executar

Na raiz do repositório, com dependências instaladas pelo lockfile:

```powershell
npm run bench:consultas -- --samples 30 --warmup 5
```

Sem `--output`, o processo escreve o relatório JSON na saída. Para salvar uma execução separada:

```powershell
npm run bench:consultas -- --samples 30 --warmup 5 --output "$env:TEMP\data7-consultas-benchmark.json"
```

`--output` cria a pasta se necessário e sobrescreve o arquivo indicado. O benchmark não faz parte de `npm test`; não inicia HTTP/Socket.IO, não carrega `.env` e não conecta ao banco. Usa as bibliotecas instaladas e executa TypeScript com verificação de tipos via `ts-node`.

## Método e cenários

Cada cenário recebe cinco rodadas de aquecimento, descartadas, e 30 amostras medidas com `performance.now()`. A ordem dos cenários é rotacionada entre rodadas. A fixture tem 20 linhas determinísticas, sem números aleatórios. Logs são limitados a erro e `SQL_LOCK_TIMEOUT_MS` é fixado em 5000 somente no processo do benchmark.

| Cenário | Trabalho por amostra | Verificação obrigatória |
| --- | --- | --- |
| `query-helper-equality` | 100 chamadas reais de `executeSelectWhere`, dois filtros de igualdade e página 20 | 100 chamadas ao adaptador simulado, 400 binds incluindo paginação |
| `query-helper-in-500` | 100 chamadas do helper, `IN` com 500 códigos e página 20 | 100 chamadas ao adaptador simulado, 50200 binds incluindo paginação |
| `socket-shared` | 20 pedidos simultâneos idênticos no mesmo socket simulado | Uma execução do handler, 20 respostas |
| `socket-distinct` | 20 pedidos simultâneos com filtros diferentes no mesmo socket | 20 execuções, 20 respostas |
| `socket-separate-sockets` | 20 pedidos idênticos em sockets diferentes | 20 execuções, 20 respostas |
| `socket-sequential` | 20 pedidos idênticos, um após o término do anterior | 20 execuções; deduplicação não vira cache |

Os cenários Socket usam `withSocketRequest`, parser, deduplicação e serialização reais. O socket apenas coleta os emits; o handler simula persistência com `setImmediate`, garantindo uma passagem pelo event loop sem inserir atraso fixo. Os cenários do helper usam `pool.request().input()/query()` simulados: medem preparação e binds, não execução SQL.

Depois de cada amostra, fora do intervalo medido, o script verifica contagem de execuções, binds, respostas, `ResponseIn` e dados serializados. Divergência encerra com código diferente de zero. Não há limite de tempo usado como critério de aprovação.

O tempo inclui criação das fixtures por amostra, processamento e serialização. Não inclui carregamento dos módulos, verificação de tipos nem as assertions finais. O relatório contém mediana, p95, operações por segundo derivadas da mediana e todas as amostras brutas em milissegundos.

## Referência inicial — 2026-11-13

Valores arredondados da execução salva; tempos são por **lote**, não por pedido individual:

| Cenário | Operações no lote | Mediana (ms) | p95 (ms) |
| --- | --- | --- | --- |
| Helper, igualdade | 100 | 0,788 | 1,721 |
| Helper, `IN` 500 | 100 | 3,913 | 5,055 |
| Socket, idênticos simultâneos | 20 | 0,228 | 1,076 |
| Socket, filtros distintos | 20 | 0,223 | 0,557 |
| Socket, sockets diferentes | 20 | 0,184 | 0,651 |
| Socket, sequenciais | 20 | 0,232 | 0,618 |

Não há custo de SQL real na fixture: reduzir 20 execuções para uma não implica redução proporcional no tempo sintético, e os cenários têm custos diferentes. Estes resultados não demonstram ganho de latência em produção.

## Comparar execuções

Use a mesma versão do Node, lockfile, máquina e parâmetros, com carga de fundo semelhante. Guarde os relatórios antes/depois em arquivos separados. O JSON registra versão do Node, sistema, arquitetura, CPU, revisão Git e `sourceSha256` dos fontes TypeScript de `src`, script do benchmark, `package.json` e lockfile. O hash também identifica mudanças locais ainda não commitadas e normaliza CRLF/LF.

Tempos variam por JIT, coleta de lixo e escalonamento. O procedimento e os dados são reproduzíveis; os valores não serão idênticos. Examine mediana, p95 e amostras brutas, repetindo execuções para investigar uma regressão. Operações por segundo aqui não são capacidade da API de produção.

SQL Server, plano de execução, locks, rede, clientes Flutter e triggers precisam de medição separada em ambiente próprio. Este benchmark não modifica SQL, índices, paginação, timeouts da aplicação ou contratos públicos.
