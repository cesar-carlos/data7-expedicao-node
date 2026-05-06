import 'reflect-metadata';
require('dotenv').config();
import App from './aplication/app';

async function bootstrap() {
  const app = new App();
  await app.start();
}

bootstrap().catch((error) => {
  console.error('Failed to start application', error);
  process.exit(1);
});
