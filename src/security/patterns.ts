import type { Finding } from '../types/security';
import { getCharacterClassInfo } from './character-classes';
import { COMMON_PASSWORD_FRAGMENTS, COMMON_PASSWORDS } from './common-passwords';
import { COMMON_WORDS } from './dictionaries';

const KEYBOARD_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm', '1234567890'];

export function detectCommonPassword(value: string): Finding | null {
  const normalized = value.toLowerCase();

  if (COMMON_PASSWORDS.has(normalized)) {
    return {
      id: 'common-password',
      severity: 'critical',
      title: 'This is a commonly used password',
      detail:
        'It appears in widely used password lists, so attackers try it early in guessing attacks.',
      recommendation: 'Generate a new random password or a longer passphrase.',
    };
  }

  const fragment = COMMON_PASSWORD_FRAGMENTS.find((entry) => normalized.includes(entry));
  if (fragment) {
    return {
      id: 'common-password-fragment',
      severity: 'warning',
      title: 'It contains a common password fragment',
      detail:
        'Common words and sequences make guessing faster, even when the whole value is not on a list.',
      recommendation:
        'Use a fully random generated value or a longer, randomly generated passphrase.',
    };
  }

  return null;
}

export function detectRepeatedPattern(value: string): Finding | null {
  const length = value.length;

  for (let blockSize = 1; blockSize <= Math.min(8, Math.floor(length / 2)); blockSize += 1) {
    for (let start = 0; start + blockSize * 2 <= length; start += 1) {
      const block = value.slice(start, start + blockSize);
      let repetitions = 1;
      let cursor = start + blockSize;

      while (cursor + blockSize <= length && value.slice(cursor, cursor + blockSize) === block) {
        repetitions += 1;
        cursor += blockSize;
      }

      if ((blockSize === 1 && repetitions >= 3) || (blockSize >= 2 && repetitions >= 2)) {
        return {
          id: 'repeated-pattern',
          severity: 'warning',
          title: 'Repeated characters or blocks',
          detail:
            'Repetition reduces the effective search space and is one of the first patterns attackers test.',
          recommendation: 'Remove repeated blocks and use a randomly generated value instead.',
        };
      }
    }
  }

  return null;
}

export function detectSequentialRun(value: string): Finding | null {
  const normalized = value.toLowerCase();
  let runLength = 1;
  let direction = 0;

  for (let index = 1; index < normalized.length; index += 1) {
    const difference = normalized.charCodeAt(index) - normalized.charCodeAt(index - 1);

    if (difference === 1 || difference === -1) {
      if (difference === direction) {
        runLength += 1;
      } else {
        direction = difference;
        runLength = 2;
      }

      if (runLength >= 3) {
        return {
          id: 'sequential-run',
          severity: 'warning',
          title: 'Sequential characters',
          detail:
            'Sequences such as abc or 321 are predictable and are tested early by password crackers.',
          recommendation: 'Avoid keyboard or alphabet sequences; use a random generator.',
        };
      }
    } else {
      direction = 0;
      runLength = 1;
    }
  }

  return null;
}

export function detectKeyboardPattern(value: string): Finding | null {
  const normalized = value.toLowerCase();

  for (const row of KEYBOARD_ROWS) {
    for (let start = 0; start + 4 <= row.length; start += 1) {
      const segment = row.slice(start, start + 4);
      const reversed = [...segment].reverse().join('');

      if (normalized.includes(segment) || normalized.includes(reversed)) {
        return {
          id: 'keyboard-pattern',
          severity: 'warning',
          title: 'Keyboard pattern detected',
          detail:
            'Characters that sit next to each other on a keyboard are easier to guess than random characters.',
          recommendation: 'Use a random password or a passphrase with several random words.',
        };
      }
    }
  }

  return null;
}

export function detectYear(value: string): Finding | null {
  if (/(?:^|\D)(?:19|20)\d{2}(?:\D|$)/.test(value)) {
    return {
      id: 'year-pattern',
      severity: 'info',
      title: 'Possible year or date fragment',
      detail:
        'Years and dates are common in human-chosen passwords and are included in many guessing rules.',
      recommendation: 'Prefer values that are not based on dates, names, or personal details.',
    };
  }

  return null;
}

export function detectDictionaryWord(value: string): Finding | null {
  const normalized = value.toLowerCase();

  for (const word of COMMON_WORDS) {
    if (word.length >= 4 && normalized.includes(word)) {
      return {
        id: 'dictionary-word',
        severity: 'warning',
        title: 'Dictionary word detected',
        detail:
          'Dictionary words can make a password easier to guess, especially when only one or two words are used.',
        recommendation:
          'Use several randomly selected words from a large word list, or use a random password.',
      };
    }
  }

  return null;
}

export function detectLowDiversity(value: string): Finding | null {
  const classes = getCharacterClassInfo(value).classes;

  if (classes < 3) {
    return {
      id: 'low-diversity',
      severity: 'warning',
      title: 'Limited character variety',
      detail: 'Using fewer character types gives an attacker a smaller search space to cover.',
      recommendation:
        'Enable more character classes for random passwords, or use a multi-word passphrase.',
    };
  }

  return null;
}

export function detectShortLength(value: string): Finding | null {
  if (value.length < 8) {
    return {
      id: 'short-password',
      severity: 'critical',
      title: 'Password is too short',
      detail: 'Short passwords can be guessed quickly, even when they use several character types.',
      recommendation: 'Use at least 12 characters; 16 or more is better for random passwords.',
    };
  }

  if (value.length < 12) {
    return {
      id: 'modest-length',
      severity: 'warning',
      title: 'Length could be stronger',
      detail: 'Passwords under 12 characters have less margin against offline guessing.',
      recommendation: 'Increase the length to at least 12 characters, preferably 16 or more.',
    };
  }

  return null;
}

export function buildFindings(value: string): Finding[] {
  return [
    detectCommonPassword(value),
    detectShortLength(value),
    detectRepeatedPattern(value),
    detectSequentialRun(value),
    detectKeyboardPattern(value),
    detectDictionaryWord(value),
    detectLowDiversity(value),
    detectYear(value),
  ].filter((finding): finding is Finding => finding !== null);
}
