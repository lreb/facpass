import { secureRandomChoice, secureShuffle, type RandomByteSource } from '../../security/random';
import { entropyBits, passphraseEntropyBits, pinEntropyBits } from '../../security/entropy';
import type {
  GeneratorOutput,
  PassphraseOptions,
  PasswordOptions,
  PinOptions,
  PronounceableOptions,
} from './types';
import type { WordList } from './wordlists/eff-large';
import { strengthLabelFromEntropy } from './strength';

export const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
export const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const DIGITS = '0123456789';
export const SYMBOLS = '!@#$%^&*()-_=+[]{};:,.?/';
export const AMBIGUOUS_CHARACTERS = 'O0Il1|`\'"';
export const CONSONANTS = 'bcdfghjklmnpqrstvwxyz';
export const VOWELS = 'aeiou';

const PASSWORD_MIN_LENGTH = 4;
const PASSWORD_MAX_LENGTH = 256;
const PIN_MIN_LENGTH = 4;
const PIN_MAX_LENGTH = 32;
const PASSPHRASE_MIN_WORDS = 3;
const PASSPHRASE_MAX_WORDS = 12;
const PRONOUNCEABLE_MIN_LENGTH = 4;
const PRONOUNCEABLE_MAX_LENGTH = 64;
const ALLOWED_SEPARATORS = [' ', '-', '.', '_', ''] as const;

export class GenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GenerationError';
  }
}

export function generatePassword(
  options: PasswordOptions,
  source?: RandomByteSource,
): GeneratorOutput {
  if (
    !Number.isInteger(options.length) ||
    options.length < PASSWORD_MIN_LENGTH ||
    options.length > PASSWORD_MAX_LENGTH
  ) {
    throw new GenerationError(
      `Password length must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH}.`,
    );
  }

  const { pools, combined } = buildCharacterPools(options);
  const characters = [...combined];

  let valueCharacters: string[];

  if (options.ensureEachClass) {
    if (options.length < pools.length) {
      throw new GenerationError(
        `Length must be at least ${pools.length} to include every selected character class.`,
      );
    }

    const required = pools.map((pool) => secureRandomChoice([...pool], source));
    const remaining = Array.from({ length: options.length - required.length }, () =>
      secureRandomChoice(characters, source),
    );
    valueCharacters = secureShuffle([...required, ...remaining], source);
  } else {
    valueCharacters = Array.from({ length: options.length }, () =>
      secureRandomChoice(characters, source),
    );
  }

  const entropy = entropyBits(combined.length, options.length);

  return {
    value: valueCharacters.join(''),
    mode: 'password',
    entropyBits: entropy,
    label: strengthLabelFromEntropy(entropy),
    note: `Randomly selected from ${combined.length} allowed characters using Web Crypto.${
      options.ensureEachClass ? ' Each selected class is represented at least once.' : ''
    }`,
  };
}

export function generatePassphrase(
  options: PassphraseOptions,
  wordList: WordList,
  source?: RandomByteSource,
): GeneratorOutput {
  if (
    !Number.isInteger(options.wordCount) ||
    options.wordCount < PASSPHRASE_MIN_WORDS ||
    options.wordCount > PASSPHRASE_MAX_WORDS
  ) {
    throw new GenerationError(
      `Passphrase word count must be between ${PASSPHRASE_MIN_WORDS} and ${PASSPHRASE_MAX_WORDS}.`,
    );
  }

  if (!ALLOWED_SEPARATORS.includes(options.separator)) {
    throw new GenerationError('The selected separator is not supported.');
  }

  if (wordList.size < 2 || wordList.words.length === 0) {
    throw new GenerationError('The local passphrase word list is unavailable.');
  }

  const words = Array.from({ length: options.wordCount }, (_, index) => {
    const word = secureRandomChoice(wordList.words, source);

    if (options.capitalization === 'all') {
      return capitalize(word);
    }

    if (options.capitalization === 'first' && index === 0) {
      return capitalize(word);
    }

    return word;
  });

  const entropy = passphraseEntropyBits(wordList.size, options.wordCount);

  return {
    value: words.join(options.separator),
    mode: 'passphrase',
    entropyBits: entropy,
    label: strengthLabelFromEntropy(entropy),
    note: `Each word was chosen with Web Crypto from a local list of ${wordList.size.toLocaleString(
      'en-US',
    )} words. Strength depends on the word-list size and the number of words.`,
  };
}

export function generatePin(options: PinOptions, source?: RandomByteSource): GeneratorOutput {
  if (
    !Number.isInteger(options.length) ||
    options.length < PIN_MIN_LENGTH ||
    options.length > PIN_MAX_LENGTH
  ) {
    throw new GenerationError(
      `PIN length must be between ${PIN_MIN_LENGTH} and ${PIN_MAX_LENGTH}.`,
    );
  }

  const value = Array.from({ length: options.length }, () =>
    secureRandomChoice([...DIGITS], source),
  ).join('');
  const entropy = pinEntropyBits(options.length);

  return {
    value,
    mode: 'pin',
    entropyBits: entropy,
    label: strengthLabelFromEntropy(entropy),
    note: 'A uniformly random decimal PIN. Online rate limits matter; offline attacks can try many combinations.',
  };
}

export function generatePronounceable(
  options: PronounceableOptions,
  source?: RandomByteSource,
): GeneratorOutput {
  if (
    !Number.isInteger(options.length) ||
    options.length < PRONOUNCEABLE_MIN_LENGTH ||
    options.length > PRONOUNCEABLE_MAX_LENGTH
  ) {
    throw new GenerationError(
      `Pronounceable length must be between ${PRONOUNCEABLE_MIN_LENGTH} and ${PRONOUNCEABLE_MAX_LENGTH}.`,
    );
  }

  const consonants = [...CONSONANTS];
  const vowels = [...VOWELS];
  const characters = Array.from({ length: options.length }, (_, index) => {
    const pool = index % 2 === 0 ? consonants : vowels;
    return secureRandomChoice(pool, source);
  });

  if (options.capitalize) {
    characters[0] = characters[0].toUpperCase();
  }

  const consonantCount = Math.ceil(options.length / 2);
  const vowelCount = Math.floor(options.length / 2);
  const entropy =
    consonantCount * Math.log2(consonants.length) + vowelCount * Math.log2(vowels.length);

  return {
    value: characters.join(''),
    mode: 'pronounceable',
    entropyBits: entropy,
    label: strengthLabelFromEntropy(entropy),
    note: 'Pronounceable passwords follow a limited consonant-vowel grammar, so they have less entropy than fully random passwords of the same length.',
  };
}

function buildCharacterPools(options: PasswordOptions): {
  pools: string[];
  combined: string;
} {
  const pools: string[] = [];

  if (options.useLowercase) {
    pools.push(filterCharacters(LOWERCASE, options));
  }
  if (options.useUppercase) {
    pools.push(filterCharacters(UPPERCASE, options));
  }
  if (options.useDigits) {
    pools.push(filterCharacters(DIGITS, options));
  }
  if (options.useSymbols) {
    pools.push(filterCharacters(SYMBOLS, options));
  }

  if (pools.length === 0) {
    throw new GenerationError('Enable at least one character class.');
  }

  if (pools.some((pool) => pool.length === 0)) {
    throw new GenerationError(
      'A selected character class has no remaining characters after exclusions.',
    );
  }

  const combined = Array.from(new Set(pools.join(''))).join('');

  return { pools, combined };
}

function filterCharacters(characters: string, options: PasswordOptions): string {
  const excluded = new Set([
    ...(options.excludeAmbiguous ? AMBIGUOUS_CHARACTERS : ''),
    ...options.excludedCharacters,
  ]);

  return [...characters].filter((character) => !excluded.has(character)).join('');
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
