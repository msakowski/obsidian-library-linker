import { beforeAll, describe, expect, test } from 'vitest';
import { initializeTestBibleBooks } from '../__tests__/__helpers__/initializeBibleBooksForTests';
import { findBook } from './findBook';

beforeAll((): void => {
  initializeTestBibleBooks(['N', 'NDF']);
});

describe.each(['N', 'NDF'] as const)('Norwegian book lookup in %s', (language): void => {
  test('prefers exact abbreviations when parsing a complete reference', (): void => {
    expect(findBook('Fil', language, { preferExactMatch: true })).toEqual(
      expect.objectContaining({ id: 50 }),
    );
  });

  test('keeps prefix matches available for suggestions', (): void => {
    expect(findBook('Fil', language)).toEqual([
      expect.objectContaining({ id: 50 }),
      expect.objectContaining({ id: 57 }),
    ]);
  });

  test('retains ambiguous prefixes when there is no exact match', (): void => {
    expect(findBook('Fi', language, { preferExactMatch: true })).toEqual([
      expect.objectContaining({ id: 50 }),
      expect.objectContaining({ id: 57 }),
    ]);
  });
});
