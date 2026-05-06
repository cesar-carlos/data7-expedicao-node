/**
 * Preserva a cadeia de erros do driver (útil para diagnóstico e retry seletivo).
 */
export function wrapRepositoryError(err: unknown): Error {
  if (err instanceof Error) {
    return new Error(err.message, { cause: err });
  }
  return new Error(String(err));
}
