import ExpedicaoBasicErrorEvent from '../../model/expedicao.basic.error.event';
import ExpedicaoMutationBasicEvent from '../../model/expedicao.basic.mutation.event';
import ExpedicaoBasicSelectEvent from '../../model/expedicao.basic.query.event';
import type { NormalizedSocketRequest } from './normalized.socket.request';

export default class SocketResponseBuilder {
  static query(request: Pick<NormalizedSocketRequest, 'session' | 'responseIn'>, data: unknown) {
    return new ExpedicaoBasicSelectEvent({
      Session: request.session,
      ResponseIn: request.responseIn,
      Data: data,
    }).toJson();
  }

  static mutation(request: Pick<NormalizedSocketRequest, 'session' | 'responseIn'>, mutation: unknown[]) {
    return new ExpedicaoMutationBasicEvent({
      Session: request.session,
      ResponseIn: request.responseIn,
      Mutation: mutation,
    }).toJson();
  }

  static error(
    request: Pick<NormalizedSocketRequest, 'session' | 'responseIn'>,
    error: string | string[],
    metadata?: { code?: string; requestId?: string },
  ) {
    return new ExpedicaoBasicErrorEvent({
      Session: request.session,
      ResponseIn: request.responseIn,
      Error: error,
      Code: metadata?.code,
      RequestId: metadata?.requestId,
    }).toJson();
  }

  static serialize(payload: unknown): string {
    return JSON.stringify(payload);
  }
}
