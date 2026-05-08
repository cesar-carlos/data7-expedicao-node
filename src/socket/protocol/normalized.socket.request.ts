import { OrderBy, Pagination } from '../../contracts/local.base.params';
import SocketEventKind from './socket.event.kind';

type SocketPayloadRecord = Record<string, unknown>;

type NormalizedSocketRequest = {
  requestId: string;
  eventName: string;
  kind: SocketEventKind;
  raw: SocketPayloadRecord;
  session: string;
  responseIn: string;
  where: unknown;
  mutation: unknown[];
  pagination: Pagination | undefined;
  orderBy: OrderBy | undefined;
};

export type { SocketPayloadRecord, NormalizedSocketRequest };
