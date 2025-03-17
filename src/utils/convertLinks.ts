import { convertBibleReference } from '@/utils/convertBibleReference';
import { convertPublicationReference } from '@/utils/convertPublicationReference';

export type ConversionType = 'bible' | 'publication' | 'all' | 'web';

export function convertLinks(content: string, type: ConversionType = 'all'): string {
  const wikiLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

  return content.replace(wikiLinkRegex, (match, text, url) => {
    // Handle Bible references
    if (url.startsWith('jwpub://b/') && (type === 'bible' || type === 'all')) {
      return `[${text}](${convertBibleReference(url)})`;
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
