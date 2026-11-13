# Escuta de separação

Com o servidor no ar, o processo consulta a separação e emite o evento Socket.IO `separar.consulta.listen` para os clientes conectados.

Catálogo das consultas pedidas pelo cliente (`separar.consulta`, itens, setor): [separar](./separar.md). Listen de mutação (`separar.update.listen`, conferência): [listen](./listen.md). Este timer **não** substitui o `separar.update.listen` do Finalizar Carrinho.

Esta escuta **não** usa a página padrão 1500 das consultas. Contrato de página: [paginação](../contratos/paginacao.md). Canal e envelope: [comunicação](../comunicacao.md).

O intervalo padrão é 8 segundos e o limite padrão é 20 registros. Os dois valores vêm do ambiente:

| Variável | Padrão | Limite |
| --- | --- | --- |
| `SEPARAR_LISTEN_ENABLED` | ligado | `false`, `0`, `no` ou `off` desliga |
| `SEPARAR_LISTEN_INTERVAL_MS` | 8000 | 1000 a 86400000 |
| `SEPARAR_LISTEN_LIMIT` | 20 | 1 a 500 |
| `SEPARAR_LISTEN_DEBUG` | desligado | `true`, `1`, `yes` ou `on` liga o log de deduplicação |

Comportamento do timer (`SepararPeriodicListenService`):

- Sem clientes no namespace padrão, **não** consulta o banco.
- Uma página global de até `SEPARAR_LISTEN_LIMIT` linhas. Ordem: `CodEmpresa ASC`, `CodSepararEstoque DESC`. `Where` vazio. Mesmo SQL de `separar.consulta` (`expedicao.separar.consulta.sql`): `OUTER APPLY` depois da base, `OFFSET/FETCH` no mesmo nível. [Separar](./separar.md).
- Payload idêntico ao tick anterior (hash SHA-256) não é emitido de novo, salvo quando volta a haver cliente depois de um período sem ninguém.
- Uma execução por vez. Falha registra e aplica backoff exponencial (até 120 s). O timer **não** cancela a request SQL no disconnect do socket. O `SELECT` usa o mesmo `SET LOCK_TIMEOUT` das listas (`SQL_LOCK_TIMEOUT_MS`, padrão 5 s) e cancela a request se o Node estourar o timeout.
- Várias instâncias Node (PM2 cluster / réplicas) cada uma tem o próprio timer.

Timeout de 30 s nesta consulta chega ao cliente como `[SQL-CONN] Falha de conexao com o banco.` O diagnóstico no log é `Timeout: Request failed to complete in 30000ms` — a request não terminou; o pool pode continuar saudável (`GET /usuarios` rápido). Não subir `SQL_REQUEST_TIMEOUT_MS`: a sessão segura lock por mais tempo. [Erros](../expedicao/erros.md).

O desligamento do processo encerra o timer.

O cliente escuta o evento e **usa o `Data`**. Disparar outra `separar.consulta` no mesmo tick empilha a query pesada com o timer. A conexão do socket não exige token. O corpo é JSON string `{ "Data": [ … ] }`.

```javascript
socket.on('separar.consulta.listen', (payload) => {
  const event = typeof payload === 'string' ? JSON.parse(payload) : payload;
  console.log(event.Data);
});
```
