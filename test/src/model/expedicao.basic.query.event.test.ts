import { describe, expect, test } from 'vitest';

import ExpedicaoBasicSelectEvent from '../../../src/model/expedicao.basic.query.event';

describe('ExpedicaoBasicSelectEvent', () => {
  test('should serialize ResponseIn with the correct property name', () => {
    const event = new ExpedicaoBasicSelectEvent({
      Session: 'session-1',
      ResponseIn: 'response-1',
      Data: [{ ok: true }],
    });

    expect(event.toJson()).toEqual({
      Session: 'session-1',
      ResponseIn: 'response-1',
      Data: [{ ok: true }],
    });
  });
});
