<!-- 65fcde0c-aab2-4aef-bf7a-04b44aae3724 357b81b1-a0ee-400c-be45-2e195f30b1f7 -->

# Sistema de Emissões Periódicas e Eventos Broadcast Socket.IO

## Visão Geral

Sistema automático para emissões periódicas de eventos via Socket.IO. O sistema:

- Inicia automaticamente com o servidor
- Emite dados a cada 8 segundos para todos os clientes conectados
- Usa formatos otimizados sem campo `Session` para broadcasts
- Trata erros sem quebrar a aplicação

## Arquitetura Implementada

### Arquivos Criados

```
src/
├── contracts/
│   └── periodic.listen.contract.ts             ✅ Interface com métodos de controle
├── model/
│   ├── expedicao.basic.listen.event.ts         ✅ Evento para consultas broadcast (Data)
│   └── expedicao.mutation.listen.event.ts      ✅ Evento para mutations broadcast (Mutation)
└── services/
    ├── base.periodic.listen.service.ts         ✅ Classe base abstrata reutilizável
    └── separar.periodic.listen.service.ts      ✅ Implementação específica para Separar
```

### Arquivos Modificados

```
src/
├── aplication/
│   ├── app.ts                                  ✅ Ajustes de inicialização
│   ├── app.api.ts                              ✅ Método getIO() adicionado
│   └── app.linstens.ts                         ✅ Listener periódico iniciado
└── socket/
    ├── separar/
    │   └── separar.event.ts                    ✅ Usa ExpedicaoMutationListenEvent
    ├── separar.item/
    │   └── separar.item.event.ts               ✅ Usa ExpedicaoMutationListenEvent
    └── separacao.item/
        └── separacao.item.event.ts             ✅ Usa ExpedicaoMutationListenEvent
```

## Componentes Principais

### 1. PeriodicListenContract

**Arquivo:** `src/contracts/periodic.listen.contract.ts`

Interface que define os métodos de controle:

- `start()` - Inicia as emissões periódicas
- `stop()` - Para completamente as emissões
- `pause()` - Pausa temporariamente (mantém o timer)
- `resume()` - Retoma as emissões
- `isRunning()` - Verifica se está executando
- `isPaused()` - Verifica se está pausado
- Estende `ListenContract`

### 2. BasePeriodicListenService

**Arquivo:** `src/services/base.periodic.listen.service.ts`

Classe abstrata que implementa toda a lógica genérica:

- Gerenciamento de intervalos (timers)
- Controles de estado (running, paused)
- Tratamento de erros automático (não quebra a aplicação)
- Limpeza de recursos
- Método abstrato `emitData()` para implementação específica

### 3. ExpedicaoBasicListenEvent

**Arquivo:** `src/model/expedicao.basic.listen.event.ts`

Evento otimizado para consultas periódicas broadcast:

- **Campos**: `ResponseIn` e `Data`
- **Sem campo Session**: Desnecessário para broadcasts
- **Uso**: Emissões periódicas de consultas

```typescript
{
  ResponseIn: string;
  Data: string[];
}
```

### 4. ExpedicaoMutationListenEvent

**Arquivo:** `src/model/expedicao.mutation.listen.event.ts`

Evento otimizado para mutations broadcast:

- **Campos**: `ResponseIn` e `Mutation`
- **Sem campo Session**: Desnecessário para broadcasts
- **Uso**: Notificar insert/update/delete

```typescript
{
  ResponseIn: string;
  Mutation: string[];
}
```

### 5. SepararPeriodicListenService

**Arquivo:** `src/services/separar.periodic.listen.service.ts`

Implementação específica para emissão periódica de dados de separação:

- **Intervalo**: 8 segundos (8000ms)
- **Consulta**: Últimos 20 registros
- **Ordenação**: `CodEmpresa DESC, CodSepararEstoque DESC`
- **Evento emitido**: `separar.consulta.listen`
- **Formato**: `ExpedicaoBasicListenEvent`
- **Início**: Automático com o servidor
- **Tratamento de erros**: Não quebra aplicação, apenas loga

## Eventos Emitidos Atualmente

### Eventos Periódicos (Timer 8s)

| Evento                    | Arquivo                              | Formato                     | Frequência |
| ------------------------- | ------------------------------------ | --------------------------- | ---------- |
| `separar.consulta.listen` | `separar.periodic.listen.service.ts` | `ExpedicaoBasicListenEvent` | 8 segundos |

### Eventos de Mutations - Separar.Item

**Arquivo:** `src/socket/separar.item/separar.item.event.ts`

| Operação | Evento                       | Formato                        |
| -------- | ---------------------------- | ------------------------------ |
| Insert   | `separar.item.insert.listen` | `ExpedicaoMutationListenEvent` |
| Update   | `separar.item.update.listen` | `ExpedicaoMutationListenEvent` |
| Delete   | `separar.item.delete.listen` | `ExpedicaoMutationListenEvent` |

### Eventos de Mutations - Separar

**Arquivo:** `src/socket/separar/separar.event.ts`

| Operação | Evento                  | Formato                        |
| -------- | ----------------------- | ------------------------------ |
| Insert   | `separar.insert.listen` | `ExpedicaoMutationListenEvent` |
| Update   | `separar.update.listen` | `ExpedicaoMutationListenEvent` |
| Delete   | `separar.delete.listen` | `ExpedicaoMutationListenEvent` |

### Eventos de Mutations - Separacao.Item

**Arquivo:** `src/socket/separacao.item/separacao.item.event.ts`

| Operação | Eventos Emitidos                                                        | Formato                        |
| -------- | ----------------------------------------------------------------------- | ------------------------------ |
| Insert   | `separacao.item.insert.listen`<br>`separar.item.consulta.update.listen` | `ExpedicaoMutationListenEvent` |
| Update   | `separacao.item.update.listen`<br>`separar.item.consulta.update.listen` | `ExpedicaoMutationListenEvent` |
| Delete   | `separacao.item.delete.listen`<br>`separar.item.consulta.update.listen` | `ExpedicaoMutationListenEvent` |

## Inicialização Automática

**Arquivo:** `src/aplication/app.linstens.ts`

```typescript
private listenSepararPeriodic() {
  const separarPeriodicService = new SepararPeriodicListenService(this.io);
  separarPeriodicService.start();
  console.log('Serviço de emissão periódica de Separar iniciado automaticamente');
}
```

O serviço é iniciado automaticamente quando o servidor é iniciado.

## Tratamento de Erros

Se ocorrer erro na consulta ao banco de dados:

- ✅ **Não quebra a aplicação**
- ✅ **Loga o erro no console**
- ✅ **Continua tentando nos próximos 8 segundos**

```typescript
catch (error: any) {
  console.error('[SepararPeriodicListenService] Erro ao consultar/emitir dados:', error.message);
  // Não propaga o erro para não interromper o timer
}
```

## Formato dos Eventos

### Para Consultas Periódicas

```json
{
  "ResponseIn": "separar.consulta.listen",
  "Data": [
    // Array com últimos 20 registros (toJson())
  ]
}
```

### Para Mutations

```json
{
  "ResponseIn": "separar.insert.listen",
  "Mutation": [
    // Array com registros inseridos/atualizados/deletados (toJson())
  ]
}
```

## Como Usar no Cliente

### Receber Dados Periódicos

```javascript
socket.on('separar.consulta.listen', (data) => {
  const event = JSON.parse(data);
  console.log('Dados periódicos:', event.Data);
  // event.Data contém array com últimos 20 registros
});
```

### Receber Notificações de Mutations

```javascript
// Separar.Item
socket.on('separar.item.insert.listen', (data) => {
  const event = JSON.parse(data);
  console.log('Item inserido:', event.Mutation);
});

// Separar
socket.on('separar.insert.listen', (data) => {
  const event = JSON.parse(data);
  console.log('Separação inserida:', event.Mutation);
});

// Separacao.Item
socket.on('separacao.item.insert.listen', (data) => {
  const event = JSON.parse(data);
  console.log('Item separação inserido:', event.Mutation);
});

socket.on('separar.item.consulta.update.listen', (data) => {
  const event = JSON.parse(data);
  console.log('Item atualizado:', event.Mutation);
});
```

## Criar Novo Listener Periódico

Para adicionar um novo listener periódico (exemplo: `conferir.consulta`):

### 1. Criar Serviço Específico

```typescript
// src/services/conferir.periodic.listen.service.ts
import { Server as SocketIOServer } from 'socket.io';
import { Pagination, OrderBy } from '../contracts/local.base.params';

import BasePeriodicListenService from './base.periodic.listen.service';
import ExpedicaoBasicListenEvent from '../model/expedicao.basic.listen.event';
import ConferirRepository from '../socket/conferir/conferir.repository';

export default class ConferirPeriodicListenService extends BasePeriodicListenService {
  private repository: ConferirRepository;
  private io: SocketIOServer;

  constructor(io: SocketIOServer, intervalTime: number = 10000) {
    super(intervalTime);
    this.io = io;
    this.repository = new ConferirRepository();
  }

  protected async emitData(): Promise<void> {
    try {
      const pagination = Pagination.create(20, 0, 1);
      const orderBy = OrderBy.create('SeuCampo', 'DESC');

      const result = await this.repository.consulta([], pagination, orderBy);

      const event = new ExpedicaoBasicListenEvent({
        ResponseIn: 'conferir.consulta.listen',
        Data: result.map((item) => item.toJson()),
      });

      this.io.emit('conferir.consulta.listen', JSON.stringify(event.toJson()));
    } catch (error: any) {
      console.error('[ConferirPeriodicListenService] Erro:', error.message);
    }
  }
}
```

### 2. Registrar no AppLinstens

```typescript
// src/aplication/app.linstens.ts
import ConferirPeriodicListenService from '../services/conferir.periodic.listen.service';

private listenConferirPeriodic() {
  const conferirPeriodicService = new ConferirPeriodicListenService(this.io, 10000);
  conferirPeriodicService.start();
  console.log('Serviço de emissão periódica de Conferir iniciado automaticamente');
}

execute() {
  // ... outros listens
  this.listenConferirPeriodic();
}
```

## Benefícios da Arquitetura

1. ✅ **Automático**: Inicia com o servidor, sem necessidade de configuração
2. ✅ **Reutilizável**: Classe base para qualquer listener periódico
3. ✅ **Resiliente**: Erros não quebram a aplicação
4. ✅ **Escalável**: Fácil adicionar novos listeners
5. ✅ **Otimizado**: Formatos específicos sem dados desnecessários
6. ✅ **Manutenível**: Separação clara de responsabilidades
7. ✅ **Global**: Emite para todos os clientes conectados

## Pendências e Melhorias Futuras

### Pendências

- [x] Migrar `separacao.item.event.ts` para usar `ExpedicaoMutationListenEvent` ✅ Completo
- [x] Remover campo `Session` dos eventos listen em `separacao.item.event.ts` ✅ Completo

### Melhorias Sugeridas

- [ ] Adicionar configuração de intervalo via variável de ambiente
- [ ] Implementar sistema de prioridade para eventos
- [ ] Adicionar métricas de performance (quantos eventos emitidos, tempo de resposta)
- [ ] Implementar cache para reduzir consultas ao banco
- [ ] Adicionar testes unitários para os serviços periódicos

## Status do Projeto

| Componente                       | Status      | Observação          |
| -------------------------------- | ----------- | ------------------- |
| Interface PeriodicListenContract | ✅ Completo | -                   |
| BasePeriodicListenService        | ✅ Completo | -                   |
| ExpedicaoBasicListenEvent        | ✅ Completo | Formato sem Session |
| ExpedicaoMutationListenEvent     | ✅ Completo | Formato sem Session |
| SepararPeriodicListenService     | ✅ Completo | Emite a cada 8s     |
| Integração AppLinstens           | ✅ Completo | Início automático   |
| separar.item.event.ts            | ✅ Migrado  | Usa novo formato    |
| separar.event.ts                 | ✅ Migrado  | Usa novo formato    |
| separacao.item.event.ts          | ✅ Migrado  | Usa novo formato    |
| Documentação                     | ✅ Completo | Este arquivo        |

## Logs do Sistema

```
Serviço de emissão periódica de Separar iniciado automaticamente
[SepararPeriodicListenService] Iniciado com intervalo de 8000ms
[SepararPeriodicListenService] Emitido 20 registros
[SepararPeriodicListenService] Erro ao consultar/emitir dados: Connection timeout
[SepararPeriodicListenService] Emitido 20 registros
```

## Resumo de Eventos

**Total de eventos .listen emitidos:** 10

- 1 evento periódico (timer 8s)
- 3 eventos separar.item (insert/update/delete)
- 3 eventos separar (insert/update/delete)
- 6 eventos separacao.item (3 operações × 2 eventos cada)

**Formatos utilizados:**

- `ExpedicaoBasicListenEvent`: 1 evento (periódico)
- `ExpedicaoMutationListenEvent`: 12 eventos (separar + separar.item + separacao.item) ✅
