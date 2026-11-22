import { convertWebLink } from '@/utils/convertWebLink';
import { convertPublicationReference } from '@/utils/convertPublicationReference';
import { parseBibleReferenceFromUrl } from '@/utils/parseBibleReference';
import type { LinkReplacerSettings } from '@/types';
import { convertBibleTextToMarkdownLink } from '@/utils/convertBibleTextToMarkdownLink';
import { parseJWLibraryLink } from '@/utils/findJWLibraryLinks';

export type ConversionType = 'bible' | 'publication' | 'all';

export function convertLinks(
  content: string,
  type: ConversionType = 'all',
  settings: LinkReplacerSettings,
): string {
  const wikiLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

  return content.replace(wikiLinkRegex, (match, text: string, url: string) => {
    // Handle already-converted jwlibrary:// Bible references if reconversion is enabled
    if (
      settings.reconvertExistingLinks &&
      url.match(/^jwlibrary:\/\/\/finder\?bible=\d{8}(?:-\d{8})?/) &&
      (type === 'bible' || type === 'all')
    ) {
      const reference = parseJWLibraryLink(url);
      if (reference) {
        const convertedLink = convertBibleTextToMarkdownLink(reference, settings, text);
        if (convertedLink) {
          return convertedLink;
        }
      }
      return match;
    }

    // Handle Bible references
    if (url.startsWith('jwpub://b/') && (type === 'bible' || type === 'all')) {
      const reference = parseBibleReferenceFromUrl(url);
      const convertedLink = convertBibleTextToMarkdownLink(reference, settings, text);
      if (convertedLink) {
        return convertedLink;
      }
      return match;
    }
    // Handle publication references
    if (url.startsWith('jwpub://p/') && (type === 'publication' || type === 'all')) {
      return `[${text}](${convertPublicationReference(url)})`;
    }
    const webLink = convertWebLink(url, type);
    return webLink ? `[${text}](${webLink})` : match;
  });
}
