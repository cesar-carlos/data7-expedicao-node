export default class AppExpressError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(params: {
    message: string;
    statusCode?: number;
    code?: string;
    details?: unknown;
  }) {
    super(params.message);
    this.name = 'AppExpressError';
    this.statusCode = params.statusCode ?? 500;
    this.code = params.code ?? 'INTERNAL_ERROR';
    this.details = params.details;
  }

  public static fromUnknown(error: unknown): AppExpressError {
    if (error instanceof AppExpressError) {
      return error;
    }

    if (error instanceof Error) {
      return new AppExpressError({
        message: error.message,
      });
    }

    return new AppExpressError({
      message: 'Unexpected application error',
      details: error,
    });
  }
}
