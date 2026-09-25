import 'reflect-metadata';
const { loadEnv } = require('./infra/load.env') as typeof import('./infra/load.env');
loadEnv(__dirname);
import { registerProcessErrorHandlers } from './infra/process.error.handlers';
import App from './aplication/app';

registerProcessErrorHandlers();

async function bootstrap() {
  const app = new App();
  await app.start();
}

bootstrap().catch((error) => {
  console.error('Failed to start application', error);
  process.exit(1);
});
