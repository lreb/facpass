import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  secureRandomBytes,
  secureRandomChoice,
  secureRandomInt,
  secureShuffle,
  type RandomByteSource,
} from './random';

function sourceFromValues(values: readonly number[]): {
  source: RandomByteSource;
  calls: () => number;
} {
  let index = 0;

  const source: RandomByteSource = (buffer) => {
    const value = values[index] ?? 0;
    index += 1;
    new Uint32Array(buffer.buffer, buffer.byteOffset, 1)[0] = value >>> 0;
  };

  return { source, calls: () => index };
}

describe('secureRandomInt', () => {
  it('maps values with rejection sampling instead of naive modulo bias', () => {
    const { source, calls } = sourceFromValues([0xffff_ffff, 7]);

    expect(secureRandomInt(6, source)).toBe(1);
    expect(calls()).toBe(2);
  });

  it('returns zero when the range contains one value', () => {
    const { source } = sourceFromValues([0xffff_ffff]);

    expect(secureRandomInt(1, source)).toBe(0);
  });

  it('maps accepted values to the requested range', () => {
    for (let value = 0; value < 20; value += 1) {
      const { source } = sourceFromValues([value]);
      expect(secureRandomInt(7, source)).toBe(value % 7);
    }
  });

  it('rejects invalid ranges', () => {
    expect(() => secureRandomInt(0)).toThrow(RangeError);
    expect(() => secureRandomInt(-1)).toThrow(RangeError);
    expect(() => secureRandomInt(1.5)).toThrow(RangeError);
    expect(() => secureRandomInt(2 ** 32 + 1)).toThrow(RangeError);
  });
});

describe('secureRandomBytes', () => {
  it('fills the requested number of bytes', () => {
    const source: RandomByteSource = (buffer) => {
      for (let index = 0; index < buffer.length; index += 1) {
        buffer[index] = index + 1;
      }
    };

    expect([...secureRandomBytes(3, source)]).toEqual([1, 2, 3]);
  });

  it('does not call the source for a zero-length request', () => {
    const source: RandomByteSource = () => {
      throw new Error('source should not be called');
    };

    expect(secureRandomBytes(0, source)).toHaveLength(0);
  });

  it('returns byte arrays of the requested length', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 128 }), (length) => {
        const bytes = secureRandomBytes(length);
        return bytes.length === length && bytes.every((byte) => byte >= 0 && byte <= 255);
      }),
      { numRuns: 100 },
    );
  });

  it('rejects invalid lengths', () => {
    expect(() => secureRandomBytes(-1)).toThrow(RangeError);
    expect(() => secureRandomBytes(1.5)).toThrow(RangeError);
  });
});

describe('secureRandomChoice', () => {
  it('chooses the item at the sampled index', () => {
    const { source } = sourceFromValues([2]);

    expect(secureRandomChoice(['alpha', 'bravo', 'charlie'], source)).toBe('charlie');
  });

  it('rejects an empty collection', () => {
    expect(() => secureRandomChoice([])).toThrow(RangeError);
  });
});

describe('secureShuffle', () => {
  it('returns a permutation without mutating the input', () => {
    const input = ['a', 'b', 'c', 'd'];
    const { source } = sourceFromValues([0, 0, 0]);

    const shuffled = secureShuffle(input, source);

    expect(shuffled).toEqual(['b', 'c', 'd', 'a']);
    expect([...shuffled].sort()).toEqual([...input].sort());
    expect(input).toEqual(['a', 'b', 'c', 'd']);
  });
});
