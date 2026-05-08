import { NextFunction, Request, RequestHandler, Response } from 'express';
import AppExpressError from '../aplication/app.express.error';

type ControllerAction = (req: Request, res: Response, next: NextFunction) => Promise<void> | void;

export function handleController(action: ControllerAction): RequestHandler {
  return async (req, res, next) => {
    try {
      await action(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

export function createNotImplementedHandler(feature: string, method: string): RequestHandler {
  return handleController(() => {
    throw new AppExpressError({
      message: `${feature}: ${method.toUpperCase()} not implemented`,
      statusCode: 501,
      code: 'NOT_IMPLEMENTED',
    });
  });
}

export function createMethodNotAllowedHandler(feature: string, method: string): RequestHandler {
  return handleController(() => {
    throw new AppExpressError({
      message: `${feature}: ${method.toUpperCase()} not allowed`,
      statusCode: 405,
      code: 'METHOD_NOT_ALLOWED',
    });
  });
}

export function requireValue<T>(
  value: T | null | undefined,
  message: string,
  statusCode = 400,
  code = 'INVALID_REQUEST',
): T {
  if (value === undefined || value === null || value === '') {
    throw new AppExpressError({
      message,
      statusCode,
      code,
    });
  }

  return value;
}
