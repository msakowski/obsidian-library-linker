import { extractBibleReferenceFromMatch } from '@/utils/parseBibleReference';
import { convertBibleTextToMarkdownLink } from '@/utils/convertBibleTextToMarkdownLink';
import type { BibleReference, LinkReplacerSettings } from '@/types';
import { BIBLE_REFERENCE_REGEX } from '@/utils/bibleReferenceRegex';
import { logger } from '@/utils/logger';

type Change = {
  from: { line: number; ch: number };
  to: { line: number; ch: number };
  text: string;
};

export function linkUnlinkedBibleReferences(
  currentContent: string,
  settings: LinkReplacerSettings,
  callback: (settings: { changes: Change[]; error: string | undefined }) => void,
): void {
  const lines = currentContent.split('\n');

  const foundReferences: {
    line: number;
    index: number;
    text: string;
    reference: BibleReference;
  }[] = [];

  // Scan each line for Bible references using the findBibleReferenceRegex
  lines.forEach((line, lineIndex) => {
    let match;
    while ((match = BIBLE_REFERENCE_REGEX.exec(line)) !== null) {
      const result = extractBibleReferenceFromMatch(match[0], settings.language);

      if (!result) {
        logger.error('Invalid reference', { line, match, lineIndex });
        continue;
      }

      const actualIndex = match.index + result.offset;
      const actualText = result.text;

      // check if match is already a link
      if (line.includes(`[${actualText}]`)) {
        continue;
      }

      foundReferences.push({
        line: lineIndex,
        index: actualIndex,
        text: actualText,
        reference: result.reference,
      });
    }
  });

  if (foundReferences.length === 0) {
    callback({
      changes: [],
      error: 'notices.noBibleReferencesFound',
    });
    return;
  }

  // Sort references by position (line ascending, then index within line ascending)
  // This ensures we process them in document order
  const sortedRefs = [...foundReferences].sort((a, b) =>
    a.line === b.line ? a.index - b.index : a.line - b.line,
  );

  const changes = sortedRefs
    .map((ref) => {
      const convertedLink = convertBibleTextToMarkdownLink(ref.reference, settings, ref.text);

      if (convertedLink) {
        return {
          from: { line: ref.line, ch: ref.index },
          to: { line: ref.line, ch: ref.index + ref.text.length },
          text: convertedLink,
        };
      }
      return null;
    })
    .filter((change) => change !== null);

  callback({
    changes,
    error: undefined,
  });
}
