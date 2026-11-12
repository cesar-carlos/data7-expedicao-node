import { Server as SocketIOServer, Socket } from 'socket.io';

import SequenciaRegistroRepository from './sequencia.registro.repository';
import { sequenceNameFromWhere, withSocketRequest } from '../socket.event.helpers';
import { SocketClientError } from '../../utils/repository.error';
import SocketErrorCode from '../protocol/socket.error.code';

export default class SequenciaRegistroEvent {
  private repository = new SequenciaRegistroRepository();

  constructor(io: SocketIOServer, socket: Socket) {
    const client = socket.id;

    socket.on(`${client} sequencia.select`, async (data) => {
      await withSocketRequest(socket, data, {
        defaultResponseIn: `${client} sequencia.select`,
        eventName: 'sequencia.select',
        kind: 'query',
      }, async ({ request, emitQuery }) => {
        const name = sequenceNameFromWhere(request.where);
        const result = await this.repository.select(name, request.pagination, request.orderBy);
        if (result === undefined) {
          throw new SocketClientError('Sequencia nao encontrada', SocketErrorCode.NOT_FOUND);
        }
        emitQuery(result.toJson());
      });
    });
  }
}
