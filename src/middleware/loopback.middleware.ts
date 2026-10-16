import { NextFunction, Request, Response } from 'express';

const LOOPBACK_ADDRESSES = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);

export function isLoopbackAddress(address: string | undefined): boolean {
  if (!address) {
    return false;
  }
  return LOOPBACK_ADDRESSES.has(address);
}

export function requireLoopback(req: Request, res: Response, next: NextFunction): void {
  if (!isLoopbackAddress(req.socket.remoteAddress)) {
    res.status(404).end();
    return;
  }
  next();
}
