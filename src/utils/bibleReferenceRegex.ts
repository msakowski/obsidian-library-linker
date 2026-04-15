export const BIBLE_REFERENCE_REGEX = new RegExp(
  '([1-5]{1}\\.?\\s?)?[\\p{L}\\-][\\p{L}\\s\\-]{0,29}\\.?\\s?\\d+:\\d+(?:-\\d+(?::\\d+)?)?(?:\\s*,\\s*\\d+(?:-\\d+)?)*',
  'giu',
);

// Book name part: [\p{L}\-][\p{L}\s\-]{0,29}
// - Must start with a letter or hyphen (not a space) to avoid leading whitespace matches
// - Then up to 29 more letters, spaces, or hyphens (supports multi-word names like Korean "요한 계시록" and hyphenated Vietnamese "Lê-vi")
// - The chapter:verse anchor (\d+:\d+) prevents false positives from loose space matching
// For automatic detection, requires "chapter:verse" format to avoid false positives
// Single-chapter books are supported in manual parsing (parseBibleReference) with "Book verse" format
