import type { BibleReference, ReferenceRange } from '@/types';

export interface NormalizedRange {
  chapterStart: number;
  chapterEnd: number;
  verseStart: number;
  verseEnd: number;
}

export function normalizeRange(range: ReferenceRange): NormalizedRange {
  return {
    chapterStart: range.chapterStart,
    chapterEnd: range.chapterEnd ?? range.chapterStart,
    verseStart: range.verseStart,
    verseEnd: range.verseEnd ?? range.verseStart,
  };
}

export function isCrossChapter(ref: BibleReference): boolean {
  return ref.ranges.some((r) => r.chapterEnd !== undefined && r.chapterEnd !== r.chapterStart);
}
