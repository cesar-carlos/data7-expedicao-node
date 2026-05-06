import { container, InjectionToken } from 'tsyringe';

export enum eContext {
  sql_server = 'sql_server',
  sybase = 'sybase',
  firebase = 'firebase',
  sicredi = 'sicredi',
  gerencianet = 'gerencianet',
}

export interface Depedecy<T> {
  context: string;
  bind: string;
  instance: T;
}

export interface FindDepedecy {
  context: string;
  bind: string;
}

export default class ContainerDependency {
  private static _instance: ContainerDependency;

  private constructor() {}

  public static get instance() {
    return this._instance || (this._instance = new this());
  }

  private static compositeKey(context: string, bind: string): string {
    return `${context}::${bind}`;
  }

  public register<T>(params: Depedecy<T>) {
    const token = ContainerDependency.compositeKey(params.context, params.bind);
    const k = token as InjectionToken<T>;
    // Legacy container appended duplicates and resolve returned the *first* match; keep that semantics.
    if (container.isRegistered(k, true)) {
      return;
    }
    container.registerInstance(k, params.instance);
  }

  public resolve<T>(params: FindDepedecy): T {
    const token = ContainerDependency.compositeKey(params.context, params.bind);
    if (!container.isRegistered(token as InjectionToken<T>, true)) {
      throw new Error(`Dependency not found for context: ${params.context}, bind: ${params.bind}`);
    }
    return container.resolve<T>(token as InjectionToken<T>);
  }

  public clear() {
    container.reset();
  }
}
