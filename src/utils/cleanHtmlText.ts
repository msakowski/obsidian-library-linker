const BLOCK_TAG =
  /<\/?(?:address|article|aside|blockquote|br|dd|div|dl|dt|figcaption|figure|footer|h[1-6]|header|hr|li|main|nav|ol|p|pre|section|table|tbody|td|tfoot|th|thead|tr|ul)\b[^>]*>/gi;

// Empty spans that mark a line break inside a verse: `linebreak` in some EPUBs,
// `newblock` (a poem line) and `parabreak` (a paragraph) on jw.org
const LINE_BREAK_SPAN =
  /<span\b[^>]*\bclass="[^"]*\b(?:linebreak|newblock|parabreak)\b[^"]*"[^>]*>/gi;

interface CleanHtmlTextOptions {
  removeFootnoteMarkers?: boolean;
}

/**
 * Removes HTML tags and decodes HTML entities from a string.
 * This function uses native browser APIs to safely clean HTML content
 * without requiring external dependencies.
 *
 * @param html - The HTML string to clean
 * @returns The cleaned text with HTML tags removed and entities decoded
 */
export function cleanHtmlText(html: string, options: CleanHtmlTextOptions = {}): string {
  const { removeFootnoteMarkers = true } = options;

  // Strip HTML tags and decode entities without external dependencies.
  // Block-level tags and line breaks become spaces so words on either side
  // don't concatenate (double spaces are normalized later). Inline tags are
  // dropped without a space: they sit inside running text, and a space there
  // would split it, e.g. an empty footnote anchor before a comma ("unique ,").
  let text = html
    .replace(BLOCK_TAG, ' ')
    .replace(LINE_BREAK_SPAN, ' ')
    .replace(/<[^>]*>/g, '');

  // Decode HTML entities safely using DOMParser
  const parsed = new DOMParser().parseFromString(text, 'text/html');
  text = parsed.body.textContent || '';

  // Remove footnote markers and normalize whitespace
  if (removeFootnoteMarkers) {
    text = text
      .replace(/\+/g, '') // Remove + symbols
      .replace(/\*/g, ''); // Remove * symbols
  }

  text = text.replace(/\s+/g, ' '); // Normalize whitespace

  // Fix spacing issues where sentences are concatenated without spaces after periods
  const result = text
    .replace(/\.([A-ZÄÖÜ])/g, '. $1') // Add space after period before capital letters
    .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
    .trim();

  return result;
}
