import { convertBibleReference } from '@/utils/convertBibleReference';
import { convertPublicationReference } from '@/utils/convertPublicationReference';

export type ConversionType = 'bible' | 'publication' | 'all';

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
    return match;
  });
}
