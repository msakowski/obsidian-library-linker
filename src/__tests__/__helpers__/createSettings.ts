import type { LinkReplacerSettings } from '@/types';
import { TEST_DEFAULT_SETTINGS } from 'mocks/plugin';

// Helper function to create properly typed settings for tests
export function createSettings(
  overrides: Partial<LinkReplacerSettings> = {},
): LinkReplacerSettings {
  return {
    ...TEST_DEFAULT_SETTINGS,
    ...overrides,
  };
}
