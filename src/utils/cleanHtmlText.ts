/**
 * Removes HTML tags and decodes HTML entities from a string.
 * This function uses native browser APIs to safely clean HTML content
 * without requiring external dependencies.
 *
 * @param html - The HTML string to clean
 * @returns The cleaned text with HTML tags removed and entities decoded
 */
export function cleanHtmlText(html: string): string {
  // Strip HTML tags and decode entities without external dependencies
  // Replace all HTML tags with spaces to ensure words don't concatenate
  // (double spaces will be normalized later)
  let text = html.replace(/<[^>]*>/g, ' ');

  // Decode HTML entities using a temporary DOM element
  // This works safely in the browser/Electron environment
  const decoder = document.createElement('textarea');
  decoder.innerHTML = text;
  text = decoder.value;

  // Remove footnote markers and normalize whitespace
  text = text
    .replace(/\+/g, '') // Remove + symbols
    .replace(/\*/g, '') // Remove * symbols
    .replace(/\s+/g, ' '); // Normalize whitespace

  // Fix spacing issues where sentences are concatenated without spaces after periods
  const result = text
    .replace(/\.([A-ZÄÖÜ])/g, '. $1') // Add space after period before capital letters
    .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
    .trim();

  return result;
}
