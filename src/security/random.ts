const UINT32_RANGE = 0x1_0000_0000;

export type RandomByteSource = (buffer: Uint8Array<ArrayBuffer>) => void;

const webCryptoSource: RandomByteSource = (buffer) => {
  if (typeof crypto === 'undefined' || typeof crypto.getRandomValues !== 'function') {
    throw new Error('Web Crypto getRandomValues is unavailable in this environment.');
  }

  crypto.getRandomValues(buffer);
};

/**
 * Returns an unbiased integer in [0, maxExclusive).
 *
 * Uses rejection sampling to avoid modulo bias: values above the largest
 * multiple of maxExclusive are discarded before applying modulo.
 */
export function secureRandomInt(
  maxExclusive: number,
  source: RandomByteSource = webCryptoSource,
): number {
  if (!Number.isSafeInteger(maxExclusive) || maxExclusive <= 0 || maxExclusive > UINT32_RANGE) {
    throw new RangeError('maxExclusive must be a positive safe integer no greater than 2^32.');
  }

  const limit = Math.floor(UINT32_RANGE / maxExclusive) * maxExclusive;
  const bytes = new Uint8Array(4);
  const words = new Uint32Array(bytes.buffer);

  for (;;) {
    source(bytes);
    const value = words[0];

    if (value < limit) {
      return value % maxExclusive;
    }
  }
}

export function secureRandomBytes(
  length: number,
  source: RandomByteSource = webCryptoSource,
): Uint8Array {
  if (!Number.isSafeInteger(length) || length < 0) {
    throw new RangeError('length must be a non-negative safe integer.');
  }

  const bytes = new Uint8Array(length);
  if (length > 0) {
    source(bytes);
  }
  return bytes;
}

export function secureRandomChoice<T>(
  items: readonly T[],
  source: RandomByteSource = webCryptoSource,
): T {
  if (items.length === 0) {
    throw new RangeError('Cannot choose from an empty collection.');
  }

  return items[secureRandomInt(items.length, source)];
}

export function secureShuffle<T>(
  items: readonly T[],
  source: RandomByteSource = webCryptoSource,
): T[] {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = secureRandomInt(index + 1, source);
    const current = result[index];
    result[index] = result[swapIndex];
    result[swapIndex] = current;
  }

  return result;
}
