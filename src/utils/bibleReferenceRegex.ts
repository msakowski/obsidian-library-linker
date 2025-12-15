export const bibleReferenceRegex =
  /([1-5]{1}\.?\s?)?[A-Za-zäöüßáéíóúâêôãõ\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]{1,24}\.?\s?\d+:\d+(?:-\d+(?::\d+)?)?(?:\s*,\s*\d+(?:-\d+)?)*/gi;
// 24 random number. Apostelgeschichte is 17 characters long.
// should be enough for language support.
// For automatic detection, requires "chapter:verse" format to avoid false positives
// Single-chapter books are supported in manual parsing (parseBibleReference) with "Book verse" format
