import { Server as SocketIOServer, Socket } from 'socket.io';
import SocketEventKind from './socket.event.kind';

type SocketEventMetadata = {
  eventSuffix: string;
  kind: SocketEventKind;
};

type SocketEventDefinition = {
  name: string;
  events: SocketEventMetadata[];
  listenChannels: string[];
  register: (io: SocketIOServer, socket: Socket) => void;
};

export type { SocketEventMetadata, SocketEventDefinition };
