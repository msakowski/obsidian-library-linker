import { parseBibleReference } from '@/utils/parseBibleReference';
import { formatJWLibraryLink } from '@/utils/formatJWLibraryLink';
import { formatBibleText } from '@/utils/formatBibleText';

export function convertBibleTextToLink(input: string): string {
  try {
    const reference = parseBibleReference(input);
    return formatJWLibraryLink(reference);
  } catch (error) {
    console.error('Error converting Bible text:', error.message);
    return input;
  }
}

export function convertBibleTextToMarkdownLink(input: string, short = false): string {
  try {
    const url = convertBibleTextToLink(input);
    const formattedText = formatBibleText(input, short);
    // Only create markdown link if conversion was successful
    if (url !== input) {
      return `[${formattedText}](${url})`;
    }
    return input;
  } catch (error) {
    return input;
  }
}
