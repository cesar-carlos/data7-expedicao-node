import dotenv from 'dotenv';
import AppApi from './app.api';
import AppLinstens from './app.linstens';
import ConnectionSqlServerMssql from '../infra/connection.sql.server.mssql';
import AppDependencys from './app.dependencys';
import AppFirebase from './app.firebase';

export default class App {
  private static activeApp: App | null = null;
  private static shutdownHooksRegistered: boolean = false;

  private listeners: AppLinstens | null = null;
  private appApi: AppApi | null = null;
  private initialized: boolean = false;
  private startPromise: Promise<void> | null = null;
  private stopPromise: Promise<void> | null = null;

  private async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    dotenv.config();
    await AppFirebase.load();
    AppDependencys.load();
    this.initialized = true;
  }

  private static registerClose() {
    if (this.shutdownHooksRegistered) {
      return;
    }

    const shutdown = async (signal: string) => {
      try {
        console.log(`Received ${signal}. Starting graceful shutdown...`);
        await App.activeApp?.stop();
        process.exit(0);
      } catch (error) {
        console.error('Error during graceful shutdown', error);
        process.exit(1);
      }
    };

    process.once('SIGINT', () => {
      void shutdown('SIGINT');
    });
    process.once('SIGTERM', () => {
      void shutdown('SIGTERM');
    });

    this.shutdownHooksRegistered = true;
  }

  public async start(): Promise<void> {
    if (this.startPromise) {
      return this.startPromise;
    }

    this.startPromise = (async () => {
      await this.initialize();
      await ConnectionSqlServerMssql.getInstance().warmup();

      this.appApi = AppApi.getInstance();
      await this.appApi.start();

      if (!this.listeners) {
        this.listeners = new AppLinstens(this.appApi.getIO());
        this.listeners.start();
      }

      App.activeApp = this;
      App.registerClose();
    })();

    try {
      await this.startPromise;
    } finally {
      this.startPromise = null;
    }
  }

  public async stop(): Promise<void> {
    if (this.stopPromise) {
      return this.stopPromise;
    }

    this.stopPromise = (async () => {
      this.listeners?.stopPeriodicListeners();
      this.listeners = null;

      if (this.appApi) {
        await this.appApi.stop();
      }

      await ConnectionSqlServerMssql.shutdown();

      if (App.activeApp === this) {
        App.activeApp = null;
      }
    })();

    try {
      await this.stopPromise;
    } finally {
      this.stopPromise = null;
    }
  }

  public async execute(): Promise<void> {
    await this.start();
  }
}
