import type { NextFunction, Request, Response } from 'express';
import { describe, expect, it } from 'vitest';

import { isLoopbackAddress, requireLoopback } from '../../../src/middleware/loopback.middleware';

describe('loopback middleware', () => {
  it('accepts local addresses', () => {
    expect(isLoopbackAddress('127.0.0.1')).toBe(true);
    expect(isLoopbackAddress('::1')).toBe(true);
    expect(isLoopbackAddress('::ffff:127.0.0.1')).toBe(true);
  });

  it('rejects a network address before the handler runs', () => {
    const result = run('192.168.0.20');
    expect(result.statusCode).toBe(404);
    expect(result.ended).toBe(true);
    expect(result.nexted).toBe(false);
  });

  it('lets a loopback request continue', () => {
    const result = run('::ffff:127.0.0.1');
    expect(result.nexted).toBe(true);
    expect(result.ended).toBe(false);
  });
});

function run(address: string | undefined): { statusCode: number; ended: boolean; nexted: boolean } {
  const req = { socket: { remoteAddress: address } } as Request;
  const state = { statusCode: 0, ended: false, nexted: false };
  const res = {
    status(code: number) {
      state.statusCode = code;
      return this;
    },
    end() {
      state.ended = true;
      return this;
    },
  } as unknown as Response;
  const next: NextFunction = () => {
    state.nexted = true;
  };
  requireLoopback(req, res, next);
  return state;
}
