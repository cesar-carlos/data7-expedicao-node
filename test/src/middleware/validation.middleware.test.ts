import { describe, expect, test, vi } from 'vitest';
import { z } from 'zod';
import AppExpressError from '../../../src/aplication/app.express.error';
import { validateBody } from '../../../src/middleware/validation.middleware';

describe('validation.middleware', () => {
  test('should delegate invalid body errors to AppExpressError', () => {
    const next = vi.fn();
    const middleware = validateBody(
      z.object({
        Nome: z.string().min(1),
      }),
    );

    middleware(
      {
        body: {
          Nome: '',
        },
      } as any,
      {} as any,
      next,
    );

    const error = next.mock.calls[0][0] as AppExpressError;
    expect(error).toBeInstanceOf(AppExpressError);
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('VALIDATION_ERROR');
  });
});
