import { convertPublicationReference } from '@/utils/convertPublicationReference';
import { parseBibleReferenceFromUrl } from '@/utils/parseBibleReference';
import { LinkReplacerSettings } from '@/types';
import { convertBibleTextToMarkdownLink } from './convertBibleTextToMarkdownLink';

export type ConversionType = 'bible' | 'publication' | 'all' | 'web';

export function convertLinks(
  content: string,
  type: ConversionType = 'all',
  settings: LinkReplacerSettings,
): string {
  const wikiLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

  return content.replace(wikiLinkRegex, (match, text: string, url: string) => {
    // Handle Bible references
    if (url.startsWith('jwpub://b/') && (type === 'bible' || type === 'all')) {
      const reference = parseBibleReferenceFromUrl(url, settings.language);
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
    if (url.startsWith('https://www.jw.org/') && type === 'web') {
      return `[${text}](${convertWebLink(url)})`;
    }
    return match;
  });
}

export function convertWebLink(url: string): string {
  // Replaces jw.org links with jwlibrary:// links, removing the srcid parameter which is not needed.
  if (url.includes('srcid=')) {
    url = url.replace(/&?srcid=[^&]+/, '');
  }
  return url.replace('https://www.jw.org/', 'jwlibrary:///');
}
