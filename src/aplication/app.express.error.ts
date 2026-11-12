import {
  classifyClientError,
  httpStatusForClientError,
} from '../utils/repository.error';

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

    const classified = classifyClientError(error);
    return new AppExpressError({
      message: classified.clientMessage,
      statusCode: httpStatusForClientError(classified),
      code: classified.code,
    });
  }
}
