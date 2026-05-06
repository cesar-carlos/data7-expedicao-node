import { Server as SocketIOServer } from 'socket.io';
import ExpedicaoBasicListenEvent from '../model/expedicao.basic.listen.event';
import ExpedicaoMutationListenEvent from '../model/expedicao.mutation.listen.event';

export default class SocketNotificationEmitterService {
  constructor(private readonly io?: SocketIOServer) {}

  public emitMutation(channel: string, mutation: Record<string, unknown>[]): void {
    this.getIO().emit(
      channel,
      JSON.stringify(
        new ExpedicaoMutationListenEvent({
          Mutation: mutation,
        }).toJson(),
      ),
    );
  }

  public emitData(channel: string, data: Record<string, unknown>[]): void {
    this.getIO().emit(
      channel,
      JSON.stringify(
        new ExpedicaoBasicListenEvent({
          Data: data,
        }).toJson(),
      ),
    );
  }

  private getIO(): SocketIOServer {
    if (this.io) {
      return this.io;
    }

    const AppApi = require('../aplication/app.api').default as {
      getInstance: () => { getIO: () => SocketIOServer };
    };

    return AppApi.getInstance().getIO();
  }
}
