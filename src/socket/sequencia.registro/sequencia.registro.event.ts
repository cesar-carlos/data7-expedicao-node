import { Server as SocketIOServer, Socket } from 'socket.io';

import SequenciaRegistroRepository from './sequencia.registro.repository';
import ExpedicaoBasicSelectEvent from '../../model/expedicao.basic.query.event';
import { emitSocketError, getSocketPayloadOrEmitError } from '../socket.event.helpers';

export default class SequenciaRegistroEvent {
  private repository = new SequenciaRegistroRepository();

  constructor(io: SocketIOServer, socket: Socket) {
    const client = socket.id;

    socket.on(`${client} sequencia.select`, async (data) => {
      const payload = getSocketPayloadOrEmitError(socket, data, {
        defaultResponseIn: `${client} sequencia.select`,
      });
      if (!payload) return;

      const { session, responseIn, where, pagination, orderBy } = payload;

      try {
        const result = await this.repository.select(String(where ?? ''), pagination, orderBy);
        if (result === undefined) {
          throw new Error('Sequencia nÃ£o encontrada');
        }

        const event = new ExpedicaoBasicSelectEvent({
          Session: session,
          ResponseIn: responseIn,
          Data: result.toJson(),
        });

        socket.emit(responseIn, JSON.stringify(event.toJson()));
      } catch (error) {
        emitSocketError(socket, responseIn, session, error);
      }
    });
  }
}
