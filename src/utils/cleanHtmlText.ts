/**
 * Removes HTML tags and decodes HTML entities from a string.
 * This function uses native browser APIs to safely clean HTML content
 * without requiring external dependencies.
 *
 * @param html - The HTML string to clean
 * @returns The cleaned text with HTML tags removed and entities decoded
 */
export function cleanHtmlText(html: string): string {
  console.log('[cleanHtmlText] Input HTML (first 300 chars):', html.substring(0, 300));
  console.log('[cleanHtmlText] Input HTML length:', html.length);

  // Strip HTML tags and decode entities without external dependencies
  // Replace all HTML tags with spaces to ensure words don't concatenate
  // (double spaces will be normalized later)
  let text = html.replace(/<[^>]*>/g, ' ');
  console.log('[cleanHtmlText] After removing HTML tags:', text.substring(0, 300));

  // Decode HTML entities using a temporary DOM element
  // This works safely in the browser/Electron environment
  try {
    const decoder = document.createElement('textarea');
    decoder.innerHTML = text;
    text = decoder.value;
    console.log('[cleanHtmlText] After decoding HTML entities:', text.substring(0, 300));
  } catch (error) {
    console.error('[cleanHtmlText] Error decoding HTML entities:', error);
    console.error('[cleanHtmlText] document object available:', typeof document !== 'undefined');
    console.error('[cleanHtmlText] createElement available:', typeof document?.createElement === 'function');
  }

  // Remove footnote markers and normalize whitespace
  text = text
    .replace(/\+/g, '') // Remove + symbols
    .replace(/\*/g, '') // Remove * symbols
    .replace(/\s+/g, ' '); // Normalize whitespace
  console.log('[cleanHtmlText] After removing footnote markers:', text.substring(0, 300));

  // Fix spacing issues where sentences are concatenated without spaces after periods
  const result = text
    .replace(/\.([A-ZÄÖÜ])/g, '. $1') // Add space after period before capital letters
    .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
    .trim();

  console.log('[cleanHtmlText] Final result:', result);
  console.log('[cleanHtmlText] Final result length:', result.length);

  return result;
}
