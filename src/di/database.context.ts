import { eContext } from '../dependency/container.dependency';

const allowedContexts = new Set<string>(Object.values(eContext));

function normalizedEnv(value: string | undefined): string | undefined {
  const t = value?.trim();
  if (!t) return undefined;
  return t.toLocaleLowerCase();
}

/**
 * Valida variáveis de ambiente usadas como contexto do ContainerDependency.
 * Chamar no boot após `loadEnv` (ex.: início de `AppDependencys.load`).
 * Valores permitidos: mesmos literais de `eContext` (`sql_server`, `sybase`).
 */
export function validateDatabaseContexts(): void {
  const local = normalizedEnv(process.env.LOCAL_DATABASE);
  if (local === undefined) {
    throw new Error(
      `LOCAL_DATABASE ausente. O .env não foi carregado neste processo (cwd=${process.cwd()}).`,
    );
  }
  if (!allowedContexts.has(local)) {
    throw new Error(
      `LOCAL_DATABASE inválido: "${process.env.LOCAL_DATABASE}". Esperado um valor de eContext (ex.: sql_server, sybase).`,
    );
  }
}

/** Same semantics as previous inline env reads (LOCAL_DATABASE). */
export function getLocalDbContext(): eContext {
  return process.env.LOCAL_DATABASE?.toLocaleLowerCase() as eContext;
}
