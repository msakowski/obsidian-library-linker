import { findJWLibraryLinks } from '@/utils/findJWLibraryLinks';
import type { Editor } from 'obsidian';

describe('findJWLibraryLinks', () => {
  let mockEditor: jest.Mocked<Editor>;

  beforeEach(() => {
    mockEditor = {
      getLine: jest.fn(),
      lastLine: jest.fn(),
    } as unknown as jest.Mocked<Editor>;
  });

  test('should find single JW Library link', () => {
    mockEditor.lastLine.mockReturnValue(0);
    mockEditor.getLine.mockReturnValue('Check out jwlibrary:///finder?bible=40005003');

    const links = findJWLibraryLinks(mockEditor);

    expect(links).toHaveLength(1);
    expect(links[0]).toMatchObject({
      url: 'jwlibrary:///finder?bible=40005003',
      lineNumber: 0,
      reference: {
        book: 40,
        chapter: 5,
        verseRanges: [{ start: 3, end: 3 }],
      },
    });
  });

  test('should find multiple links on same line', () => {
    mockEditor.lastLine.mockReturnValue(0);
    mockEditor.getLine.mockReturnValue(
      'See jwlibrary:///finder?bible=40005003 and jwlibrary:///finder?bible=43003016',
    );

    const links = findJWLibraryLinks(mockEditor);

    expect(links).toHaveLength(2);
    expect(links[0].reference.book).toBe(40);
    expect(links[1].reference.book).toBe(43);
  });

  test('should find links across multiple lines', () => {
    mockEditor.lastLine.mockReturnValue(2);
    mockEditor.getLine.mockImplementation((line: number) => {
      const lines = [
        'First line jwlibrary:///finder?bible=40005003',
        'Second line',
        'Third line jwlibrary:///finder?bible=43003016',
      ];
      return lines[line];
    });

    const links = findJWLibraryLinks(mockEditor);

    expect(links).toHaveLength(2);
    expect(links[0].lineNumber).toBe(0);
    expect(links[1].lineNumber).toBe(2);
  });

  test('should respect selection range', () => {
    mockEditor.lastLine.mockReturnValue(2);
    mockEditor.getLine.mockImplementation((line: number) => {
      const lines = [
        'First line jwlibrary:///finder?bible=40005003',
        'Second line jwlibrary:///finder?bible=43003016',
        'Third line jwlibrary:///finder?bible=45001001',
      ];
      return lines[line];
    });

    const selection = {
      text: '',
      startLine: 1,
      endLine: 1,
    };

    const links = findJWLibraryLinks(mockEditor, selection);

    expect(links).toHaveLength(1);
    expect(links[0].lineNumber).toBe(1);
    expect(links[0].reference.book).toBe(43);
  });

  test('should return empty array when no links found', () => {
    mockEditor.lastLine.mockReturnValue(0);
    mockEditor.getLine.mockReturnValue('No links here');

    const links = findJWLibraryLinks(mockEditor);

    expect(links).toHaveLength(0);
  });
});
