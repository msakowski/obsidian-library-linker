import { DEFAULT_SETTINGS } from '@/main';
import type { LinkReplacerSettings } from '@/types';

export const TEST_DEFAULT_SETTINGS: LinkReplacerSettings = {
  ...DEFAULT_SETTINGS,
  suffixOutsideLink: '',
  bookLength: 'short',
};
