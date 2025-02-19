import type { BibleReference } from '@/types';

export function formatJWLibraryLink(reference: BibleReference): string {
  const baseReference = `${reference.book}${reference.chapter}${reference.verse}`;
  const rangeReference = reference.endVerse
    ? `-${reference.book}${reference.chapter}${reference.endVerse}`
    : '';
  return `jwlibrary:///finder?bible=${baseReference}${rangeReference}`;
}
