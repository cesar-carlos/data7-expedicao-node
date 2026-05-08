import cors from 'cors';
import path from 'path';
import logger from 'morgan';
import express from 'express';

import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

import ApiRoute from '../route/api.router';
import AppSocket from './app.socket.config';
import appErrorMiddleware from '../middleware/app.error.middleware';

export default class AppApi {
  private port: number = process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT) : 3000;
  private static instance: AppApi | null = null;
  private app: express.Application;
  private httpServer: http.Server;
  private isStarted: boolean = false;
  private startPromise: Promise<void> | null = null;
  readonly io: SocketIOServer;

  private constructor() {
    const allowedOrigins = this.getAllowedOrigins();

    this.app = express();
    this.httpServer = http.createServer(this.app);
    this.io = new SocketIOServer(this.httpServer, {
      cors: allowedOrigins
        ? { origin: allowedOrigins, methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] }
        : { origin: '*', methods: ['GET', 'POST'] },
    });

    this.initialize();
  }

  private initialize() {
    const allowedOrigins = this.getAllowedOrigins();
    const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';

    this.app.use(
      allowedOrigins
        ? cors({
            origin: allowedOrigins,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
          })
        : cors(),
    );
    this.app.use(logger(morganFormat));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.static(path.join(__dirname, '..', '..', 'www')));
    this.app.use(ApiRoute.router);
    this.app.use(appErrorMiddleware);
    new AppSocket(this.io);
  }

  private getAllowedOrigins(): string[] | null {
    const allowedOrigins = process.env.CORS_ORIGINS?.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);

    if (!allowedOrigins || allowedOrigins.length === 0) {
      return null;
    }

    return allowedOrigins;
  }

  public async start(): Promise<void> {
    if (this.isStarted) {
      return;
    }

    if (this.startPromise) {
      return this.startPromise;
    }

    this.startPromise = new Promise<void>((resolve, reject) => {
      const onError = (error: Error) => {
        this.httpServer.off('listening', onListening);
        this.startPromise = null;
        reject(error);
      };

      const onListening = () => {
        this.httpServer.off('error', onError);
        this.isStarted = true;
        this.startPromise = null;
        console.log(`server started http://localhost:${this.port}`);
        resolve();
      };

      this.httpServer.once('error', onError);
      this.httpServer.once('listening', onListening);
      this.httpServer.listen(this.port);
    });

    return this.startPromise;
  }

  public async stop(): Promise<void> {
    if (!this.isStarted && !this.httpServer.listening) {
      return;
    }

    await new Promise<void>((resolve) => {
      this.io.close(() => resolve());
    });

    await new Promise<void>((resolve, reject) => {
      this.httpServer.close((error) => {
        if (error) {
          if (error.message === 'Server is not running.') {
            this.isStarted = false;
            AppApi.instance = null;
            resolve();
            return;
          }

          reject(error);
          return;
        }

        this.isStarted = false;
        AppApi.instance = null;
        resolve();
      });
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
