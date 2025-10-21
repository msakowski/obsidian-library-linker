/**
 * @jest-environment jsdom
 */
import { cleanHtmlText } from '@/utils/cleanHtmlText';

describe('cleanHtmlText', () => {
  describe('HTML tag removal', () => {
    it('should remove simple HTML tags', () => {
      const html = '<p>Hello world</p>';
      expect(cleanHtmlText(html)).toBe('Hello world');
    });

    it('should remove nested HTML tags', () => {
      const html = '<div><p>Hello <strong>world</strong></p></div>';
      expect(cleanHtmlText(html)).toBe('Hello world');
    });

    it('should remove HTML tags with attributes', () => {
      const html = '<p class="text" id="para">Hello world</p>';
      expect(cleanHtmlText(html)).toBe('Hello world');
    });

    it('should remove self-closing tags', () => {
      const html = 'Hello<br/>world';
      expect(cleanHtmlText(html)).toBe('Hello world');
    });

    it('should handle multiple consecutive tags', () => {
      const html = '<span></span><div></div>Text';
      expect(cleanHtmlText(html)).toBe('Text');
    });
  });

  describe('HTML entity decoding', () => {
    it('should decode common HTML entities', () => {
      const html = 'Hello&nbsp;world&amp;test';
      expect(cleanHtmlText(html)).toBe('Hello world&test');
    });

    it('should decode numeric HTML entities', () => {
      const html = 'Hello&#32;world';
      expect(cleanHtmlText(html)).toBe('Hello world');
    });

    it('should decode special characters', () => {
      const html = '&lt;div&gt;&quot;test&quot;&apos;';
      expect(cleanHtmlText(html)).toBe('<div>"test"\'');
    });

    it('should decode accented characters', () => {
      const html = '&auml;&ouml;&uuml;&Auml;&Ouml;&Uuml;';
      expect(cleanHtmlText(html)).toBe('äöüÄÖÜ');
    });
  });

  describe('Footnote marker removal', () => {
    it('should remove plus symbols', () => {
      const html = 'Hello+ world+';
      expect(cleanHtmlText(html)).toBe('Hello world');
    });

    it('should remove asterisk symbols', () => {
      const html = 'Hello* world*';
      expect(cleanHtmlText(html)).toBe('Hello world');
    });

    it('should remove both plus and asterisk symbols', () => {
      const html = 'Hello+ world* test+*';
      expect(cleanHtmlText(html)).toBe('Hello world test');
    });

    it('should remove footnote markers from complex HTML', () => {
      const html = '<p>Hello+ <span>world*</span></p>';
      expect(cleanHtmlText(html)).toBe('Hello world');
    });
  });

  describe('Whitespace normalization', () => {
    it('should normalize multiple spaces to single space', () => {
      const html = 'Hello    world';
      expect(cleanHtmlText(html)).toBe('Hello world');
    });

    it('should normalize tabs and newlines', () => {
      const html = 'Hello\t\n\r  world';
      expect(cleanHtmlText(html)).toBe('Hello world');
    });

    it('should trim leading and trailing whitespace', () => {
      const html = '   Hello world   ';
      expect(cleanHtmlText(html)).toBe('Hello world');
    });

    it('should handle whitespace from HTML tags', () => {
      const html = '<p>  Hello  </p>  <p>  world  </p>';
      expect(cleanHtmlText(html)).toBe('Hello world');
    });
  });

  describe('Sentence spacing fixes', () => {
    it('should add space after period before capital letter', () => {
      const html = 'First sentence.Second sentence';
      expect(cleanHtmlText(html)).toBe('First sentence. Second sentence');
    });

    it('should handle German umlauts', () => {
      const html = 'First sentence.Änother sentence';
      expect(cleanHtmlText(html)).toBe('First sentence. Änother sentence');
    });

    it('should not add space if space already exists', () => {
      const html = 'First sentence. Second sentence';
      expect(cleanHtmlText(html)).toBe('First sentence. Second sentence');
    });

    it('should handle multiple sentences', () => {
      const html = 'First.Second.Third';
      expect(cleanHtmlText(html)).toBe('First. Second. Third');
    });
  });

  describe('Complex scenarios', () => {
    it('should handle Bible verse with HTML and entities', () => {
      const html = '<p>In the beginning&nbsp;God created+ the heavens* and the&nbsp;earth.</p>';
      expect(cleanHtmlText(html)).toBe('In the beginning God created the heavens and the earth.');
    });

    it('should handle multiple verses with tags', () => {
      const html =
        '<span class="verse">First verse.</span><span class="verse">Second verse.</span>';
      expect(cleanHtmlText(html)).toBe('First verse. Second verse.');
    });

    it('should handle verse with footnote links', () => {
      const html =
        '<p>Text with<a class="footnoteLink">+</a> footnote and<sup>*</sup> reference</p>';
      expect(cleanHtmlText(html)).toBe('Text with footnote and reference');
    });

    it('should handle empty string', () => {
      expect(cleanHtmlText('')).toBe('');
    });

    it('should handle string with only HTML tags', () => {
      const html = '<div><span></span></div>';
      expect(cleanHtmlText(html)).toBe('');
    });

    it('should handle string with only whitespace', () => {
      const html = '   \n\t   ';
      expect(cleanHtmlText(html)).toBe('');
    });

    it('should preserve meaningful punctuation', () => {
      const html = '<p>Hello, world! How are you?</p>';
      expect(cleanHtmlText(html)).toBe('Hello, world! How are you?');
    });

    it('should handle real JW.org HTML structure', () => {
      const html = `
        <span class="verse">
          <a data-anchor='#v10100101'>1</a>
          In&nbsp;the beginning+ God* created the&nbsp;heavens and&nbsp;the earth.
        </span>
      `;
      expect(cleanHtmlText(html)).toBe('1 In the beginning God created the heavens and the earth.');
    });

    it('should handle concatenated sentences without spaces', () => {
      const html = '<p>First sentence.</p><p>Second sentence.</p>';
      expect(cleanHtmlText(html)).toBe('First sentence. Second sentence.');
    });
  });
});
