import type { StrengthLabel } from '../../types/security';

export type GeneratorMode = 'password' | 'passphrase' | 'pin' | 'pronounceable';

export type PassphraseSeparator = ' ' | '-' | '.' | '_' | '';
export type Capitalization = 'none' | 'first' | 'all';

export interface PasswordOptions {
  length: number;
  useLowercase: boolean;
  useUppercase: boolean;
  useDigits: boolean;
  useSymbols: boolean;
  ensureEachClass: boolean;
  excludeAmbiguous: boolean;
  excludedCharacters: string;
}

export interface PassphraseOptions {
  wordCount: number;
  separator: PassphraseSeparator;
  capitalization: Capitalization;
}

export interface PinOptions {
  length: number;
}

export interface PronounceableOptions {
  length: number;
  capitalize: boolean;
}

export interface GeneratorOutput {
  value: string;
  mode: GeneratorMode;
  entropyBits: number;
  label: StrengthLabel;
  note: string;
}

export const DEFAULT_PASSWORD_OPTIONS: PasswordOptions = {
  length: 20,
  useLowercase: true,
  useUppercase: true,
  useDigits: true,
  useSymbols: true,
  ensureEachClass: true,
  excludeAmbiguous: false,
  excludedCharacters: '',
};

export const DEFAULT_PASSPHRASE_OPTIONS: PassphraseOptions = {
  wordCount: 5,
  separator: '-',
  capitalization: 'none',
};

export const DEFAULT_PIN_OPTIONS: PinOptions = {
  length: 6,
};

export const DEFAULT_PRONOUNCEABLE_OPTIONS: PronounceableOptions = {
  length: 14,
  capitalize: true,
};
