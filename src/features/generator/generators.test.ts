import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  AMBIGUOUS_CHARACTERS,
  CONSONANTS,
  DIGITS,
  GenerationError,
  LOWERCASE,
  SYMBOLS,
  UPPERCASE,
  VOWELS,
  generatePassphrase,
  generatePassword,
  generatePin,
  generatePronounceable,
} from './generators';
import {
  DEFAULT_PASSPHRASE_OPTIONS,
  DEFAULT_PASSWORD_OPTIONS,
  DEFAULT_PIN_OPTIONS,
  DEFAULT_PRONOUNCEABLE_OPTIONS,
  type PassphraseSeparator,
  type PasswordOptions,
} from './types';
import { strengthLabelFromEntropy } from './strength';

const ALL_CLASSES: PasswordOptions = {
  ...DEFAULT_PASSWORD_OPTIONS,
  length: 20,
  ensureEachClass: true,
};

const TEST_WORDS = ['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot'];
const TEST_WORD_LIST = { words: TEST_WORDS, size: TEST_WORDS.length };

describe('generatePassword', () => {
  it('returns the exact requested length', () => {
    fc.assert(
      fc.property(fc.integer({ min: 4, max: 128 }), (length) => {
        const output = generatePassword({ ...ALL_CLASSES, length });
        return output.value.length === length;
      }),
      { numRuns: 200 },
    );
  });

  it('includes every selected character class when required', () => {
    fc.assert(
      fc.property(fc.integer({ min: 4, max: 128 }), (length) => {
        const value = generatePassword({ ...ALL_CLASSES, length }).value;

        return (
          /[a-z]/.test(value) &&
          /[A-Z]/.test(value) &&
          /[0-9]/.test(value) &&
          [...SYMBOLS].some((symbol) => value.includes(symbol))
        );
      }),
      { numRuns: 200 },
    );
  });

  it('never includes excluded characters', () => {
    const output = generatePassword({
      ...ALL_CLASSES,
      ensureEachClass: false,
      excludedCharacters: 'abcABC012',
    });

    expect(output.value).not.toMatch(/[abcABC012]/);
  });

  it('removes ambiguous characters when requested', () => {
    const output = generatePassword({
      ...DEFAULT_PASSWORD_OPTIONS,
      length: 64,
      ensureEachClass: false,
      excludeAmbiguous: true,
    });

    for (const character of AMBIGUOUS_CHARACTERS) {
      expect(output.value).not.toContain(character);
    }
  });

  it('rejects an empty character-class selection', () => {
    expect(() =>
      generatePassword({
        ...DEFAULT_PASSWORD_OPTIONS,
        useLowercase: false,
        useUppercase: false,
        useDigits: false,
        useSymbols: false,
      }),
    ).toThrow(GenerationError);
  });

  it('rejects a selected class that is fully excluded', () => {
    expect(() =>
      generatePassword({
        ...DEFAULT_PASSWORD_OPTIONS,
        useUppercase: false,
        useDigits: false,
        useSymbols: false,
        excludedCharacters: LOWERCASE,
      }),
    ).toThrow(GenerationError);
  });

  it('rejects invalid lengths', () => {
    expect(() => generatePassword({ ...ALL_CLASSES, length: 3 })).toThrow(GenerationError);
    expect(() => generatePassword({ ...ALL_CLASSES, length: 257 })).toThrow(GenerationError);
    expect(() => generatePassword({ ...ALL_CLASSES, length: 12.5 })).toThrow(GenerationError);
  });

  it('reports estimated entropy and a label', () => {
    const output = generatePassword(ALL_CLASSES);

    expect(output.mode).toBe('password');
    expect(output.entropyBits).toBeGreaterThan(0);
    expect(output.label).toBe(strengthLabelFromEntropy(output.entropyBits));
  });
});

describe('generatePassphrase', () => {
  it('returns the requested number of words', () => {
    fc.assert(
      fc.property(fc.integer({ min: 3, max: 12 }), (wordCount) => {
        const output = generatePassphrase(
          { ...DEFAULT_PASSPHRASE_OPTIONS, wordCount, separator: '-' },
          TEST_WORD_LIST,
        );
        const words = output.value.split('-');

        return words.length === wordCount && words.every((word) => TEST_WORDS.includes(word));
      }),
      { numRuns: 100 },
    );
  });

  it('applies first-word capitalization', () => {
    const output = generatePassphrase(
      { ...DEFAULT_PASSPHRASE_OPTIONS, capitalization: 'first', separator: '-' },
      TEST_WORD_LIST,
    );
    const words = output.value.split('-');

    expect(words[0][0]).toBe(words[0][0].toUpperCase());
    expect(words.slice(1).every((word) => word === word.toLowerCase())).toBe(true);
  });

  it('applies all-word capitalization', () => {
    const output = generatePassphrase(
      { ...DEFAULT_PASSPHRASE_OPTIONS, capitalization: 'all', separator: '-' },
      TEST_WORD_LIST,
    );

    for (const word of output.value.split('-')) {
      expect(word[0]).toBe(word[0].toUpperCase());
    }
  });

  it('supports each separator', () => {
    for (const separator of [' ', '-', '.', '_', ''] as const) {
      const output = generatePassphrase(
        { ...DEFAULT_PASSPHRASE_OPTIONS, wordCount: 3, separator },
        TEST_WORD_LIST,
      );

      if (separator === '') {
        expect(output.value.length).toBeGreaterThan(0);
      } else {
        expect(output.value.split(separator)).toHaveLength(3);
      }
    }
  });

  it('rejects invalid word counts and separators', () => {
    expect(() =>
      generatePassphrase({ ...DEFAULT_PASSPHRASE_OPTIONS, wordCount: 2 }, TEST_WORD_LIST),
    ).toThrow(GenerationError);
    expect(() =>
      generatePassphrase({ ...DEFAULT_PASSPHRASE_OPTIONS, wordCount: 13 }, TEST_WORD_LIST),
    ).toThrow(GenerationError);
    expect(() =>
      generatePassphrase(
        {
          ...DEFAULT_PASSPHRASE_OPTIONS,
          separator: '/' as unknown as PassphraseSeparator,
        },
        TEST_WORD_LIST,
      ),
    ).toThrow(GenerationError);
  });

  it('rejects an empty word list', () => {
    expect(() => generatePassphrase(DEFAULT_PASSPHRASE_OPTIONS, { words: [], size: 0 })).toThrow(
      GenerationError,
    );
  });
});

describe('generatePin', () => {
  it('returns only digits at the requested length', () => {
    fc.assert(
      fc.property(fc.integer({ min: 4, max: 32 }), (length) => {
        const output = generatePin({ length });

        return (
          output.value.length === length &&
          [...output.value].every((digit) => DIGITS.includes(digit))
        );
      }),
      { numRuns: 100 },
    );
  });

  it('rejects invalid lengths', () => {
    expect(() => generatePin({ length: 3 })).toThrow(GenerationError);
    expect(() => generatePin({ length: 33 })).toThrow(GenerationError);
  });

  it('reports entropy and a label', () => {
    const output = generatePin(DEFAULT_PIN_OPTIONS);

    expect(output.mode).toBe('pin');
    expect(output.entropyBits).toBeGreaterThan(0);
    expect(output.label).toBe(strengthLabelFromEntropy(output.entropyBits));
  });
});

describe('generatePronounceable', () => {
  it('follows the consonant-vowel pattern', () => {
    fc.assert(
      fc.property(fc.integer({ min: 6, max: 32 }), (length) => {
        const value = generatePronounceable({ length, capitalize: false }).value;

        return (
          value.length === length &&
          [...value].every((character, index) =>
            index % 2 === 0 ? CONSONANTS.includes(character) : VOWELS.includes(character),
          )
        );
      }),
      { numRuns: 100 },
    );
  });

  it('capitalizes the first character when requested', () => {
    const output = generatePronounceable({ ...DEFAULT_PRONOUNCEABLE_OPTIONS, capitalize: true });

    expect(output.value[0]).toBe(output.value[0].toUpperCase());
    expect(CONSONANTS.toUpperCase()).toContain(output.value[0]);
  });

  it('rejects invalid lengths', () => {
    expect(() => generatePronounceable({ length: 3, capitalize: false })).toThrow(GenerationError);
    expect(() => generatePronounceable({ length: 65, capitalize: false })).toThrow(GenerationError);
  });
});

describe('strengthLabelFromEntropy', () => {
  it('maps entropy thresholds to labels', () => {
    expect(strengthLabelFromEntropy(0)).toBe('critical');
    expect(strengthLabelFromEntropy(28)).toBe('weak');
    expect(strengthLabelFromEntropy(40)).toBe('fair');
    expect(strengthLabelFromEntropy(60)).toBe('good');
    expect(strengthLabelFromEntropy(80)).toBe('strong');
    expect(strengthLabelFromEntropy(100)).toBe('excellent');
  });
});

describe('character constants', () => {
  it('exposes distinct, non-empty character classes', () => {
    expect(LOWERCASE).toHaveLength(26);
    expect(UPPERCASE).toHaveLength(26);
    expect(DIGITS).toHaveLength(10);
    expect(SYMBOLS.length).toBeGreaterThan(0);
    expect(new Set(SYMBOLS).size).toBe(SYMBOLS.length);
  });
});
