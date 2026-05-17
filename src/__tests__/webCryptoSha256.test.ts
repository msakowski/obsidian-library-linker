/**
 * @jest-environment node
 */
import { webCryptoSha256 } from '@/utils/webCryptoSha256';

describe('webCryptoSha256', () => {
  test('returns the hex SHA-256 of an empty buffer', async () => {
    const result = await webCryptoSha256(new Uint8Array(0));
    expect(result).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });

  test('returns the hex SHA-256 of "abc"', async () => {
    const bytes = new TextEncoder().encode('abc');
    const result = await webCryptoSha256(bytes);
    expect(result).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });
});
