import 'reflect-metadata';
require('dotenv').config();
import App from './aplication/app';

const app = new App();
app.execute();
