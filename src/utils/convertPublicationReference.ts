/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { stringify } from 'qs';

export function convertPublicationReference(url: string): string {
  const parts = url.split('/');
  const pubRef = parts[3];
  const [locale, docId] = pubRef.split(':');
  const paragraph = parts[4];

  const params = stringify({
    wtlocale: locale,
    docid: docId,
    par: paragraph,
  });

  return `jwlibrary:///finder?${params}`;
}
