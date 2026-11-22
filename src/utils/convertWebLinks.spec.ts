import { convertLinks } from '@/utils/convertLinks';
import { createSettings } from '@/__tests__/__helpers__/createSettings';

const settings = createSettings();

test('converts direct finder targets offline, preserving labels, language and paragraph', () => {
  const input =
    '[Jeremia](https://www.jw.org/finder?srcid=jwlshare&wtlocale=X&bible=24048027); [*Moab*](https://www.jw.org/finder?srcid=jwlshare&wtlocale=X&prefer=lang&docid=1200003097&par=25)';
  expect(convertLinks(input, 'all', settings)).toBe(
    '[Jeremia](jwlibrary:///finder?bible=24048027&wtlocale=X); [*Moab*](jwlibrary:///finder?docid=1200003097&par=25&wtlocale=X)',
  );
});

test('converts explicit WOL Bible and document targets without following cross-reference links', () => {
  const input =
    '[Verse](https://wol.jw.org/de/wol/b/r10/lp-x/nwtsty/24/48#v=24:48:27-24:48:28) [Moab](https://wol.jw.org/de/wol/d/r10/lp-x/1200003097)';
  expect(convertLinks(input, 'all', settings)).toBe(
    '[Verse](jwlibrary:///finder?bible=24048027-24048028&wtlocale=X&pub=nwtsty) [Moab](jwlibrary:///finder?docid=1200003097&wtlocale=X)',
  );
  for (const path of ['bc', 'pc']) {
    const unresolved = `[Citation](https://wol.jw.org/de/wol/${path}/r10/lp-x/202026259/1/0)`;
    expect(convertLinks(unresolved, 'all', settings)).toBe(unresolved);
  }
});

test('leaves ambiguous, unsupported and invalid targets unchanged', () => {
  for (const url of [
    'https://www.jw.org/finder?bible=24048027&bible=43003016',
    'https://www.jw.org/finder?docid=1200003097&par=',
    'https://www.jw.org/finder?bible=43003016&docid=',
    'https://www.jw.org/finder?docid=1200003097&wtlocale=',
    'https://www.jw.org/finder?docid=1200003097&pub=',
    'https://www.jw.org/finder?bible=24048027&docid=1200003097',
    'https://www.jw.org/finder?bible=99001001',
    'https://www.jw.org/finder?bible=43022001',
    'https://www.jw.org/finder?bible=43003017-43003016',
    'https://www.jw.org/finder?docid=1200003097&par=25&unknown=target',
    'https://www.jw.org/finder?docid=1200003097&par=25-2',
    'https://www.jw.org/finder?docid=1200003097#h=25',
    'https://www.jw.org.example.com/finder?bible=24048027',
    'https://user@www.jw.org/finder?bible=24048027',
    'https://wol.jw.org/de/wol/b/r10/lp-x/nwtsty/24/48',
    'https://wol.jw.org/de/wol/b/r10/lp-x/nwtsty/24/48#v=43:3:16',
    'https://wol.jw.org/de/wol/d/r10/lp-x/1200003097#h=25',
    'https://www.jw.org/en/library/books/',
    'not-a-url',
  ]) {
    const input = `[Original](${url})`;
    expect(convertLinks(input, 'all', settings), url).toBe(input);
  }
});

test('respects Bible/publication filters and preserves target parameters without applying UI language', () => {
  const bible = '[John](https://jw.org/finder?wtlocale=X&pub=nwtsty&bible=43003016-43003017)';
  const publication = '[Article](https://www.jw.org/finder?docid=1200003097&par=25-26)';
  expect(convertLinks(bible, 'publication', settings)).toBe(bible);
  expect(convertLinks(publication, 'bible', settings)).toBe(publication);
  expect(convertLinks(bible, 'bible', settings)).toBe(
    '[John](jwlibrary:///finder?bible=43003016-43003017&wtlocale=X&pub=nwtsty)',
  );
  expect(convertLinks(publication, 'publication', settings)).toBe(
    '[Article](jwlibrary:///finder?docid=1200003097&par=25-26)',
  );
});

test('preserves Markdown titles instead of consuming them as URL parameters', () => {
  const input =
    '[Article](https://www.jw.org/finder?docid=1200003097&srcid=jwlshare "Helpful title")';
  expect(convertLinks(input, 'all', settings)).toBe(input);
});
