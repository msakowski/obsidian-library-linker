export function convertPublicationReference(url: string): string {
  const parts = url.split('/');
  const pubRef = parts[3];
  const [locale, docId] = pubRef.split(':');
  const paragraph = parts[4];

  return `jwlibrary:///finder?wtlocale=${locale}&docid=${docId}&par=${paragraph}`;
}
