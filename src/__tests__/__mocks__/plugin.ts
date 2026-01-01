import { DEFAULT_SETTINGS } from '@/main';
import type { BookLength, LinkReplacerSettings } from '@/types';

export const TEST_DEFAULT_SETTINGS: LinkReplacerSettings = {
  ...DEFAULT_SETTINGS,
  suffixOutsideLink: '',
  bookLength: 'short' as BookLength,
};
