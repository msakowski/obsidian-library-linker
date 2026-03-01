export function getBibleReferenceRegex(): RegExp {
  return new RegExp(
    `([1-5]{1}\\.?\\s?)?\\p{L}{1,24}\\.?\\s?\\d+:\\d+(?:-\\d+(?::\\d+)?)?(?:\\s*,\\s*\\d+(?:-\\d+)?)*`,
    'giu',
  );
}

// 24 random number. Apostelgeschichte is 17 characters long.
// should be enough for language support.
// For automatic detection, requires "chapter:verse" format to avoid false positives
// Single-chapter books are supported in manual parsing (parseBibleReference) with "Book verse" format
