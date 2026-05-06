import { NextFunction, Request, Response } from 'express';
import AppExpressError from '../aplication/app.express.error';

export default function appErrorMiddleware(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    next(error);
    return;
  }

  const appError = AppExpressError.fromUnknown(error);
  const payload: Record<string, unknown> = {
    message: appError.message,
    code: appError.code,
  };

  if (appError.details !== undefined) {
    payload.details = appError.details;
  }

  res.status(appError.statusCode).send(payload);
}
