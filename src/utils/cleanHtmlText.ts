const BLOCK_ELEMENTS = new Set([
  'address',
  'article',
  'aside',
  'blockquote',
  'br',
  'dd',
  'div',
  'dl',
  'dt',
  'figcaption',
  'figure',
  'footer',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'hr',
  'li',
  'main',
  'nav',
  'ol',
  'p',
  'pre',
  'section',
  'table',
  'tbody',
  'td',
  'tfoot',
  'th',
  'thead',
  'tr',
  'ul',
]);

// Empty spans that mark a line break inside a verse: `linebreak` in some EPUBs,
// `newblock` (a poem line) and `parabreak` (a paragraph) on jw.org
const LINE_BREAK_SPAN_SELECTOR = 'span.linebreak, span.newblock, span.parabreak';

// Elements whose content is never readable text
const NON_TEXT_SELECTOR = 'script, style, template, noscript';

interface CleanHtmlTextOptions {
  removeFootnoteMarkers?: boolean;
}

/**
 * Extracts the readable text of an HTML fragment.
 * The fragment is parsed with DOMParser (which never runs scripts), so tags are
 * removed and entities decoded by the browser instead of by pattern matching.
 *
 * @param html - The HTML string to clean
 * @returns The cleaned text with HTML tags removed and entities decoded
 */
export function cleanHtmlText(html: string, options: CleanHtmlTextOptions = {}): string {
  const { removeFootnoteMarkers = true } = options;

  const { body } = new DOMParser().parseFromString(html, 'text/html');
  body.querySelectorAll(NON_TEXT_SELECTOR).forEach((element) => element.remove());

  // Block-level elements and line breaks are surrounded by spaces so words on
  // either side don't concatenate (double spaces are normalized later). Inline
  // elements get no space: they sit inside running text, and a space there
  // would split it, e.g. an empty footnote anchor before a comma ("unique ,").
  body.querySelectorAll('*').forEach((element) => {
    if (BLOCK_ELEMENTS.has(element.localName)) {
      element.before(' ');
      element.after(' ');
    } else if (element.matches(LINE_BREAK_SPAN_SELECTOR)) {
      element.before(' ');
    }
  });

  let text = body.textContent || '';

  // Remove footnote markers and normalize whitespace
  if (removeFootnoteMarkers) {
    text = text
      .replace(/\+/g, '') // Remove + symbols
      .replace(/\*/g, ''); // Remove * symbols
  }

  text = text
    // Drop zero-width characters: jw.org puts one after hyphens ("Déplace-\u200btoi")
    // to allow a line break there, which makes the copied text unsearchable
    .replace(/[\u200b-\u200d\ufeff]/g, '')
    .replace(/\s+/g, ' '); // Normalize whitespace

  // Fix spacing issues where sentences are concatenated without spaces after periods
  const result = text
    .replace(/\.([A-ZÄÖÜ])/g, '. $1') // Add space after period before capital letters
    .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
    .trim();

  return result;
}
