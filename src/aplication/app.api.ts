import cors from 'cors';
import path from 'path';
import logger from 'morgan';
import express from 'express';

import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

import ApiRoute from '../route/api.router';
import AppSocket from './app.socket.config';

export default class AppApi {
  private port: number = process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT) : 3000;
  private static instance: AppApi;
  private app: express.Application;
  private httpServer: http.Server;
  readonly io: SocketIOServer;

  private constructor() {
    this.app = express();
    this.httpServer = http.createServer(this.app);
    this.io = new SocketIOServer(this.httpServer, {
      cors: { origin: '*', methods: ['GET', 'POST'] },
    });

    this.initialize();
  }

  private async initialize() {
    this.app.use(cors());
    this.app.use(logger('dev'));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.static(path.join(__dirname, '..', '..', 'www')));
    this.app.use(ApiRoute.router);
    new AppSocket(this.io);

    this.httpServer.listen(this.port, () => {
      console.log(`server started http://localhost:${this.port}`);
    });
  }

  public getIO(): SocketIOServer {
    return this.io;
  }

  public static getInstance(): AppApi {
    if (!AppApi.instance) AppApi.instance = new AppApi();
    return AppApi.instance;
  }
}
