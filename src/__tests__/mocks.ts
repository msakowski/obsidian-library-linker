import { DEFAULT_SETTINGS } from '@/main';
import type { BookLength } from '@/types';

export const TEST_DEFAULT_SETTINGS = {
  ...DEFAULT_SETTINGS,
  suffixOutsideLink: '',
  bookLength: 'short' as BookLength,
};
