import { eContext } from '../dependency/container.dependency';

const allowedContexts = new Set<string>(Object.values(eContext));

function normalizedEnv(value: string | undefined): string | undefined {
  const t = value?.trim();
  if (!t) return undefined;
  return t.toLocaleLowerCase();
}

/**
 * Valida variáveis de ambiente usadas como contexto do ContainerDependency.
 * Chamar no boot após `dotenv` (ex.: início de `AppDependencys.load`).
 * Valores permitidos: mesmos literais de `eContext` (`sql_server`, `sybase`, `firebase`, etc.).
 */
export function validateDatabaseContexts(): void {
  const local = normalizedEnv(process.env.LOCAL_DATABASE);
  if (local !== undefined && !allowedContexts.has(local)) {
    throw new Error(
      `LOCAL_DATABASE inválido: "${process.env.LOCAL_DATABASE}". Esperado um valor de eContext (ex.: sql_server, sybase).`,
    );
  }
  const online = normalizedEnv(process.env.ONLINE_DATABASE);
  if (online !== undefined && !allowedContexts.has(online)) {
    throw new Error(
      `ONLINE_DATABASE inválido: "${process.env.ONLINE_DATABASE}". Esperado um valor de eContext (ex.: firebase).`,
    );
  }
}

/** Same semantics as previous inline env reads (LOCAL_DATABASE). */
export function getLocalDbContext(): eContext {
  return process.env.LOCAL_DATABASE?.toLocaleLowerCase() as eContext;
}

/** Same semantics as previous inline env reads (ONLINE_DATABASE). */
export function getOnlineDbContext(): eContext {
  return process.env.ONLINE_DATABASE?.toLocaleLowerCase() as eContext;
}
