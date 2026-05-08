// Express Request extension for validation
declare namespace Express {
  interface Request {
    validatedQuery?: any;
    validatedBody?: any;
    validatedParams?: any;
  }
}
