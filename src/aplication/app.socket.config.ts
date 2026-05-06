import { Server as SocketIOServer, Socket } from 'socket.io';
import { emitSocketError, logSocketAuthFailure, resolveSocketErrorContext } from '../socket/socket.event.helpers';
import SocketErrorCode from '../socket/protocol/socket.error.code';
import { type SocketEventDefinition } from '../socket/protocol/socket.event.definition';
import { logSocketLifecycle } from '../socket/protocol/socket.logger';

import UsuarioEvent from '../socket/usuario/usuario.event';
import CarrinhoEvent from '../socket/carrinho/carrinho.event';
import ArmazenarEvent from '../socket/armazenar/armazenar.event';
import CancelamentoEvent from '../socket/cancelamento/cancelamento.event';
import SeparacaoItemEvent from '../socket/separacao.item/separacao.item.event';
import SequenciaRegistroEvent from '../socket/sequencia.registro/sequencia.registro.event';
import CarrinhoPercursoEstagioEvent from '../socket/carrinho.percurso.estagio/carrinho.percurso.estagio.event';
import TipoOperacaoArmazenagemEvent from '../socket/tipo.operacao.armazenagem/tipo.operacao.armazenagem.event';
import CarrinhoPercursoAgrupamentoEvent from '../socket/carrinho.percurso.agrupamento/carrinho.percurso.agrupamento.event';
import EstoqueConversaoUnidadeEvent from '../socket/produto.conversao.unidade/estoque.conversao.unidade.event';
import TipoOperacaoExpedicaoEvent from '../socket/tipo.operacao.expedicao/tipo.operacao.expedicao.event';
import ProcessoExecutavelEvent from '../socket/processo.executavel/processo.executavel.event';
import CarrinhoPercursoEvent from '../socket/carrinho.percurso/carrinho.percurso.event';
import PercursoEstagioEvent from '../socket/expedicao.percurso.estagio/expedicao.percurso.estagio.event';
import ConferenciaItemEvent from '../socket/conferencia.item/conferencia.item.event';
import ItemArmazenarEvent from '../socket/item.armazenar/item.armazenar.event';
import ConferirItemEvent from '../socket/conferir.item/conferir.item.event';
import EstoqueProdutoEvent from '../socket/produto/estoque.produto.event';
import SepararItemEvent from '../socket/separar.item/separar.item.event';
import ConferirEvent from '../socket/conferir/conferir.event';
import SepararEvent from '../socket/separar/separar.event';
import SetorEstoqueEvent from '../socket/setor.estoque/setor.estoque.event';
import SeparacaoUsuarioSetorItemEvent from '../socket/separacao.usuario.setor/separacao.usuario.setor.item.event';

const SOCKET_EVENT_DEFINITIONS: SocketEventDefinition[] = [
  {
    name: 'usuario',
    events: [
      { eventSuffix: 'usuario.consulta', kind: 'query' },
      { eventSuffix: 'usuario.select', kind: 'query' },
      { eventSuffix: 'usuario.insert', kind: 'mutation' },
      { eventSuffix: 'usuario.update', kind: 'mutation' },
      { eventSuffix: 'usuario.delete', kind: 'mutation' },
    ],
    listenChannels: ['usuario.insert.listen', 'usuario.update.listen', 'usuario.delete.listen'],
    register: (io, socket) => new UsuarioEvent(io, socket),
  },
  {
    name: 'separar',
    events: [
      { eventSuffix: 'separar.consulta', kind: 'query' },
      { eventSuffix: 'separar.progresso.consulta', kind: 'query' },
      { eventSuffix: 'separar.estoque.item.impresso.consulta', kind: 'query' },
      { eventSuffix: 'separar.select', kind: 'query' },
      { eventSuffix: 'separar.insert', kind: 'mutation' },
      { eventSuffix: 'separar.update', kind: 'mutation' },
      { eventSuffix: 'separar.delete', kind: 'mutation' },
    ],
    listenChannels: ['separar.insert.listen', 'separar.update.listen', 'separar.delete.listen'],
    register: (io, socket) => new SepararEvent(io, socket),
  },
  {
    name: 'carrinho',
    events: [
      { eventSuffix: 'carrinho.consulta', kind: 'query' },
      { eventSuffix: 'carrinho.select', kind: 'query' },
      { eventSuffix: 'carrinho.insert', kind: 'mutation' },
      { eventSuffix: 'carrinho.update', kind: 'mutation' },
      { eventSuffix: 'carrinho.delete', kind: 'mutation' },
    ],
    listenChannels: ['carrinho.insert.listen', 'carrinho.update.listen', 'carrinho.delete.listen'],
    register: (io, socket) => new CarrinhoEvent(io, socket),
  },
  {
    name: 'processo.executavel',
    events: [
      { eventSuffix: 'processo.executavel.select', kind: 'query' },
      { eventSuffix: 'processo.executavel.insert', kind: 'mutation' },
      { eventSuffix: 'processo.executavel.update', kind: 'mutation' },
      { eventSuffix: 'processo.executavel.delete', kind: 'mutation' },
    ],
    listenChannels: [
      'processo.executavel.insert.listen',
      'processo.executavel.update.listen',
      'processo.executavel.delete.listen',
    ],
    register: (io, socket) => new ProcessoExecutavelEvent(io, socket),
  },
  {
    name: 'carrinho.percurso.estagio',
    events: [
      { eventSuffix: 'carrinho.percurso.estagio.consulta', kind: 'query' },
      { eventSuffix: 'carrinho.percurso.estagio.select', kind: 'query' },
      { eventSuffix: 'carrinho.percurso.estagio.insert', kind: 'mutation' },
      { eventSuffix: 'carrinho.percurso.estagio.update', kind: 'mutation' },
      { eventSuffix: 'carrinho.percurso.estagio.delete', kind: 'mutation' },
    ],
    listenChannels: [
      'carrinho.percurso.estagio.insert.listen',
      'carrinho.percurso.estagio.update.listen',
      'carrinho.percurso.estagio.delete.listen',
      'carrinho.percurso.update.listen',
      'separar.update.listen',
    ],
    register: (io, socket) => new CarrinhoPercursoEstagioEvent(io, socket),
  },
  {
    name: 'sequencia.registro',
    events: [{ eventSuffix: 'sequencia.select', kind: 'query' }],
    listenChannels: [],
    register: (io, socket) => new SequenciaRegistroEvent(io, socket),
  },
  {
    name: 'carrinho.percurso',
    events: [
      { eventSuffix: 'carrinho.percurso.consulta', kind: 'query' },
      { eventSuffix: 'carrinho.percurso.select', kind: 'query' },
      { eventSuffix: 'carrinho.percurso.insert', kind: 'mutation' },
      { eventSuffix: 'carrinho.percurso.update', kind: 'mutation' },
      { eventSuffix: 'carrinho.percurso.delete', kind: 'mutation' },
    ],
    listenChannels: [
      'carrinho.percurso.insert.listen',
      'carrinho.percurso.update.listen',
      'carrinho.percurso.delete.listen',
    ],
    register: (io, socket) => new CarrinhoPercursoEvent(io, socket),
  },
  {
    name: 'separacao.item',
    events: [
      { eventSuffix: 'separacao.item.resumo.consulta', kind: 'query' },
      { eventSuffix: 'separacao.item.consulta', kind: 'query' },
      { eventSuffix: 'separacao.item.select', kind: 'query' },
      { eventSuffix: 'separacao.item.insert', kind: 'mutation' },
      { eventSuffix: 'separacao.item.update', kind: 'mutation' },
      { eventSuffix: 'separacao.item.delete', kind: 'mutation' },
    ],
    listenChannels: [
      'separacao.item.insert.listen',
      'separacao.item.update.listen',
      'separacao.item.delete.listen',
      'separar.item.consulta.update.listen',
    ],
    register: (io, socket) => new SeparacaoItemEvent(io, socket),
  },
  {
    name: 'separar.item',
    events: [
      { eventSuffix: 'separar.item.consulta', kind: 'query' },
      { eventSuffix: 'separar.item.unidade.medida.consulta', kind: 'query' },
      { eventSuffix: 'separar.item.select', kind: 'query' },
      { eventSuffix: 'separar.item.insert', kind: 'mutation' },
      { eventSuffix: 'separar.item.update', kind: 'mutation' },
      { eventSuffix: 'separar.item.delete', kind: 'mutation' },
    ],
    listenChannels: ['separar.item.insert.listen', 'separar.item.update.listen', 'separar.item.delete.listen'],
    register: (io, socket) => new SepararItemEvent(io, socket),
  },
  {
    name: 'separacao.usuario.setor',
    events: [
      { eventSuffix: 'separar.usuario.setor.consulta', kind: 'query' },
      { eventSuffix: 'separar.usuario.setor.select', kind: 'query' },
      { eventSuffix: 'separar.usuario.setor.insert', kind: 'mutation' },
      { eventSuffix: 'separar.usuario.setor.update', kind: 'mutation' },
      { eventSuffix: 'separar.usuario.setor.delete', kind: 'mutation' },
    ],
    listenChannels: [
      'separar.usuario.setor.insert.listen',
      'separar.usuario.setor.update.listen',
      'separar.usuario.setor.delete.listen',
    ],
    register: (io, socket) => new SeparacaoUsuarioSetorItemEvent(io, socket),
  },
  {
    name: 'expedicao.cancelamento',
    events: [
      { eventSuffix: 'expedicao.cancelamento.select', kind: 'query' },
      { eventSuffix: 'expedicao.cancelamento.insert', kind: 'mutation' },
      { eventSuffix: 'expedicao.cancelamento.update', kind: 'mutation' },
      { eventSuffix: 'expedicao.cancelamento.delete', kind: 'mutation' },
    ],
    listenChannels: [
      'expedicao.cancelamento.insert.listen',
      'expedicao.cancelamento.update.listen',
      'expedicao.cancelamento.delete.listen',
    ],
    register: (io, socket) => new CancelamentoEvent(io, socket),
  },
  {
    name: 'expedicao.percurso.estagio',
    events: [
      { eventSuffix: 'expedicao.percurso.estagio.select', kind: 'query' },
      { eventSuffix: 'expedicao.percurso.estagio.insert', kind: 'mutation' },
      { eventSuffix: 'expedicao.percurso.estagio.update', kind: 'mutation' },
      { eventSuffix: 'expedicao.percurso.estagio.delete', kind: 'mutation' },
    ],
    listenChannels: [],
    register: (io, socket) => new PercursoEstagioEvent(io, socket),
  },
  {
    name: 'estoque.produto',
    events: [
      { eventSuffix: 'estoque.produto.consulta', kind: 'query' },
      { eventSuffix: 'estoque.produto.select', kind: 'query' },
      { eventSuffix: 'estoque.produto.insert', kind: 'mutation' },
      { eventSuffix: 'estoque.produto.update', kind: 'mutation' },
      { eventSuffix: 'estoque.produto.delete', kind: 'mutation' },
    ],
    listenChannels: ['estoque.produto.insert.listen', 'estoque.produto.update.listen', 'estoque.produto.delete.listen'],
    register: (io, socket) => new EstoqueProdutoEvent(io, socket),
  },
  {
    name: 'conferir',
    events: [
      { eventSuffix: 'conferir.consulta', kind: 'query' },
      { eventSuffix: 'carrinho.conferir.consulta', kind: 'query' },
      { eventSuffix: 'conferir.select', kind: 'query' },
      { eventSuffix: 'conferir.insert', kind: 'mutation' },
      { eventSuffix: 'conferir.update', kind: 'mutation' },
      { eventSuffix: 'conferir.delete', kind: 'mutation' },
    ],
    listenChannels: ['conferir.insert.listen', 'conferir.update.listen', 'conferir.delete.listen'],
    register: (io, socket) => new ConferirEvent(io, socket),
  },
  {
    name: 'conferir.item',
    events: [
      { eventSuffix: 'conferir.item.consulta', kind: 'query' },
      { eventSuffix: 'conferir.item.unidade.medida.consulta', kind: 'query' },
      { eventSuffix: 'conferir.separacao.item.consulta', kind: 'query' },
      { eventSuffix: 'conferir.item.select', kind: 'query' },
      { eventSuffix: 'conferir.item.insert', kind: 'mutation' },
      { eventSuffix: 'conferir.item.update', kind: 'mutation' },
      { eventSuffix: 'conferir.item.delete', kind: 'mutation' },
    ],
    listenChannels: ['conferir.item.insert.listen', 'conferir.item.update.listen', 'conferir.item.delete.listen'],
    register: (io, socket) => new ConferirItemEvent(io, socket),
  },
  {
    name: 'conferencia.item',
    events: [
      { eventSuffix: 'conferencia.item.consulta', kind: 'query' },
      { eventSuffix: 'conferencia.item.select', kind: 'query' },
      { eventSuffix: 'conferencia.item.insert', kind: 'mutation' },
      { eventSuffix: 'conferencia.item.update', kind: 'mutation' },
      { eventSuffix: 'conferencia.item.delete', kind: 'mutation' },
    ],
    listenChannels: [
      'conferencia.item.insert.listen',
      'conferencia.item.update.listen',
      'conferencia.item.delete.listen',
      'conferir.item.update.listen',
    ],
    register: (io, socket) => new ConferenciaItemEvent(io, socket),
  },
  {
    name: 'produto.conversao.unidade',
    events: [
      { eventSuffix: 'produto.conversao.unidade.consulta', kind: 'query' },
      { eventSuffix: 'produto.conversao.unidade.select', kind: 'query' },
      { eventSuffix: 'produto.conversao.unidade.insert', kind: 'mutation' },
      { eventSuffix: 'produto.conversao.unidade.update', kind: 'mutation' },
      { eventSuffix: 'produto.conversao.unidade.delete', kind: 'mutation' },
    ],
    listenChannels: [
      'produto.conversao.unidade.insert.listen',
      'produto.conversao.unidade.update.listen',
      'produto.conversao.unidade.delete.listen',
    ],
    register: (io, socket) => new EstoqueConversaoUnidadeEvent(io, socket),
  },
  {
    name: 'carrinho.percurso.agrupamento',
    events: [
      { eventSuffix: 'carrinho.percurso.agrupamento.consulta', kind: 'query' },
      { eventSuffix: 'carrinho.percurso.agrupamento.select', kind: 'query' },
      { eventSuffix: 'carrinho.percurso.agrupamento.insert', kind: 'mutation' },
      { eventSuffix: 'carrinho.percurso.agrupamento.update', kind: 'mutation' },
      { eventSuffix: 'carrinho.percurso.agrupamento.delete', kind: 'mutation' },
    ],
    listenChannels: [
      'carrinho.percurso.agrupamento.insert.listen',
      'carrinho.percurso.agrupamento.update.listen',
      'carrinho.percurso.agrupamento.delete.listen',
    ],
    register: (io, socket) => new CarrinhoPercursoAgrupamentoEvent(io, socket),
  },
  {
    name: 'tipo.operacao.armazenagem',
    events: [
      { eventSuffix: 'tipo.operacao.armazenagem.select', kind: 'query' },
      { eventSuffix: 'tipo.operacao.armazenagem.insert', kind: 'mutation' },
      { eventSuffix: 'tipo.operacao.armazenagem.update', kind: 'mutation' },
      { eventSuffix: 'tipo.operacao.armazenagem.delete', kind: 'mutation' },
    ],
    listenChannels: [
      'tipo.operacao.armazenagem.insert.listen',
      'tipo.operacao.armazenagem.update.listen',
      'tipo.operacao.armazenagem.delete.listen',
    ],
    register: (io, socket) => new TipoOperacaoArmazenagemEvent(io, socket),
  },
  {
    name: 'tipo.operacao.expedicao',
    events: [
      { eventSuffix: 'tipo.operacao.expedicao.select', kind: 'query' },
      { eventSuffix: 'tipo.operacao.expedicao.insert', kind: 'mutation' },
      { eventSuffix: 'tipo.operacao.expedicao.update', kind: 'mutation' },
      { eventSuffix: 'tipo.operacao.expedicao.delete', kind: 'mutation' },
    ],
    listenChannels: [
      'tipo.operacao.expedicao.insert.listen',
      'tipo.operacao.expedicao.update.listen',
      'tipo.operacao.expedicao.delete.listen',
    ],
    register: (io, socket) => new TipoOperacaoExpedicaoEvent(io, socket),
  },
  {
    name: 'armazenar.item',
    events: [
      { eventSuffix: 'armazenar.item.consulta', kind: 'query' },
      { eventSuffix: 'armazenar.item.select', kind: 'query' },
      { eventSuffix: 'armazenar.item.insert', kind: 'mutation' },
      { eventSuffix: 'armazenar.item.update', kind: 'mutation' },
      { eventSuffix: 'armazenar.item.delete', kind: 'mutation' },
    ],
    listenChannels: [
      'armazenar.item.insert.listen',
      'armazenar.item.update.listen',
      'armazenar.item.delete.listen',
    ],
    register: (io, socket) => new ItemArmazenarEvent(io, socket),
  },
  {
    name: 'armazenar',
    events: [
      { eventSuffix: 'armazenar.select', kind: 'query' },
      { eventSuffix: 'armazenar.insert', kind: 'mutation' },
      { eventSuffix: 'armazenar.update', kind: 'mutation' },
      { eventSuffix: 'armazenar.delete', kind: 'mutation' },
    ],
    listenChannels: ['armazenar.insert.listen', 'armazenar.update.listen', 'armazenar.delete.listen'],
    register: (io, socket) => new ArmazenarEvent(io, socket),
  },
  {
    name: 'setor.estoque',
    events: [
      { eventSuffix: 'setor.estoque.select', kind: 'query' },
      { eventSuffix: 'setor.estoque.insert', kind: 'mutation' },
      { eventSuffix: 'setor.estoque.update', kind: 'mutation' },
      { eventSuffix: 'setor.estoque.delete', kind: 'mutation' },
    ],
    listenChannels: ['setor.estoque.insert.listen', 'setor.estoque.update.listen', 'setor.estoque.delete.listen'],
    register: (io, socket) => new SetorEstoqueEvent(io, socket),
  },
] as const;

export default class AppSocket {
  constructor(private readonly io: SocketIOServer) {
    this.validateDefinitions();
    this.initialize();
  }

  private initialize() {
    this.io.use((socket, next) => {
      const expectedToken = process.env.SOCKET_AUTH_TOKEN?.trim();
      if (!expectedToken) {
        next();
        return;
      }

      const handshakeToken = typeof socket.handshake.auth?.token === 'string' ? socket.handshake.auth.token : '';
      const authHeader = typeof socket.handshake.headers.authorization === 'string'
        ? socket.handshake.headers.authorization
        : '';
      const bearerToken = authHeader.toLowerCase().startsWith('bearer ') ? authHeader.slice(7).trim() : '';
      const token = handshakeToken || bearerToken;

      if (token !== expectedToken) {
        logSocketAuthFailure(socket, 'Unauthorized socket connection');
        next(new Error('Unauthorized socket connection'));
        return;
      }

      next();
    });

    this.io.on('connection', (socket: Socket) => {
      this.wrapSocketListeners(socket);
      logSocketLifecycle('Socket client connected', {
        socketId: socket.id,
        status: 'connected',
      });

      for (const definition of SOCKET_EVENT_DEFINITIONS) {
        definition.register(this.io, socket);
      }

      socket.on('disconnect', () => {
        logSocketLifecycle('Socket client disconnected', {
          socketId: socket.id,
          status: 'disconnected',
        });
        socket.removeAllListeners();
      });
    });
  }

  private wrapSocketListeners(socket: Socket) {
    const originalOn = socket.on.bind(socket);

    socket.on = ((eventName: string, listener: (...args: unknown[]) => unknown) => {
      return originalOn(eventName, async (...args: unknown[]) => {
        try {
          await listener(...args);
        } catch (error) {
          if (eventName === 'disconnect') {
            logSocketLifecycle('Disconnect listener failed', {
              socketId: socket.id,
              status: 'error',
              error: error instanceof Error ? error.message : String(error),
            }, 'error');
            return;
          }

          const defaultResponseIn = eventName.startsWith(`${socket.id} `) ? eventName : `${socket.id} ${eventName}`;
          const { responseIn, session } = resolveSocketErrorContext(args[0], defaultResponseIn);
          emitSocketError(socket, responseIn, session, error, SocketErrorCode.INTERNAL_ERROR, undefined, eventName);
        }
      });
    }) as typeof socket.on;
  }

  private validateDefinitions() {
    const registeredEvents = new Map<string, string>();
    const listenChannels = new Map<string, string>();

    for (const definition of SOCKET_EVENT_DEFINITIONS) {
      for (const event of definition.events) {
        const currentOwner = registeredEvents.get(event.eventSuffix);
        if (currentOwner) {
          throw new Error(`Duplicate socket event registration: ${event.eventSuffix} (${currentOwner} / ${definition.name})`);
        }

        registeredEvents.set(event.eventSuffix, definition.name);
      }

      for (const channel of definition.listenChannels) {
        if (!channel.endsWith('.listen')) {
          throw new Error(`Invalid listen channel for ${definition.name}: ${channel}`);
        }

        listenChannels.set(channel, definition.name);
      }
    }
  }
}
