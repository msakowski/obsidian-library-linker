import { describe, expect, test, vi } from 'vitest';
import { ConfiguredBibleCitationProvider } from '@/services/ConfiguredBibleCitationProvider';
import { DEFAULT_SETTINGS } from '@/main';
import type {
  BibleCitationProvider,
  BibleCitationResult,
  BibleReference,
  LinkReplacerSettings,
} from '@/types';

const reference = { book: 43, chapter: 3, verseRanges: [{ start: 16, end: 16 }] } as BibleReference;

const result = (source: 'offline' | 'online', success: boolean): BibleCitationResult => ({
  success,
  source,
  text: success ? `${source} text` : '',
  citation: 'John 3:16',
  error: success ? undefined : `${source} error`,
});

function createProvider(options: {
  allowOnlineFallback: boolean;
  offlineSucceeds: boolean;
  offlineAvailable?: boolean;
}) {
  const settings: LinkReplacerSettings = {
    ...structuredClone(DEFAULT_SETTINGS),
    offlineBible: { allowOnlineFallback: options.allowOnlineFallback },
  };
  const offline = {
    getCitation: vi.fn().mockResolvedValue(result('offline', options.offlineSucceeds)),
    isLanguageAvailable: vi.fn().mockResolvedValue(options.offlineAvailable ?? false),
  } satisfies BibleCitationProvider;
  const online = {
    getCitation: vi.fn().mockResolvedValue(result('online', true)),
    isLanguageAvailable: vi.fn().mockResolvedValue(true),
  } satisfies BibleCitationProvider;
  const provider = new ConfiguredBibleCitationProvider(
    () => settings,
    offline,
    online,
    (key) => key,
  );
  return { provider, offline, online };
}

describe('ConfiguredBibleCitationProvider', () => {
  test.each([true, false])(
    'uses the offline Bible first (online fallback %s)',
    async (allowOnlineFallback) => {
      const { provider, online } = createProvider({ allowOnlineFallback, offlineSucceeds: true });
      await expect(provider.getCitation(reference, 'E')).resolves.toMatchObject({
        success: true,
        source: 'offline',
      });
      expect(online.getCitation).not.toHaveBeenCalled();
    },
  );

  test('falls back online only when online fallback is allowed', async () => {
    const { provider, online } = createProvider({
      allowOnlineFallback: true,
      offlineSucceeds: false,
    });
    await expect(provider.getCitation(reference, 'E')).resolves.toMatchObject({
      success: true,
      source: 'online',
    });
    expect(online.getCitation).toHaveBeenCalledOnce();
  });

  test('never goes online when online fallback is off', async () => {
    const { provider, online } = createProvider({
      allowOnlineFallback: false,
      offlineSucceeds: false,
    });
    await expect(provider.getCitation(reference, 'E')).resolves.toMatchObject({
      success: false,
      source: 'offline',
      error: 'offline error errors.onlineFallbackDisabled',
    });
    expect(online.getCitation).not.toHaveBeenCalled();
    await expect(provider.isLanguageAvailable('E')).resolves.toBe(false);
    expect(online.isLanguageAvailable).not.toHaveBeenCalled();
  });

  test('reports a language as available offline without asking online', async () => {
    const { provider, online } = createProvider({
      allowOnlineFallback: true,
      offlineSucceeds: true,
      offlineAvailable: true,
    });
    await expect(provider.isLanguageAvailable('E')).resolves.toBe(true);
    expect(online.isLanguageAvailable).not.toHaveBeenCalled();
  });
});
