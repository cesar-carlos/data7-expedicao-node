import 'reflect-metadata';

if (process.env.EXPEDICAO_DESKTOP === '1') {
  const { enableDesktopLineConsole } = require('./infra/desktop.console') as typeof import('./infra/desktop.console');
  enableDesktopLineConsole();
}

const { loadEnv } = require('./infra/load.env') as typeof import('./infra/load.env');
loadEnv(__dirname);
import { registerProcessErrorHandlers } from './infra/process.error.handlers';
import App from './aplication/app';

registerProcessErrorHandlers();

let app: App | null = null;
let stopRequested = false;
let stopping = false;

async function shutdownFromDesktop(): Promise<void> {
  stopRequested = true;
  if (!app || stopping) {
    return;
  }
  stopping = true;
  try {
    await app.stop();
  } catch (error) {
    console.error('Failed to stop application', error);
  } finally {
    process.exit(0);
  }
}

function listenForDesktopShutdown(): void {
  if (process.env.EXPEDICAO_DESKTOP !== '1' || !process.stdin) {
    return;
  }

  process.stdin.setEncoding('utf8');
  let pending = '';
  process.stdin.on('data', (chunk: string) => {
    pending += chunk;
    if (pending.toLowerCase().includes('shutdown')) {
      void shutdownFromDesktop();
    }
    if (pending.length > 1024) {
      pending = pending.slice(-64);
    }
  });
  process.stdin.resume();
}

async function bootstrap() {
  listenForDesktopShutdown();
  app = new App();
  await app.start();
  if (stopRequested) {
    await shutdownFromDesktop();
  }
}

bootstrap().catch((error) => {
  console.error('Failed to start application', error);
  process.exit(1);
});
