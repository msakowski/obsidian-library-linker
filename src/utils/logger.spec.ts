import { afterEach, describe, expect, it, vi } from 'vitest';
import { logger } from './logger';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('logger', () => {
  it.each(['warn', 'error'] as const)(
    'preserves the console receiver and prefix for %s',
    (method) => {
      const spy = vi.spyOn(console, method).mockImplementation(() => {});

      logger[method]('message', { detail: 'context' });

      expect(spy).toHaveBeenCalledWith('[JWLinker]', 'message', { detail: 'context' });
      expect(spy.mock.contexts).toEqual([console]);
    },
  );

  it('suppresses debug output when debug mode is disabled', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});

    logger.log('message');

    expect(spy).not.toHaveBeenCalled();
  });
});
