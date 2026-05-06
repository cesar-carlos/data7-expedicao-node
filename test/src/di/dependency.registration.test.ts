import { afterEach, describe, expect, test } from 'vitest';
import ContainerDependency, { eContext } from '../../../src/dependency/container.dependency';
import { registerDependencies } from '../../../src/di/dependency.registration';

describe('dependency.registration', () => {
  afterEach(() => {
    ContainerDependency.instance.clear();
  });

  test('should register declarative dependencies into the container', () => {
    registerDependencies([
      {
        context: eContext.sql_server,
        bind: 'ExampleDependency',
        create: () => ({ ready: true }),
      },
    ]);

    const dependency = ContainerDependency.instance.resolve<{ ready: boolean }>({
      context: eContext.sql_server,
      bind: 'ExampleDependency',
    });

    expect(dependency).toEqual({ ready: true });
  });
});
