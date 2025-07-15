export const bibleReferenceRegex =
  /([1-5]{1}\.?\s?)?[A-Za-zäöüß\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]{1,24}\.?\s?\d+:\d+(?:-\d+)?(?:\s*,\s*\d+(?:-\d+)?)*/gi;
// 24 random number. Apostelgeschichte is 17 characters long.
// should be enough for language support.
