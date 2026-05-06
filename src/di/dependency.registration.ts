import ContainerDependency, { Depedecy } from '../dependency/container.dependency';

export type DependencyRegistration<T = unknown> = Omit<Depedecy<T>, 'instance'> & {
  create: () => T;
};

export function registerDependencies(registrations: DependencyRegistration[]): void {
  for (const registration of registrations) {
    ContainerDependency.instance.register({
      context: registration.context,
      bind: registration.bind,
      instance: registration.create(),
    });
  }
}
