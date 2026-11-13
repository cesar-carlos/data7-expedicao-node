# Medições reproduzíveis de consultas

Benchmark local da Fase 0, sem mudança em produção. Implementação: `test/performance/consultas.benchmark.ts`. Referência histórica de seis cenários: [medicoes-consultas.json](./medicoes-consultas.json). Execução ampliada, com nove cenários: [medicoes-consultas-ampliadas.json](./medicoes-consultas-ampliadas.json). Os arquivos são evidências de execução, não limites de aprovação nem demonstração de ganho de desempenho.

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

Cada cenário recebe cinco rodadas de aquecimento, descartadas, e 30 amostras medidas com `performance.now()`. A ordem dos cenários é rotacionada entre rodadas. As fixtures têm 20, 500 ou 1500 linhas determinísticas, sem números aleatórios. Logs são limitados a erro e `SQL_LOCK_TIMEOUT_MS` é fixado em 5000 somente no processo do benchmark.

| Cenário | Trabalho por amostra | Verificação obrigatória |
| --- | --- | --- |
| `query-helper-equality` | 100 chamadas reais de `executeSelectWhere`, dois filtros de igualdade e página 20 | 100 chamadas ao adaptador simulado, 400 binds incluindo paginação |
| `query-helper-in-500` | 100 chamadas do helper, `IN` com 500 códigos e página 20 | 100 chamadas ao adaptador simulado, 50200 binds incluindo paginação |
| `socket-shared` | 20 pedidos simultâneos idênticos no mesmo socket simulado | Uma execução do handler, 20 respostas |
| `socket-distinct` | 20 pedidos simultâneos com filtros diferentes no mesmo socket | 20 execuções, 20 respostas |
| `socket-separate-sockets` | 20 pedidos idênticos em sockets diferentes | 20 execuções, 20 respostas |
| `socket-sequential` | 20 pedidos idênticos, um após o término do anterior | 20 execuções; deduplicação não vira cache |
| `query-helper-mixed-page-3` | 100 chamadas com igualdade, LIKE, BETWEEN e IS NULL; limite 100, offset 200, página 3 e ordem DESC | 100 chamadas, 600 binds incluindo paginação |
| `socket-distinct-rows-500` | 20 pedidos com filtros distintos e 500 linhas por resposta | 20 execuções, 20 respostas completas |
| `socket-distinct-rows-1500` | 20 pedidos com filtros distintos e 1500 linhas por resposta | 20 execuções, 20 respostas completas |

Os volumes maiores exercitam serialização com a mesma estrutura de linha sintética; não representam a distribuição real de payloads em produção. O helper misto continua recebendo 20 linhas do adaptador simulado: ele mede preparação da consulta paginada, não paginação feita por um banco real. O relatório ampliado informa `rowsPerResponse` por cenário; o valor global 20 permanece como padrão para compatibilidade com a referência antiga.

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

```powershell
npm run bench:consultas:compare -- docs/feature/medicoes-consultas.json docs/feature/medicoes-consultas-ampliadas.json
```

O comparador lê dois JSONs locais e escreve diferenças de mediana e p95, em milissegundos e percentuais, calculadas como depois menos antes. Percentual contra uma referência zero é `null`. `sourceChanged` e `revisionChanged` identificam mudanças dos fontes e da revisão. Cenários adicionados ou removidos são listados, sem comparação entre nomes diferentes.

Diferenças de ambiente, configuração ou trabalho por cenário geram avisos; `comparable: false` indica essas incompatibilidades. `comparable: true` significa apenas que os metadados verificados coincidem, não significância estatística nem condições idênticas de carga da máquina. Mudanças no conjunto de cenários também podem afetar aquecimento e coleta de lixo. Repita as medições antes de concluir que houve regressão ou melhoria.

O comando aceita relatórios de versão 1, incluindo a referência antiga sem `rowsPerResponse` por cenário. JSON inválido, números negativos/não finitos, nomes duplicados e versão incompatível encerram com erro. Variações de tempo e avisos de comparação não causam falha automática. Não há acesso à rede ou ao banco.

Use a mesma versão do Node, lockfile, máquina e parâmetros, com carga de fundo semelhante. Guarde os relatórios antes/depois em arquivos separados. O JSON registra versão do Node, sistema, arquitetura, CPU, revisão Git e `sourceSha256` dos fontes TypeScript de `src`, script do benchmark, `package.json` e lockfile. O hash também identifica mudanças locais ainda não commitadas e normaliza CRLF/LF.

Tempos variam por JIT, coleta de lixo e escalonamento. O procedimento e os dados são reproduzíveis; os valores não serão idênticos. Examine mediana, p95 e amostras brutas, repetindo execuções para investigar uma regressão. Operações por segundo aqui não são capacidade da API de produção.

SQL Server, plano de execução, locks, rede, clientes Flutter e triggers precisam de medição separada em ambiente próprio. Este benchmark não modifica SQL, índices, paginação, timeouts da aplicação ou contratos públicos.
