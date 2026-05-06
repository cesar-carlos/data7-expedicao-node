import { describe, expect, test, vi } from 'vitest';
import AppExpressError from '../../../src/aplication/app.express.error';
import appErrorMiddleware from '../../../src/middleware/app.error.middleware';

describe('app.express.error', () => {
  test('should preserve metadata when normalizing app errors', () => {
    const error = new AppExpressError({
      message: 'request failed',
      statusCode: 422,
      code: 'VALIDATION_ERROR',
      details: { field: 'Origem' },
    });

    const normalized = AppExpressError.fromUnknown(error);
    expect(normalized.statusCode).toBe(422);
    expect(normalized.code).toBe('VALIDATION_ERROR');
    expect(normalized.details).toEqual({ field: 'Origem' });
  });

  test('should serialize express errors with status and code', () => {
    const status = vi.fn().mockReturnThis();
    const send = vi.fn();
    const response = {
      headersSent: false,
      status,
      send,
    } as any;

    appErrorMiddleware(
      new AppExpressError({
        message: 'not implemented',
        statusCode: 501,
        code: 'NOT_IMPLEMENTED',
      }),
      {} as any,
      response,
      vi.fn(),
    );

    expect(status).toHaveBeenCalledWith(501);
    expect(send).toHaveBeenCalledWith({
      message: 'not implemented',
      code: 'NOT_IMPLEMENTED',
    });
  });
});
