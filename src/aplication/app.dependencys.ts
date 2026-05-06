import { FindDepedecy } from '../dependency/container.dependency';

import AppDependencysGeral from './app.dependencys.geral';
import AppDependencysIntegracaoPix from './app.dependencys.integracao.pix';
import ContainerDependency from '../dependency/container.dependency';
import AppDependencysExpedicao from './app.dependencys.expedicao';
import { validateDatabaseContexts } from '../di/database.context';

export default class AppDependencys {
  private static loaded: boolean = false;

  public static load() {
    if (this.loaded) {
      return;
    }

    validateDatabaseContexts();
    AppDependencysGeral.load();
    AppDependencysIntegracaoPix.load();
    AppDependencysExpedicao.load();
    this.loaded = true;
  }

  public static resolve<T>(params: FindDepedecy): T {
    return ContainerDependency.instance.resolve<T>(params);
  }

  public static clear() {
    this.loaded = false;
    ContainerDependency.instance.clear();
  }
}
