# Escuta de separação

Com o servidor no ar, o processo consulta a separação e emite o evento Socket.IO `separar.consulta.listen` para os clientes conectados.

O intervalo padrão é 8 segundos e o limite padrão é 20 registros. Os dois valores vêm do ambiente:

| Variável | Padrão | Limite |
| --- | --- | --- |
| `SEPARAR_LISTEN_ENABLED` | ligado | `false`, `0`, `no` ou `off` desliga |
| `SEPARAR_LISTEN_INTERVAL_MS` | 8000 | 1000 a 86400000 |
| `SEPARAR_LISTEN_LIMIT` | 20 | 1 a 500 |
| `SEPARAR_LISTEN_DEBUG` | desligado | `true`, `1`, `yes` ou `on` liga o log de deduplicação |

Uma falha na consulta é registrada e o timer continua. O desligamento do processo encerra o timer.

O cliente escuta o evento. A conexão do socket não exige token.

```javascript
socket.on('separar.consulta.listen', (payload) => {
  const event = typeof payload === 'string' ? JSON.parse(payload) : payload;
  console.log(event.Data);
});
```
