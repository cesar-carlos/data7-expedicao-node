# Sistema de Emissões Periódicas via Socket.IO

## Visão Geral

Sistema automático para emissões periódicas de eventos via Socket.IO. O sistema inicia automaticamente com o servidor e emite dados a cada 8 segundos para todos os clientes conectados.

## Arquitetura

### Arquivos Criados

```
src/
├── contracts/
│   └── periodic.listen.contract.ts             # Interface com métodos de controle
├── model/
│   ├── expedicao.basic.listen.event.ts         # Evento para consultas broadcast (Data)
│   └── expedicao.mutation.listen.event.ts      # Evento para mutations broadcast (Mutation)
└── services/
    ├── base.periodic.listen.service.ts         # Classe base abstrata reutilizável
    └── separar.periodic.listen.service.ts      # Implementação específica para Separar
```

### Componentes

#### 1. PeriodicListenContract

Interface que define os métodos de controle:

- `start()` - Inicia as emissões periódicas
- `stop()` - Para completamente as emissões
- `pause()` - Pausa temporariamente (mantém o timer)
- `resume()` - Retoma as emissões
- `isRunning()` - Verifica se está executando
- `isPaused()` - Verifica se está pausado

#### 2. BasePeriodicListenService

Classe abstrata que implementa toda a lógica genérica:

- Gerenciamento de intervalos (timers)
- Controles de estado (running, paused)
- Tratamento de erros automático (não quebra a aplicação)
- Limpeza de recursos
- Método abstrato `emitData()` para implementação específica

#### 3. Eventos para Listeners (Broadcast)

Modelos de evento específicos para emissões broadcast (mais simples, sem campo Session):

**ExpedicaoBasicListenEvent**

- **Uso**: Para consultas periódicas (ex: separar.consulta.listen)
- **Campos**: `ResponseIn` e `Data`
- **Formato Data**: Array de strings JSON

**ExpedicaoMutationListenEvent**

- **Uso**: Para notificar mutations (insert/update/delete)
- **Campos**: `ResponseIn` e `Mutation`
- **Formato Mutation**: Array de strings JSON

#### 4. SepararPeriodicListenService

Implementação específica para emissão periódica de dados de separação:

- **Intervalo**: 8 segundos (8000ms)
- **Consulta**: Últimos 20 registros
- **Ordenação**: `CodEmpresa DESC, CodSepararEstoque DESC`
- **Evento emitido**: `separar.consulta.listen`
- **Formato**: JSON com ExpedicaoBasicListenEvent
- **Início**: Automático com o servidor
- **Controle**: Apenas para quando o servidor parar

## Como Funciona

### Inicialização Automática

O serviço inicia automaticamente quando o servidor é iniciado através do `AppLinstens`:

```typescript
// Executado automaticamente ao iniciar o servidor
private listenSepararPeriodic() {
  const separarPeriodicService = new SepararPeriodicListenService(this.io);
  separarPeriodicService.start();
  console.log('Serviço de emissão periódica de Separar iniciado automaticamente');
}
```

### Emissão Global

A cada 8 segundos, o sistema emite automaticamente para **todos os clientes conectados**:

```javascript
io.emit('separar.consulta.listen', JSON.stringify(basicEvent.toJson()));
```

### Tratamento de Erros

Se ocorrer erro na consulta ao banco de dados:

- ✅ **Não quebra a aplicação**
- ✅ **Loga o erro no console**
- ✅ **Continua tentando nos próximos 8 segundos**

```typescript
private async executeEmit(): Promise<void> {
  try {
    await this.emitData();
  } catch (error: any) {
    console.error(`[${this.constructor.name}] Erro ao emitir dados:`, error.message);
    // Não interrompe o timer, apenas loga o erro
  }
}
```

## Como Usar

### Receber Dados Periódicos (Consultas)

No cliente, basta escutar o evento global de consultas periódicas:

```javascript
socket.on('separar.consulta.listen', (data) => {
  const event = JSON.parse(data);
  console.log('Dados recebidos:', event.Data);
  // event.Data contém array com últimos 20 registros
  // Formato: ExpedicaoBasicListenEvent { ResponseIn, Data }
});
```

### Receber Notificações de Mutations

No cliente, escute eventos de insert/update/delete:

```javascript
// Inserções
socket.on('separar.insert.listen', (data) => {
  const event = JSON.parse(data);
  console.log('Novo registro:', event.Mutation);
  // Formato: ExpedicaoMutationListenEvent { ResponseIn, Mutation }
});

// Atualizações
socket.on('separar.update.listen', (data) => {
  const event = JSON.parse(data);
  console.log('Registro atualizado:', event.Mutation);
});

// Exclusões
socket.on('separar.delete.listen', (data) => {
  const event = JSON.parse(data);
  console.log('Registro excluído:', event.Mutation);
});
```

### Formato dos Dados

#### ExpedicaoBasicListenEvent (Consultas Periódicas)

```json
{
  "ResponseIn": "separar.consulta.listen",
  "Data": [
    // Array com últimos 20 registros de separação (toJson())
    // Ordenados por CodEmpresa DESC, CodSepararEstoque DESC
  ]
}
```

#### ExpedicaoMutationListenEvent (Mutations)

```json
{
  "ResponseIn": "separar.insert.listen",
  "Mutation": [
    // Array com os registros inseridos/atualizados/deletados (toJson())
  ]
}
```

**Nota:** Ambos os formatos **não incluem o campo Session**, pois são emissões broadcast para todos os clientes conectados.

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
      // console.log(`[ConferirPeriodicListenService] Emitido ${result.length} registros`);
    } catch (error: any) {
      console.error('[ConferirPeriodicListenService] Erro ao consultar/emitir dados:', error.message);
      // Não propaga o erro para não interromper o timer
    }
  }
}
```

### 2. Registrar no AppLinstens

```typescript
// src/aplication/app.linstens.ts
import ConferirPeriodicListenService from '../services/conferir.periodic.listen.service';

export default class AppLinstens {
  constructor(private readonly io: SocketIOServer) {}

  execute() {
    this.listenCobrancaPix();
    this.listenRefleshCobrancaPix();
    this.listenSepararPeriodic();
    this.listenConferirPeriodic(); // Adicionar aqui
  }

  private listenConferirPeriodic() {
    const conferirPeriodicService = new ConferirPeriodicListenService(this.io, 10000);
    conferirPeriodicService.start();
    console.log('Serviço de emissão periódica de Conferir iniciado automaticamente');
  }
}
```

## Características de Segurança

1. **Tratamento de Erros Robusto**: Erros não interrompem o timer, apenas são logados
2. **Limpeza de Recursos**: Intervalos são limpos corretamente quando o servidor para
3. **Estado Consistente**: Controles verificam estado antes de executar ações
4. **Isolamento**: Cada listener é independente
5. **Execução Imediata**: Primeira emissão ocorre imediatamente ao iniciar
6. **Resiliência**: Se o banco falhar, o sistema continua tentando a cada intervalo

## Benefícios da Arquitetura

- ✅ **Automático**: Inicia com o servidor, sem necessidade de configuração
- ✅ **Reutilizável**: Classe base para qualquer listener periódico
- ✅ **Resiliente**: Erros não quebram a aplicação
- ✅ **Escalável**: Fácil adicionar novos listeners
- ✅ **Manutenível**: Separação clara de responsabilidades
- ✅ **Simples**: Sem controles complexos, apenas funciona
- ✅ **Global**: Emite para todos os clientes conectados

## Logs do Sistema

O sistema gera logs informativos:

```
Serviço de emissão periódica de Separar iniciado automaticamente
[SepararPeriodicListenService] Iniciado com intervalo de 8000ms
[SepararPeriodicListenService] Emitido 20 registros
[SepararPeriodicListenService] Emitido 20 registros
[SepararPeriodicListenService] Erro ao consultar/emitir dados: Connection timeout
[SepararPeriodicListenService] Emitido 20 registros
```

## Troubleshooting

### Listener não está emitindo dados

1. Verificar se o serviço foi iniciado no `AppLinstens`
2. Verificar logs do console para mensagens de início
3. Verificar se há erros de banco de dados nos logs

### Erros de consulta no banco

- ✅ O sistema continua funcionando mesmo com erros
- ✅ Erros são logados mas não interrompem o timer
- ✅ O sistema tenta novamente no próximo intervalo (8 segundos)
- ✅ Verificar conexão com o banco de dados

### Clientes não estão recebendo dados

- Verificar se o cliente está escutando o evento correto: `separar.consulta.listen`
- Verificar se a conexão Socket.IO está estabelecida
- Verificar logs do servidor para confirmar emissões

### Performance

Se houver muitos clientes conectados e as emissões estiverem pesadas:

- Considerar aumentar o intervalo de emissão (default: 8000ms)
- Considerar reduzir o número de registros consultados (default: 20)
- Adicionar cache para resultados frequentes
- Implementar paginação ou filtros específicos por cliente
