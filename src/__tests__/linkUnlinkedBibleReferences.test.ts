import { linkUnlinkedBibleReferences } from '@/utils/linkUnlinkedBibleReferences';
import type { LinkReplacerSettings } from '@/types';
import { TEST_DEFAULT_SETTINGS } from 'mocks/plugin';
import { initializeTestBibleBooks } from './__helpers__/initializeBibleBooksForTests';

interface CallbackArgs {
  changes: Array<{
    from: { line: number; ch: number };
    to: { line: number; ch: number };
    text: string;
  }>;
  error: string | undefined;
}

beforeAll(() => {
  initializeTestBibleBooks();
});

describe('linkUnlinkedBibleReferences', () => {
  let settings: LinkReplacerSettings;
  let callbackMock: jest.Mock<void, [CallbackArgs]>;

  const testText = `How can we respond appreciatively to Jehovah for having provided the ransom? By giving his work priority in our life. (Matt. 6:33) After all, Jesus died "so that those who live should live no longer for themselves, but for him who died for them and was raised up." (2 Cor. 5:15) We certainly do not want to miss the purpose of Jehovah's undeserved kindness.​—Read 2 Corinthians 6:1-3, 6-12.`;
  beforeEach(() => {
    settings = TEST_DEFAULT_SETTINGS;

    callbackMock = jest.fn<void, [CallbackArgs]>();
  });

  test('should find and create links for Bible references', () => {
    // Act
    linkUnlinkedBibleReferences(testText, settings, callbackMock);

    // Assert
    expect(callbackMock).toHaveBeenCalled();

    const callbackArgs = callbackMock.mock.calls[0][0];
    expect(callbackArgs.error).toBeUndefined();

    // Should have 3 changes (one for each Bible reference)
    expect(callbackArgs.changes.length).toBe(3);

    // Check each reference was linked correctly
    const changes = callbackArgs.changes;

    // First reference: Matt. 6:33
    expect(changes[0].text).toBe('[Matt. 6:33](jwlibrary:///finder?bible=40006033&wtlocale=E)');

    // Second reference: 2 Cor. 5:15
    expect(changes[1].text).toBe('[2 Cor. 5:15](jwlibrary:///finder?bible=47005015&wtlocale=E)');

    // Third reference: 2 Corinthians 6:1-3, 6-12
    expect(changes[2].text).toContain('2 Corinthians 6:1-3');
    expect(changes[2].text).toContain('6-12');
    expect(changes[2].text).toContain('jwlibrary:///finder?bible=');
  });

  test('should not link Bible references that are already links', () => {
    // Arrange
    const textWithExistingLinks = `How can we respond appreciatively to Jehovah for having provided the ransom? By giving his work priority in our life. ([Matt. 6:33](jwlibrary:///finder?bible=40006033&wtlocale=E)) After all, Jesus died "so that those who live should live no longer for themselves, but for him who died for them and was raised up." (2 Cor. 5:15) We certainly do not want to miss the purpose of Jehovah's undeserved kindness.​—Read 2 Corinthians 6:1-3, 6-12.`;

    // Act
    linkUnlinkedBibleReferences(textWithExistingLinks, settings, callbackMock);

    // Assert
    const callbackArgs = callbackMock.mock.calls[0][0];
    expect(callbackArgs.error).toBeUndefined();

    // Should have found and linked 2 references, not 3
    expect(callbackArgs.changes.length).toBe(2);
  });

  test('should call callback with error when no Bible references are found', () => {
    // Arrange
    const textWithNoReferences = `How can we respond appreciatively to Jehovah for having provided the ransom? By giving his work priority in our life. After all, Jesus died "so that those who live should live no longer for themselves, but for him who died for them and was raised up." We certainly do not want to miss the purpose of Jehovah's undeserved kindness.`;

    // Act
    linkUnlinkedBibleReferences(textWithNoReferences, settings, callbackMock);

    // Assert
    expect(callbackMock).toHaveBeenCalledWith({
      changes: [],
      error: 'notices.noBibleReferencesFound',
    });
  });

  test('should preserve spaces around Bible references when converting to links', () => {
    // Arrange
    const textWithSpaces = `Some text before John 3:16 and some text after.`;

    // Act
    linkUnlinkedBibleReferences(textWithSpaces, settings, callbackMock);

    // Assert
    expect(callbackMock).toHaveBeenCalled();

    const callbackArgs = callbackMock.mock.calls[0][0];
    expect(callbackArgs.error).toBeUndefined();
    expect(callbackArgs.changes.length).toBe(1);

    const change = callbackArgs.changes[0];

    // The change should only replace the Bible reference itself, not the surrounding spaces
    // "Some text before John 3:16 and some text after."
    //                   ^         ^
    //                   17        25 (John 3:16 is 8 characters)
    expect(change.from.ch).toBe(17); // Position after "Some text before "
    expect(change.to.ch).toBe(26); // Position before " and some text after"

    // The replacement text should be the markdown link
    expect(change.text).toBe('[John 3:16](jwlibrary:///finder?bible=43003016&wtlocale=E)');

    // Verify the final text would preserve spaces by reconstructing what the result would be
    const originalLine = textWithSpaces;
    const beforeReference = originalLine.substring(0, change.from.ch);
    const afterReference = originalLine.substring(change.to.ch);
    const resultText = beforeReference + change.text + afterReference;

    expect(resultText).toBe(
      'Some text before [John 3:16](jwlibrary:///finder?bible=43003016&wtlocale=E) and some text after.',
    );
  });
});
