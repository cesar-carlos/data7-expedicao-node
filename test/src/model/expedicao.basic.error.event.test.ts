import { describe, expect, test } from 'vitest';
import ExpedicaoBasicErrorEvent from '../../../src/model/expedicao.basic.error.event';

describe('expedicao.basic.error.event', () => {
  test('should keep legacy shape and append optional metadata when available', () => {
    const payload = new ExpedicaoBasicErrorEvent({
      Session: 'session-1',
      ResponseIn: 'response-1',
      Error: 'failed',
      Code: 'INVALID_PAYLOAD',
      RequestId: 'request-1',
    }).toJson();

    expect(payload).toEqual({
      Session: 'session-1',
      ResponseIn: 'response-1',
      Error: ['failed'],
      Code: 'INVALID_PAYLOAD',
      RequestId: 'request-1',
    });
  });
});
