import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import AppExpressError from '../aplication/app.express.error';

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    void res;

    try {
      const validatedData = schema.parse(req.body);
      (req as any).validatedBody = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(
          new AppExpressError({
            message: 'Dados inválidos',
            statusCode: 400,
            code: 'VALIDATION_ERROR',
            details: mapZodIssues(error),
          }),
        );
        return;
      }

      next(error);
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    void res;

    try {
      const validatedData = schema.parse(req.query);
      (req as any).validatedQuery = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(
          new AppExpressError({
            message: 'Parâmetros de consulta inválidos',
            statusCode: 400,
            code: 'VALIDATION_ERROR',
            details: mapZodIssues(error),
          }),
        );
        return;
      }

      next(error);
    }
  };
};

export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    void res;

    try {
      const validatedData = schema.parse(req.params);
      (req as any).validatedParams = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(
          new AppExpressError({
            message: 'Parâmetros da URL inválidos',
            statusCode: 400,
            code: 'VALIDATION_ERROR',
            details: mapZodIssues(error),
          }),
        );
        return;
      }

      next(error);
    }
  };
};

function mapZodIssues(error: ZodError): Array<{ field: string; message: string; received: unknown }> {
  return error.issues.map((issue: any) => ({
    field: issue.path.join('.'),
    message: issue.message,
    received: issue.received,
  }));
}
