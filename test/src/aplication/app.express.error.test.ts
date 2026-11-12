import { describe, expect, test, vi } from 'vitest';
import AppExpressError from '../../../src/aplication/app.express.error';
import appErrorMiddleware from '../../../src/middleware/app.error.middleware';
import { wrapRepositoryError } from '../../../src/utils/repository.error';

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

  test('should expose the business rule identifier without SQL driver text', () => {
    const status = vi.fn().mockReturnThis();
    const send = vi.fn();
    const response = {
      headersSent: false,
      status,
      send,
    } as any;

    const driverError = Object.assign(
      new Error('Carrinho sem itens para conferir. Nao e possivel iniciar a conferencia deste carrinho.'),
      { number: 50014 },
    );

    appErrorMiddleware(
      wrapRepositoryError(driverError),
      {} as any,
      response,
      vi.fn(),
    );

    expect(status).toHaveBeenCalledWith(422);
    expect(send).toHaveBeenCalledWith({
      message: '[50014] Carrinho sem itens para conferir. Nao e possivel iniciar a conferencia deste carrinho.',
      code: 'BUSINESS_RULE_VIOLATION',
    });
  });
});
