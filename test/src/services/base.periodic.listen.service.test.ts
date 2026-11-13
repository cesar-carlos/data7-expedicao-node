import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BasePeriodicListenService from '../../../src/services/base.periodic.listen.service';

vi.mock('../../../src/infra/app.logger', () => ({ logAppInfo: vi.fn(), logAppError: vi.fn() }));

class Listener extends BasePeriodicListenService {
  readonly emit = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
  protected emitData(): Promise<void> { return this.emit(); }
}

describe('BasePeriodicListenService scheduling', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); });

  it('should pause emissions and resume on the next scheduled tick', async () => {
    const service = new Listener(1000);
    service.start();
    await vi.advanceTimersByTimeAsync(0);
    service.pause();
    await vi.advanceTimersByTimeAsync(3000);
    expect(service.emit).toHaveBeenCalledTimes(1);
    expect(service.isPaused()).toBe(true);
    service.resume();
    await vi.advanceTimersByTimeAsync(999);
    expect(service.emit).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(service.emit).toHaveBeenCalledTimes(2);
    service.stop();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('should back off after consecutive failures and restore the interval after success', async () => {
    const service = new Listener(1000);
    service.emit.mockRejectedValueOnce(new Error('first')).mockRejectedValueOnce(new Error('second'));
    service.start();
    await vi.advanceTimersByTimeAsync(1999);
    expect(service.emit).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(service.emit).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(3999);
    expect(service.emit).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(1);
    expect(service.emit).toHaveBeenCalledTimes(3);
    await vi.advanceTimersByTimeAsync(1000);
    expect(service.emit).toHaveBeenCalledTimes(4);
  });

  it('should cap failure backoff at 120 seconds', async () => {
    const service = new Listener(8000);
    service.emit.mockRejectedValue(new Error('offline'));
    service.start();
    await vi.advanceTimersByTimeAsync(16000 + 32000 + 64000);
    expect(service.emit).toHaveBeenCalledTimes(4);
    for (let i = 0; i < 4; i++) {
      await vi.advanceTimersByTimeAsync(119999);
      expect(service.emit).toHaveBeenCalledTimes(4 + i);
      await vi.advanceTimersByTimeAsync(1);
      expect(service.emit).toHaveBeenCalledTimes(5 + i);
    }
  });

  it.each([false, true])('should not reschedule after stop during an active emission (failure: %s)', async (fails) => {
    let finish!: () => void;
    const service = new Listener(1000);
    service.emit.mockImplementationOnce(() => new Promise<void>((resolve, reject) => {
      finish = () => fails ? reject(new Error('offline')) : resolve();
    }));
    service.start();
    service.start();
    await vi.advanceTimersByTimeAsync(10000);
    expect(service.emit).toHaveBeenCalledTimes(1);
    service.stop();
    finish();
    await vi.advanceTimersByTimeAsync(10000);
    expect(service.emit).toHaveBeenCalledTimes(1);
    expect(service.isRunning()).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });
});
