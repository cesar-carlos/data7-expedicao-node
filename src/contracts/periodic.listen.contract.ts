import ListenContract from './listen.contract';

export default interface PeriodicListenContract extends ListenContract {
  start(): void;
  stop(): void;
  pause(): void;
  resume(): void;
  isRunning(): boolean;
  isPaused(): boolean;
}

