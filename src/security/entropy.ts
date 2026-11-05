export const CRACK_TIME_ASSUMPTIONS = {
  online: 1_000,
  offline: 100_000_000_000,
} as const;

export function entropyBits(poolSize: number, length: number): number {
  if (!Number.isFinite(poolSize) || !Number.isFinite(length) || poolSize <= 1 || length <= 0) {
    return 0;
  }

  return length * Math.log2(poolSize);
}

export function passphraseEntropyBits(wordListSize: number, wordCount: number): number {
  if (
    !Number.isFinite(wordListSize) ||
    !Number.isFinite(wordCount) ||
    wordListSize <= 1 ||
    wordCount <= 0
  ) {
    return 0;
  }

  return wordCount * Math.log2(wordListSize);
}

export function pinEntropyBits(length: number): number {
  return entropyBits(10, length);
}

export interface CrackTimeEstimate {
  seconds: number;
  label: string;
}

export function estimateCrackTime(entropy: number, guessesPerSecond: number): CrackTimeEstimate {
  if (!Number.isFinite(entropy) || entropy <= 0) {
    return { seconds: 0, label: 'instantly' };
  }

  const averageGuesses = 2 ** Math.min(entropy, 1023) / 2;
  const seconds = averageGuesses / guessesPerSecond;

  return {
    seconds,
    label: formatDuration(seconds),
  };
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds)) {
    return 'longer than the age of the universe';
  }

  if (seconds < 1) {
    return 'less than a second';
  }

  if (seconds < 60) {
    return `${Math.round(seconds)} seconds`;
  }

  const minutes = seconds / 60;
  if (minutes < 60) {
    return formatUnit(minutes, 'minute');
  }

  const hours = minutes / 60;
  if (hours < 24) {
    return formatUnit(hours, 'hour');
  }

  const days = hours / 24;
  if (days < 365) {
    return formatUnit(days, 'day');
  }

  const years = days / 365.25;
  if (years < 1_000_000) {
    return formatUnit(years, 'year');
  }

  return 'longer than a million years';
}

function formatUnit(value: number, unit: string): string {
  const rounded = value >= 10 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded.toLocaleString('en-US')} ${unit}${rounded === 1 ? '' : 's'}`;
}
