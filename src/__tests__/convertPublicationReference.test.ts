import { convertPublicationReference } from '@/utils/convertPublicationReference';

describe('convertPublicationReference', () => {
  test('converts publication reference with locale and docId', () => {
    expect(convertPublicationReference('jwpub://p/X:2017647/27')).toBe(
      'jwlibrary:///finder?wtlocale=X&docid=2017647&par=27',
    );
  });

  test('handles different paragraph numbers', () => {
    expect(convertPublicationReference('jwpub://p/X:2005125/14')).toBe(
      'jwlibrary:///finder?wtlocale=X&docid=2005125&par=14',
    );
    expect(convertPublicationReference('jwpub://p/X:2005125/15-16')).toBe(
      'jwlibrary:///finder?wtlocale=X&docid=2005125&par=15-16',
    );
  });
});

export {};
