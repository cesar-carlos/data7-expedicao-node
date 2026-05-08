/**
 * Handlers de processo para rejeições/exceções fora de try/catch.
 * Evita falhas silenciosas e registra metadados seguros (sem dados sensíveis).
 */
export function registerProcessErrorHandlers(): void {
  process.on('unhandledRejection', (reason: unknown) => {
    const message = reason instanceof Error ? reason.message : String(reason);
    console.error('[process] unhandledRejection', message);
    if (process.env.NODE_ENV !== 'production' && reason instanceof Error && reason.stack) {
      console.error(reason.stack);
    }
  });

  process.once('uncaughtException', (error: Error) => {
    console.error('[process] uncaughtException', error.message);
    if (process.env.NODE_ENV !== 'production' && error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  });
}
